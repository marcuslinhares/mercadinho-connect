'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { BoostModal } from './boost-modal'
import { BoostedBadge } from './boosted-badge'
import { t } from '@/lib/i18n'

interface Offer {
  id: string
  title: string
  price: string
  photo_url?: string
}

interface OfferShowcaseProps {
  offer: Offer
  boostExpiration: string | null
}

/**
 * FRONTEND-001 + FRONTEND-002 Integration
 * Combines offer card with boost button and boosted badge
 */
export function OfferShowcase({ offer, boostExpiration }: OfferShowcaseProps) {
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleBoostSuccess = () => {
    // Trigger a rerender by changing the key
    setRefreshKey(prev => prev + 1)
    // In a real app, you might also trigger a full page reload or use real-time updates via Supabase
  }

  const isBoosted = boostExpiration !== null

  return (
    <>
      <Card 
        key={refreshKey}
        data-testid="offer-card"
        data-offer-id={offer.id}
        className={`overflow-hidden border-none shadow-lg transition-all ${
          isBoosted ? 'ring-2 ring-yellow-400 shadow-xl' : ''
        }`}
      >
        <div className="relative h-64 w-full bg-gray-200">
          {offer.photo_url && (
            <Image 
              src={offer.photo_url} 
              alt={offer.title} 
              fill 
              className="object-cover"
            />
          )}
          
          {/* Preço colado na foto */}
          <div className="absolute bottom-0 left-0 bg-yellow-400 px-4 py-2 rounded-tr-xl shadow-sm">
            <span className="text-xs font-bold text-yellow-900 uppercase block">{t('offer.price_label')}</span>
            <span className="text-2xl font-black text-red-700">R$ {offer.price}</span>
          </div>

          {/* Boost Badge overlaid on image */}
          {isBoosted && boostExpiration && (
            <div className="absolute top-4 right-4">
              <BoostedBadge expiresAt={boostExpiration} showCountdown={true} />
            </div>
          )}
        </div>

        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800 leading-tight">
              {offer.title}
            </h2>
            {/* Secondary badge position (below title) */}
            {isBoosted && !boostExpiration && (
              <div className="mt-2">
                <BoostedBadge expiresAt={boostExpiration} showCountdown={false} />
              </div>
            )}
          </div>

          {/* Boost Button */}
          <Button
            data-testid="boost-button"
            onClick={() => setIsBoostModalOpen(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsBoostModalOpen(true) }}
            disabled={isBoosted}
            className={`flex-shrink-0 h-auto px-3 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
              isBoosted
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-md hover:shadow-lg'
            }`}
            title={isBoosted ? 'Esta oferta já está destacada' : 'Destacar por $0.01 USD'}
          >
            {isBoosted ? '✓ Destacada' : '⭐ Destacar'}
          </Button>
        </CardContent>
      </Card>

      {/* Boost Modal */}
      <BoostModal
        offerId={offer.id}
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        onSuccess={handleBoostSuccess}
      />
    </>
  )
}
