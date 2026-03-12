'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BoostModalProps {
  offerId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface BoostResponse {
  boostId: string
  clientSecret?: string | null
  redirectUrl?: string | null
  paymentMethod: 'stripe' | 'mercado_pago'
  amount: number
  currency: string
  boostDuration: number
}

/**
 * FRONTEND-001: Boost Modal Component
 * Handles payment method selection and integration with backend
 */
export function BoostModal({
  offerId,
  isOpen,
  onClose,
  onSuccess,
}: BoostModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mercado_pago'>(
    'stripe'
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirmBoost = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Call backend to create boost payment
      const response = await fetch(`/api/offers/${offerId}/boost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create boost')
      }

      const boostData: BoostResponse = await response.json()

      // Handle payment based on method
      if (paymentMethod === 'stripe') {
        await handleStripePayment(boostData)
      } else if (paymentMethod === 'mercado_pago') {
        handleMercadoPagoPayment(boostData)
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Boost error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStripePayment = async (boostData: BoostResponse) => {
    if (!boostData.clientSecret) {
      throw new Error('No client secret received from server')
    }

    try {
      // In staging: simulate successful Stripe payment with clientSecret
      // In production: would integrate Stripe Elements or Payment Element
      if (!process.env.NEXT_PUBLIC_STRIPE_KEY) {
        throw new Error('Stripe key not configured')
      }

      // For staging: redirect to test payment confirmation
      // Real implementation would use Stripe.js confirmCardPayment
      const confirmationUrl = `/payment-confirmation?client_secret=${boostData.clientSecret}&boost_id=${boostData.boostId}`
      window.location.href = confirmationUrl
      
      return

      // Production code below (kept for reference):
      // const { loadStripe } = await import('@stripe/js')
      // const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)
      // const { error } = await stripe.confirmCardPayment(boostData.clientSecret, {
      //   payment_method: {
      //     card: {
      //       token: 'tok_visa',
      //     },
      //   },
      // })
      // if (error) {
      //   throw new Error(error.message || 'Payment failed')
      // }
    } catch (err) {
      if (err instanceof Error && err.message.includes('Cannot find module')) {
        // Stripe JS not available, show user-friendly message
        console.warn('Stripe integration not available in this build')
        throw new Error(
          'Payment gateway not configured. Please contact support.'
        )
      }
      throw err
    }
  }

  const handleMercadoPagoPayment = (boostData: BoostResponse) => {
    if (!boostData.redirectUrl) {
      throw new Error('No redirect URL received from server')
    }

    // Redirect user to Mercado Pago checkout
    window.location.href = boostData.redirectUrl
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900">
          <CardTitle className="text-2xl font-black">
            ⭐ Destacar Oferta
          </CardTitle>
          <p className="text-sm mt-2 text-slate-800 font-medium">
            Coloque sua oferta no topo por 7 dias!
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Price Display */}
          <div className="bg-slate-50 rounded-lg p-4 text-center border-2 border-dashed border-yellow-400">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              Preço por 7 dias
            </p>
            <p className="text-4xl font-black text-red-600">
              $0.01
              <span className="text-sm text-slate-500 ml-1 align-top">USD</span>
            </p>
            <p className="text-xs text-slate-600 mt-2">
              ✅ No topo da lista | 📊 Mais visibilidade | 🚀 Mais interessados
            </p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="font-bold text-slate-700">
              Escolha a forma de pagamento:
            </Label>

            {/* Stripe Option */}
            <button
              onClick={() => setPaymentMethod('stripe')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setPaymentMethod('stripe')
                }
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                paymentMethod === 'stripe'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
              aria-label="Selecionar cartão Stripe como forma de pagamento"
              aria-pressed={paymentMethod === 'stripe'}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'stripe'
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'stripe' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900">💳 Cartão Stripe</p>
                  <p className="text-xs text-slate-500">
                    Visa, Mastercard, Amex
                  </p>
                </div>
              </div>
            </button>

            {/* Mercado Pago Option */}
            <button
              onClick={() => setPaymentMethod('mercado_pago')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setPaymentMethod('mercado_pago')
                }
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                paymentMethod === 'mercado_pago'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 bg-white hover:border-yellow-300'
              }`}
              aria-label="Selecionar Mercado Pago como forma de pagamento"
              aria-pressed={paymentMethod === 'mercado_pago'}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'mercado_pago'
                      ? 'border-yellow-500 bg-yellow-500'
                      : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'mercado_pago' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    🏦 Mercado Pago
                  </p>
                  <p className="text-xs text-slate-500">
                    Cartão, PIX, boleto
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              data-testid="error-message"
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 font-medium"
            >
              ❌ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmBoost}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-bold shadow-lg"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Processando...
                </>
              ) : (
                <>✅ Confirmar Boost</>
              )}
            </Button>
          </div>

          {/* Info Footer */}
          <p className="text-xs text-slate-500 text-center">
            Seu pagamento é processado de forma segura. Nenhum dado é armazenado.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
