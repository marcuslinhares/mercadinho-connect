/**
 * POST /api/webhooks/stripe
 * Stripe webhook handler for payment status updates
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  validateStripeSignature,
  handleStripeWebhook,
} from '@/lib/payment-service'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const body = await request.text()

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  try {
    // Validate signature
    const event: Stripe.Event = validateStripeSignature(body, signature)

    // Get Supabase client
    const supabaseClient = await createClient()

    // Handle event
    await handleStripeWebhook(event, supabaseClient)

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Stripe webhook error:', error)

    if (
      error instanceof Error &&
      error.message.includes('No matching signature found')
    ) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
