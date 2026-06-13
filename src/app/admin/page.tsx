import { createClient } from '@/lib/supabase/server'
import { createOffer } from '@/actions/offers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - Cadastrar Oferta | Mercadinho Connect',
  description:
    'Painel administrativo para cadastrar novas ofertas e promoções',
  robots: 'noindex, nofollow',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(
      `/login?redirect=${encodeURIComponent('/admin')}`
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Mercadinho Connect',
            description:
              'Painel administrativo para cadastrar ofertas do mercadinho',
            url: process.env.NEXT_PUBLIC_APP_URL ||
              'https://ofertas.marcuslinhares.com',
          }),
        }}
      />
      {/* Admin header */}
      <header className="bg-red-600 text-white p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">📢 Painel do Dono</h1>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="text-sm text-red-100 hover:text-white"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Onboarding alert for first-time users */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">👋 Bem-vindo ao painel!</p>
          <p>
            Cadastre suas ofertas aqui. Depois compartilhe o link{' '}
            <a
              href="/ofertas"
              className="underline font-medium"
            >
              /ofertas
            </a>{' '}
            nos grupos do WhatsApp.
          </p>
          <p className="text-xs mt-2 text-blue-600">
            💡 Dica: Tire fotos bem iluminadas — ofertas com fotos bonitas
            vendem mais!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nova Promoção</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createOffer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo">📸 Foto do Produto</Label>
                <Input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Toque para abrir a câmera
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">🏷️ Nome do Produto</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ex: Tomate Graúdo kg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">📝 Descrição (opcional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Ex: Tomate italiano graúdo, fresco direto da roça"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">💰 Preço (R$)</Label>
                  <Input
                    id="price"
                    name="price"
                    placeholder="Ex: 5,99"
                    required
                    type="text"
                    inputMode="decimal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">
                    Preço Original (opcional)
                  </Label>
                  <Input
                    id="original_price"
                    name="original_price"
                    placeholder="Ex: 7,99"
                    type="text"
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">📂 Categoria</Label>
                <select
                  id="category"
                  name="category"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="geral">Geral</option>
                  <option value="hortifruti">Hortifrúti</option>
                  <option value="carnes">Carnes</option>
                  <option value="laticinios">Laticínios</option>
                  <option value="bebidas">Bebidas</option>
                  <option value="limpeza">Limpeza</option>
                  <option value="higiene">Higiene</option>
                  <option value="mercearia">Mercearia</option>
                </select>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg h-12"
              >
                ✅ Publicar Oferta
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <AdminStats userId={user.id} />

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>💡 Dica: Tire a foto num lugar bem iluminado!</p>
          <p className="mt-2">
            <a href="/ofertas" className="text-blue-500 underline">
              👀 Ver vitrine de ofertas
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

async function AdminStats({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { count: totalOffers } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count: activeBoosts } = await supabase
    .from('boosts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gt('expires_at', new Date().toISOString())

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
        <p className="text-2xl font-black text-red-600">
          {totalOffers ?? 0}
        </p>
        <p className="text-xs text-slate-500">Ofertas publicadas</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
        <p className="text-2xl font-black text-yellow-500">
          {activeBoosts ?? 0}
        </p>
        <p className="text-xs text-slate-500">Destaques ativos</p>
      </div>
    </div>
  )
}
