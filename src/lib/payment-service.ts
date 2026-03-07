/**
 * Payment Service - Abstraction layer for Stripe & Mercado Pago
 * Handles Payment Intent/Preference creation, webhook validation, and transaction logging
 */

import Stripe from 'stripe'
import { MercadoPagoConfig, Preference } from 'mercadopago'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20',
})

// Initialize Mercado Pago
const mercadoPagoConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

const preferenceClient = new Preference(mercadoPagoConfig)

export interface PaymentCreateRequest {
  offerId: string
  userId: string
  amount: number // in USD cents (e.g., 1 = $0.01)
  paymentMethod: 'stripe' | 'mercado_pago'
  returnUrl?: string
}

export interface PaymentCreateResponse {
  boostId: string
  clientSecret?: string // For Stripe
  redirectUrl?: string // For Mercado Pago
  paymentMethod: 'stripe' | 'mercado_pago'
}

export interface PaymentWebhookPayload {
  id: string
  type: string
  data?: any
}

/**
 * Create a payment intent/preference based on payment method
 */
export async function createPayment(
  request: PaymentCreateRequest,
  supabaseClient: any
): Promise<PaymentCreateResponse> {
  const { offerId, userId, amount, paymentMethod, returnUrl } = request

  try {
    if (paymentMethod === 'stripe') {
      return await createStripePayment(
        offerId,
        userId,
        amount,
        supabaseClient,
        returnUrl
      )
    } else if (paymentMethod === 'mercado_pago') {
      return await createMercadoPagoPayment(
        offerId,
        userId,
        amount,
        supabaseClient,
        returnUrl
      )
    } else {
      throw new Error(`Unsupported payment method: ${paymentMethod}`)
    }
  } catch (error) {
    console.error('Payment creation error:', error)
    throw error
  }
}

/**
 * Create Stripe Payment Intent
 */
async function createStripePayment(
  offerId: string,
  userId: string,
  amount: number,
  supabaseClient: any,
  returnUrl?: string
): Promise<PaymentCreateResponse> {
  // Create Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.ceil(amount), // Stripe expects amount in cents
    currency: 'usd',
    metadata: {
      offerId,
      userId,
      boostId: undefined, // Will be set after boost is created
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })

  // Create boost record in database
  const { data: boost, error } = await supabaseClient
    .from('boosts')
    .insert({
      offer_id: offerId,
      user_id: userId,
      amount: amount / 100, // Convert cents to dollars for storage
      payment_method: 'stripe',
      status: 'pending',
      payment_id: paymentIntent.id,
      stripe_payment_intent_id: paymentIntent.id,
    })
    .select()
    .single()

  if (error) {
    // Clean up: cancel payment intent if boost creation fails
    await stripe.paymentIntents.cancel(paymentIntent.id)
    throw error
  }

  // Update Payment Intent metadata with boostId
  await stripe.paymentIntents.update(paymentIntent.id, {
    metadata: {
      offerId,
      userId,
      boostId: boost.id,
    },
  })

  return {
    boostId: boost.id,
    clientSecret: paymentIntent.client_secret!,
    paymentMethod: 'stripe',
  }
}

/**
 * Create Mercado Pago Preference
 */
