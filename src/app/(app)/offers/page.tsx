import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ofertas | Mercadinho Connect',
  description: 'Confira todas as ofertas especiais e promoções disponíveis.',
}

export default function OffersPage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Ofertas Especiais</h1>
      {/* TODO: Implement offers list with filters */}
      <div className="text-center py-12 text-slate-500">
        <p>Seção de ofertas em desenvolvimento...</p>
      </div>
    </div>
  )
}
