import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'
import { OfferShowcase } from '@/components/offer-showcase'
import { getTopBoostedOffers } from '@/lib/boost-utils'

export const revalidate = 0 // Atualiza sempre que entrar (sem cache velho)

export const metadata: Metadata = {
  title: 'Ofertas do Dia | Mercadinho Connect',
  description: 'Confira as melhores ofertas e promoções do mercadinho do bairro! Produtos frescos com preços imperdíveis.',
  openGraph: {
    title: 'Ofertas do Dia | Mercadinho Connect',
    description: 'Confira as melhores ofertas e promoções do mercadinho do bairro!',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default async function ShowcasePage() {
  const supabase = await createClient()
  
  // Fetch offers
  const { data: offers } = await supabase.from('offers').select('*').order('created_at', { ascending: false })
  
  // Fetch boosted offers for reordering
  const boostedOffers = await getTopBoostedOffers(supabase, 100)
  const boostedOfferIds = new Set(boostedOffers.map(b => b.offerId))
  
  // Fetch boost info for all offers
  const { data: allBoosts } = await supabase
    .from('boosts')
    .select('offer_id, expires_at, status')
    .eq('status', 'completed')
    .gt('expires_at', new Date().toISOString())
  
  const boostMap = new Map(
    allBoosts?.map(b => [b.offer_id, b.expires_at]) || []
  )
  
  // Reorder offers: boosted first, then regular
  const sortedOffers = [
    ...(offers?.filter(o => boostedOfferIds.has(o.id)) || []),
    ...(offers?.filter(o => !boostedOfferIds.has(o.id)) || [])
  ]

  // JSON-LD para GEO (AI Citation Readiness)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Mercadinho Connect',
    description: 'Ofertas e promoções diárias do mercadinho do bairro',
    offers: sortedOffers?.map(offer => ({
      '@type': 'Offer',
      name: offer.title,
      price: offer.price,
      priceCurrency: 'BRL',
    })) || [],
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* JSON-LD para buscadores e AI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Cabeçalho */}
      <header className="bg-red-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          🍎 Mercadinho Connect
          <span className="text-xs bg-white text-red-600 px-2 py-0.5 rounded-full ml-auto">Ofertas de Hoje</span>
        </h1>
      </header>

      {/* Lista de Ofertas */}
      <main className="p-4 space-y-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">🔥 Promoções Imperdíveis</h2>
        
        {sortedOffers?.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Nenhuma oferta cadastrada ainda. 😴</p>
            <Link href="/admin" className="text-blue-500 underline mt-2 block">Sou o dono (Cadastrar)</Link>
          </div>
        ) : (
          sortedOffers?.map((offer) => (
            <OfferShowcase 
              key={offer.id} 
              offer={offer}
              boostExpiration={boostMap.get(offer.id) || null}
            />
          ))
        )}
      </main>

      {/* Botão Flutuante do Zap */}
      <div className="fixed bottom-6 right-6 left-6 max-w-md mx-auto">
        <a 
          href={`https://wa.me/?text=${encodeURIComponent('🔥 *Corre que tá barato!* Olha as ofertas de hoje no Mercadinho:\n\n' + (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg h-14 shadow-xl rounded-full animate-bounce">
            📲 Mandar no Grupo!
          </Button>
        </a>
      </div>
    </div>
  )
}
// Teste intencional para demonstrar card creation
