/**
 * POST /api/offers/[id]/boost
 * Create a boost for an offer
 * Requires: JWT authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createPayment,
  PaymentCreateRequest,
  PaymentCreateResponse,
} from '@/lib/payment-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: offerId } = await params
    const body = await request.json()
    const supabaseClient = await createClient()

    // 1. Validate authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Validate input
    const { paymentMethod } = body

    if (!paymentMethod || !['stripe', 'mercado_pago'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method. Must be "stripe" or "mercado_pago"' },
        { status: 400 }
      )
    }

    // 3. Verify offer exists and get details
    const { data: offer, error: offerError } = await supabaseClient
      .from('offers')
      .select('id, user_id, title')
      .eq('id', offerId)
      .single()

    if (offerError || !offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // 4. Check if user already has active boost for this offer
    const { data: existingBoost } = await supabaseClient
      .from('boosts')
      .select('id')
      .eq('offer_id', offerId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingBoost) {
      return NextResponse.json(
        { error: 'This offer already has an active boost' },
        { status: 409 }
      )
    }

    // 5. Create payment (Stripe Payment Intent or Mercado Pago Preference)
    const paymentRequest: PaymentCreateRequest = {
      offerId,
      userId: user.id,
      amount: 1, // $0.01 in cents
      paymentMethod: paymentMethod as 'stripe' | 'mercado_pago',
      returnUrl: request.headers.get('referer') || undefined,
    }

    const paymentResponse: PaymentCreateResponse = await createPayment(
      paymentRequest,
      supabaseClient
    )

    // 6. Return response based on payment method
    return NextResponse.json(
      {
        boostId: paymentResponse.boostId,
        clientSecret: paymentResponse.clientSecret || null,
        redirectUrl: paymentResponse.redirectUrl || null,
        paymentMethod: paymentResponse.paymentMethod,
        amount: 0.01,
        currency: 'USD',
        boostDuration: 7,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Boost creation error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create boost payment',
        message:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
