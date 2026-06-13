import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ofertas do Dia | Mercadinho Connect',
  description:
    'Confira as melhores ofertas e promoções do mercadinho do bairro! Produtos frescos com preços imperdíveis.',
  openGraph: {
    title: 'Ofertas do Dia | Mercadinho Connect',
    description:
      'Confira as melhores ofertas e promoções do mercadinho do bairro!',
    type: 'website',
    locale: 'pt_BR',
  },
}

interface SearchParams {
  search?: string
  categoria?: string
}

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const search = params.search?.trim() || ''
  const categoria = params.categoria?.trim() || ''

  let query = supabase
    .from('offers')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (categoria) {
    query = query.eq('category', categoria)
  }

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

interface Offer {
  id: string
  title: string
  price: string
  photo_url?: string
  category?: string
  description?: string
}

  let offers: Offer[] = []
  let error: string | null = null

  try {
    const { data, error: supabaseError } = await query
    if (supabaseError) {
      console.error('Supabase error:', supabaseError)
      error = supabaseError.message
    } else {
      offers = data || []
    }
  } catch (err) {
    console.error('Error fetching offers:', err)
    error =
      err instanceof Error ? err.message : 'Erro desconhecido'
  }

  const categories = [
    { value: '', label: 'Todas' },
    { value: 'hortifruti', label: 'Hortifrúti' },
    { value: 'carnes', label: 'Carnes' },
    { value: 'laticinios', label: 'Laticínios' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'limpeza', label: 'Limpeza' },
    { value: 'higiene', label: 'Higiene' },
    { value: 'mercearia', label: 'Mercearia' },
    { value: 'geral', label: 'Geral' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="hover:underline">
            <h1 className="text-xl font-bold flex items-center gap-2">
              🍎 Mercadinho Connect
            </h1>
          </Link>
          <span className="text-xs bg-white text-red-600 px-2 py-0.5 rounded-full ml-auto">
            Ofertas de Hoje
          </span>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-4">
        {/* Search */}
        <form className="flex gap-2">
          <input
            name="search"
            defaultValue={search}
            placeholder="🔍 Buscar ofertas..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
          >
            Buscar
          </button>
        </form>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive =
              (!categoria && cat.value === '') ||
              categoria === cat.value
            return (
              <Link
                key={cat.value}
                href={
                  cat.value
                    ? `/ofertas?categoria=${cat.value}${search ? `&search=${search}` : ''}`
                    : `/ofertas${search ? `?search=${search}` : ''}`
                }
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-red-300'
                }`}
              >
                {cat.label}
              </Link>
            )
          })}
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mt-2">
          🔥 Promoções Imperdíveis
        </h2>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800">
            <p className="text-sm">
              <strong>ℹ️ Observação:</strong> {error}
            </p>
            <p className="text-xs mt-2">
              A tabela de ofertas pode estar vazia ou sem permissão de
              acesso.
            </p>
          </div>
        )}

        {!offers || offers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {search || categoria ? (
              <>
                <p>Nenhuma oferta encontrada. 😴</p>
                <Link
                  href="/ofertas"
                  className="text-blue-500 underline mt-2 block text-sm"
                >
                  Limpar filtros
                </Link>
              </>
            ) : (
              <>
                <p>Nenhuma oferta cadastrada ainda. 😴</p>
                <Link
                  href="/admin"
                  className="text-blue-500 underline mt-2 block"
                >
                  Sou o dono (Cadastrar)
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer: Offer) => (
              <Card
                key={offer.id}
                className="overflow-hidden border-none shadow-lg"
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
                  {/* Preço na foto */}
                  <div className="absolute bottom-0 left-0 bg-yellow-400 px-4 py-2 rounded-tr-xl shadow-sm">
                    <span className="text-xs font-bold text-yellow-900 uppercase block">
                      Por apenas
                    </span>
                    <span className="text-2xl font-black text-red-700">
                      R$ {offer.price}
                    </span>
                  </div>
                  {/* Categoria badge */}
                  {offer.category && offer.category !== 'geral' && (
                    <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      {categories.find((c) => c.value === offer.category)
                        ?.label || offer.category}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">
                    {offer.title}
                  </h2>
                  {offer.description && (
                    <p className="text-sm text-slate-500 mt-1">
                      {offer.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      asChild
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                    >
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`🛒 Oferta imperdível!\n\n${offer.title} - R$ ${offer.price}\n\nConfira mais: ${process.env.NEXT_PUBLIC_APP_URL || 'https://ofertas.marcuslinhares.com'}/ofertas`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        💬 Compartilhar
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
