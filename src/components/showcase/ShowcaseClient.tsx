'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface Offer {
  id: string
  title: string
  price: string
  photo_url: string | null
  created_at: string
}

export function ShowcaseClient({ offers, jsonLd }: { offers: Offer[], jsonLd: Record<string, unknown> }) {
  const [isVisible] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      {/* JSON-LD para buscadores e AI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Cabeçalho com animação */}
      <header className={`bg-gradient-to-r from-red-600 to-red-700 text-white p-4 sticky top-0 z-10 shadow-lg transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <span className="text-3xl animate-pulse">🍎</span>
          <span>Mercadinho Connect</span>
          <span className="text-xs bg-white text-red-600 px-3 py-1 rounded-full ml-auto font-semibold whitespace-nowrap">Ofertas de Hoje</span>
        </h1>
      </header>

      {/* Lista de Ofertas com animação em cascata */}
      <main className="p-4 space-y-4 max-w-2xl mx-auto">
        <div className={`mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">🔥 Promoções Imperdíveis</h2>
          <p className="text-slate-600 text-sm">Confira as melhores ofertas do momento!</p>
        </div>
        
        {offers?.length === 0 ? (
          <div className={`text-center py-16 text-gray-500 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-5xl mb-4">😴</div>
            <p className="text-lg font-medium mb-4">Nenhuma oferta cadastrada ainda.</p>
            <Link href="/admin">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                ➕ Sou o dono (Cadastrar Oferta)
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers?.map((offer, index) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        )}
      </main>

      {/* Botão Flutuante do Zap com animação */}
      {offers && offers.length > 0 && (
        <div className={`fixed bottom-6 right-6 left-6 max-w-md mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <a 
            href={`https://wa.me/?text=${encodeURIComponent('🔥 *Corre que tá barato!* Olha as ofertas de hoje no Mercadinho:\n\n' + (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg h-14 shadow-2xl rounded-full transition-all duration-300 hover:scale-105 hover:shadow-green-200/50">
              📲 Compartilhar no WhatsApp
            </Button>
          </a>
        </div>
      )}
    </div>
  )
}

function OfferCard({ offer, index, isVisible }: { offer: Offer, index: number, isVisible: boolean }) {
  const [imgLoaded, setImgLoaded] = useState(false)

  const delay = index * 100
  
  return (
    <Card 
      className={`overflow-hidden border-none shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-500 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{
        transitionDelay: isVisible ? `${delay}ms` : '0ms'
      }}
    >
      <div className="relative h-64 w-full bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden group">
        {offer.photo_url && (
          <>
            {/* Placeholder shimmer enquanto carrega */}
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            )}
            <Image 
              src={offer.photo_url} 
              alt={offer.title} 
              fill 
              className={`object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              priority={index < 2}
            />
          </>
        )}
        
        {/* Overlay gradient ao hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Preço com animação */}
        <div className="absolute bottom-0 left-0 bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3 rounded-tr-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 origin-bottom-left">
          <span className="text-xs font-bold text-yellow-900 uppercase block tracking-wide">Por apenas</span>
          <span className="text-3xl font-black text-red-700 leading-tight">R$ {offer.price}</span>
        </div>
      </div>
      
      <CardContent className="p-4 bg-white">
        <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors duration-300">
          {offer.title}
        </h3>
        <p className="text-xs text-slate-500 mt-2">
          {new Date(offer.created_at).toLocaleDateString('pt-BR', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </CardContent>
    </Card>
  )
}
