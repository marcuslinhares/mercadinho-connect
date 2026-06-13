import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { t } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Entrar | Mercadinho Connect',
  description:
    'Acesse o painel administrativo do Mercadinho Connect para gerenciar suas ofertas e promoções.',
  robots: 'noindex, nofollow',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Mercadinho Connect',
            description: 'Acesse o painel do dono do mercadinho',
            url: process.env.NEXT_PUBLIC_APP_URL ||
              'https://ofertas.marcuslinhares.com',
          }),
        }}
      />
      <h1 className="sr-only">{t('offer.boost_title')}</h1>
      <LoginForm />
    </div>
  )
}
