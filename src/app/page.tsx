import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { ShowcaseClient } from '@/components/showcase/ShowcaseClient'

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
  const { data: offers } = await supabase.from('offers').select('*').order('created_at', { ascending: false })

  // JSON-LD para GEO (AI Citation Readiness)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Mercadinho Connect',
    description: 'Ofertas e promoções diárias do mercadinho do bairro',
    offers: offers?.map(offer => ({
      '@type': 'Offer',
      name: offer.title,
      price: offer.price,
      priceCurrency: 'BRL',
    })) || [],
  }

  return (
    <ShowcaseClient offers={offers || []} jsonLd={jsonLd} />
  )
}
