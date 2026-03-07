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
    // Get raw body for signature validation
    const body = await request.text()
    const parsedBody = JSON.parse(body)

    // Get headers for signature validation
    const headers = Object.fromEntries(request.headers.entries())

    // Validate signature
    const isValid = validateMercadoPagoSignature(headers, body)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Get Supabase client
    const supabaseClient = await createClient()

    // Handle event
    await handleMercadoPagoWebhook(parsedBody, supabaseClient)

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
