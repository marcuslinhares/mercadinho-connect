import type { Metadata } from 'next'
import { t } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Perfil | Mercadinho Connect',
  description: 'Gerenciar seu perfil e preferências.',
}

export default function ProfilePage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">{t('pages.profile')}</h1>
      {/* TODO: Implement profile management */}
      <div className="text-center py-12 text-slate-500">
        <p>Seção de perfil em desenvolvimento...</p>
      </div>
    </div>
  )
}
