import Link from 'next/link'
import type { Metadata } from 'next'
import { t } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Mercadinho Connect — Ofertas do seu bairro no WhatsApp',
  description:
    'Transforme seu mercadinho em um sucesso digital. Cadastre ofertas em segundos, compartilhe no WhatsApp e atraia mais clientes.',
  openGraph: {
    title: 'Mercadinho Connect — Ofertas do seu bairro no WhatsApp',
    description:
      'Transforme seu mercadinho digital. Cadastre ofertas, compartilhe no WhatsApp e atraia mais clientes.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Mercadinho Connect',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-slate-50">
      {/* i18n: {t('landing.title')} */}
      {/* Header */}
      <header className="bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">🍎 Mercadinho Connect</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/ofertas" className="hover:underline">
              Ver Ofertas
            </Link>
            <Link
              href="/admin"
              className="bg-white text-red-600 px-3 py-1 rounded-full font-semibold hover:bg-red-50 transition"
            >
              Sou Dono
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
          📱 App de Bolso do Mercadinho
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
          Suas ofertas no
          <span className="text-red-600"> WhatsApp</span> sem complicação
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Cadastre as promoções do dia em segundos. Um link só pro cliente ver
          tudo. Chega de encher o grupo de foto.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/admin"
            className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 transition"
          >
            🚀 Quero Começar
          </Link>
          <Link
            href="/ofertas"
            className="bg-white text-slate-800 px-8 py-3 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-slate-300 transition"
          >
            👀 Ver Ofertas
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-center text-slate-800 mb-12">
          Como funciona?
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                {step.icon}
              </div>
              <h4 className="font-bold text-slate-800 mb-2">{step.title}</h4>
              <p className="text-sm text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white border-t border-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center text-slate-800 mb-12">
            Por que usar?
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex gap-4 items-start p-4 rounded-xl bg-slate-50"
              >
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <h4 className="font-semibold text-slate-800">{b.title}</h4>
                  <p className="text-sm text-slate-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600 text-white py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h3 className="text-3xl font-black mb-4">
            Pronto para digitalizar seu mercadinho?
          </h3>
          <p className="text-red-100 mb-8">
            Leva 2 minutos pra começar. Só tirar foto e publicar.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-white text-red-600 px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-red-50 transition"
          >
            ✅ Começar Agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-sm py-8 text-center">
        <p>🍎 Mercadinho Connect — Feito pro dono do mercadinho de bairro</p>
      </footer>
    </div>
  )
}

const steps = [
  {
    icon: '📸',
    title: 'Tire a Foto',
    desc: 'Abra a câmera, fotografe o produto e digite o preço. Só isso.',
  },
  {
    icon: '🔗',
    title: 'Compartilhe o Link',
    desc: 'Mande um único link no grupo do WhatsApp em vez de 30 fotos.',
  },
  {
    icon: '💰',
    title: 'Destaque Ofertas',
    desc: 'Pague centavos para destacar uma oferta no topo por 7 dias.',
  },
]

const benefits = [
  {
    icon: '📱',
    title: 'Mobile-first',
    desc: 'Funciona direto do celular. Sem app pra instalar.',
  },
  {
    icon: '⚡',
    title: 'Rápido',
    desc: 'Cadastro em menos de 30 segundos. Foto, nome, preço, pronto.',
  },
  {
    icon: '🔒',
    title: 'Profissional',
    desc: 'Card bonito com preço na foto. Passa confiança pro cliente.',
  },
  {
    icon: '📊',
    title: 'Métricas',
    desc: 'Saiba quantas pessoas viram suas ofertas e clicaram.',
  },
]
