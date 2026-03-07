'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteOffer, toggleOfferActive } from '@/actions/offers'
import { useState } from 'react'

interface Offer {
  id: string
  title: string
  price: string
  photo_url: string | null
  active: boolean
  created_at: string
}

export function OffersList({ offers }: { offers: Offer[] }) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (offerId: string) => {
    if (!confirm('Tem certeza que quer deletar essa oferta?')) {
      return
    }

    setDeleting(offerId)
    try {
      await deleteOffer(offerId)
    } catch (error) {
      alert('Erro ao deletar: ' + (error as Error).message)
      setDeleting(null)
    }
  }

  const handleToggle = async (offerId: string, active: boolean) => {
    try {
      await toggleOfferActive(offerId, active)
    } catch (error) {
      alert('Erro ao atualizar: ' + (error as Error).message)
    }
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium mb-4">📭 Nenhuma oferta cadastrada ainda.</p>
        <p className="text-sm text-gray-400">Comece criando sua primeira oferta acima!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 mb-4">📋 Suas Ofertas Ativas</h3>
      
      {offers.map((offer) => (
        <Card 
          key={offer.id}
          className={`overflow-hidden border transition-all ${
            !offer.active ? 'opacity-50 border-gray-300' : 'border-slate-200'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Thumbnail */}
              {offer.photo_url && (
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={offer.photo_url}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 line-clamp-2">{offer.title}</h4>
                  <p className="text-lg font-bold text-red-600 mt-1">R$ {offer.price}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(offer.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={offer.active ? 'default' : 'outline'}
                    onClick={() => handleToggle(offer.id, offer.active)}
                    className="flex-1 text-xs"
                  >
                    {offer.active ? '✅ Ativa' : '❌ Inativa'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(offer.id)}
                    disabled={deleting === offer.id}
                    className="text-xs"
                  >
                    {deleting === offer.id ? '⏳ Deletando...' : '🗑️ Deletar'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}