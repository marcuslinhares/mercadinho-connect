import { createClient } from '@/lib/supabase/server'
import { OfferForm } from '@/components/offers/OfferForm'
import { OffersList } from '@/components/offers/OffersList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - Dashboard | Mercadinho Connect',
  description: 'Painel administrativo para gerenciar ofertas e promoções',
  robots: 'noindex, nofollow', // Não indexar área admin
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg sticky top-0 z-10">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <span className="text-3xl">🎛️</span>
          <span>Dashboard do Mercadinho</span>
        </h1>
        <p className="text-blue-100 mt-1 text-sm">Gerencie suas ofertas em tempo real</p>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-12 max-w-3xl mx-auto space-y-8">
        {/* Form Section */}
        <section>
          <OfferForm />
        </section>

        {/* Offers List Section */}
        <section>
          <OffersList offers={offers || []} />
        </section>

        {/* Info Section */}
        <section className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📚</span> Como funciona?
          </h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="text-lg flex-shrink-0">1️⃣</span>
              <span>Tire uma foto clara do produto (luz natural é melhor!)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lg flex-shrink-0">2️⃣</span>
              <span>Coloque o nome do produto e o preço</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lg flex-shrink-0">3️⃣</span>
              <span>Clique em &quot;Publicar Oferta&quot;</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lg flex-shrink-0">4️⃣</span>
              <span>Suas ofertas aparecem na página pública automaticamente!</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lg flex-shrink-0">5️⃣</span>
              <span>Compartilhe o link no WhatsApp com um clique</span>
            </li>
          </ul>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium mb-1">Ofertas Ativas</p>
            <p className="text-4xl font-bold text-green-600">
              {offers?.filter(o => o.active).length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium mb-1">Total de Ofertas</p>
            <p className="text-4xl font-bold text-blue-600">
              {offers?.length || 0}
            </p>
          </div>
        </section>

        {/* Footer Tips */}
        <section className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
          <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
            <span>⚡</span> Dicas de Ouro
          </h4>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li>• <strong>Atualize frequentemente:</strong> Ofertas novas aparecem no topo da lista</li>
            <li>• <strong>Fotos nítidas:</strong> Use boa luz e enquadre bem o produto</li>
            <li>• <strong>Preços atrativos:</strong> Destaque a economia (ex: &quot;Era R$ 10, agora R$ 5!&quot;)</li>
            <li>• <strong>Horários:</strong> Publique no horário em que seus clientes costumam comprar</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
