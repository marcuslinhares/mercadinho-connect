import type { Metadata } from 'next'
import { t } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Favoritos | Mercadinho Connect',
  description: 'Seus produtos e ofertas favoritos em um só lugar.',
}

export default function FavoritesPage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">{t('pages.favorites')}</h1>
      {/* TODO: Implement favorites list */}
      <div className="text-center py-12 text-slate-500">
        <p>Seção de favoritos em desenvolvimento...</p>
      </div>
    </div>
  )
}