async function createMercadoPagoPayment(
  offerId: string,
  userId: string,
  amount: number,
  supabaseClient: any,
  returnUrl?: string
): Promise<PaymentCreateResponse> {
  const amountInDollars = amount / 100

  // Create Preference
  const preference = await preferenceClient.create({
    body: {
      items: [
        {
          id: offerId,
          title: 'Offer Boost (7 days)',
          quantity: 1,
          unit_price: amountInDollars,
          currency_id: 'USD',
        },
      ],
      payer: {
        email: undefined, // Will be fetched from user if needed
      },
      metadata: {
        offerId,
        userId,
      },
      back_urls: {
        success: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/boost-success`,
        failure: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/boost-failed`,
        pending: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/boost-pending`,
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercado-pago`,
      auto_return: 'approved',
    },
  })

  // Create boost record
  const { data: boost, error } = await supabaseClient
    .from('boosts')
    .insert({
      offer_id: offerId,
      user_id: userId,
      amount: amountInDollars,
      payment_method: 'mercado_pago',
      status: 'pending',
      payment_id: preference.id,
      mercado_pago_preference_id: preference.id,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return {
    boostId: boost.id,
    redirectUrl: preference.init_point,
    paymentMethod: 'mercado_pago',
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(
  event: Stripe.Event,
  supabaseClient: any
): Promise<void> {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await updateBoostStatus(
        paymentIntent.metadata.boostId,
        'completed',
        supabaseClient
      )
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await updateBoostStatus(
        paymentIntent.metadata.boostId,
        'failed',
        supabaseClient,
        paymentIntent.last_payment_error?.message
      )
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      if (charge.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          charge.payment_intent as string
        )
        await updateBoostStatus(
          paymentIntent.metadata.boostId,
          'refunded',
          supabaseClient
        )
      }
      break
    }
  }
}

/**
 * Handle Mercado Pago webhook events
 */
export async function handleMercadoPagoWebhook(
  payload: PaymentWebhookPayload,
  supabaseClient: any
): Promise<void> {
  if (payload.type === 'payment') {
    const { data } = await supabaseClient
      .from('boosts')
      .select('id')
      .eq('mercado_pago_payment_id', payload.id)
      .single()

    if (!data) return

    // Fetch payment details from Mercado Pago
    // Implementation depends on Mercado Pago SDK version
    // This is placeholder for actual API call

    // For now, assume success if webhook fired
    await updateBoostStatus(data.id, 'completed', supabaseClient)
  }
}

/**
 * Validate webhook signature (Stripe)
 */
export function validateStripeSignature(
  body: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

/**
 * Validate webhook signature (Mercado Pago)
 */
export function validateMercadoPagoSignature(params: Record<string, any>): boolean {
  // Mercado Pago signature validation
  // Implement according to: https://developers.mercadopago.com/en/docs/webhooks/additional-info/ipn
  const signature = params['x-signature']
  const requestId = params['x-request-id']

  if (!signature || !requestId) {
    return false
  }

  // Verify signature (implementation depends on latest Mercado Pago docs)
  return true // Placeholder
}

/**
 * Update boost status in database
 */
async function updateBoostStatus(
  boostId: string,
  status: 'completed' | 'failed' | 'refunded' | 'expired',
  supabaseClient: any,
  errorMessage?: string
): Promise<void> {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (errorMessage) {
    updateData.error_message = errorMessage
  }

  const { error } = await supabaseClient
    .from('boosts')
    .update(updateData)
    .eq('id', boostId)

  if (error) {
    console.error('Failed to update boost status:', error)
    throw error
  }

  // If boost completed, trigger offer reordering (publish event)
  if (status === 'completed') {
    console.log(`Boost ${boostId} completed, triggering reorder`)
    // TODO: Emit event for offer list reordering
  }
}

/**
 * Reconcile transactions (background job)
 * Called periodically to ensure all payments are properly recorded
 */
export async function reconcileTransactions(
  supabaseClient: any
): Promise<void> {
  // Fetch pending boosts older than 30 minutes
  const { data: pendingBoosts, error } = await supabaseClient
    .from('boosts')
    .select('id, stripe_payment_intent_id, mercado_pago_payment_id')
    .eq('status', 'pending')
    .lt('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())

  if (error) {
    console.error('Reconciliation query error:', error)
    return
  }

  for (const boost of pendingBoosts || []) {
    try {
      if (boost.stripe_payment_intent_id) {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          boost.stripe_payment_intent_id
        )

        if (paymentIntent.status === 'succeeded') {
          await updateBoostStatus(boost.id, 'completed', supabaseClient)
        } else if (paymentIntent.status === 'requires_action') {
          // Still awaiting user action, keep pending
          continue
        } else {
          await updateBoostStatus(boost.id, 'failed', supabaseClient)
        }
      }
    } catch (error) {
      console.error(`Reconciliation error for boost ${boost.id}:`, error)
    }
  }
}
