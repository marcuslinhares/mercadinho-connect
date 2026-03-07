/**
 * POST /api/webhooks/mercado-pago
 * Mercado Pago webhook handler for payment status updates
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  validateMercadoPagoSignature,
  handleMercadoPagoWebhook,
} from '@/lib/payment-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate signature
    const isValid = validateMercadoPagoSignature(
      Object.fromEntries(request.headers.entries())
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Get Supabase client
    const supabaseClient = await createClient()

    // Handle event
    await handleMercadoPagoWebhook(body, supabaseClient)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Mercado Pago webhook error:', error)

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
