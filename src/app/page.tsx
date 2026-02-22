import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 0 // Atualiza sempre que entrar (sem cache velho)

export default async function ShowcasePage() {
  const supabase = await createClient()
  const { data: offers } = await supabase.from('offers').select('*').order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Cabeçalho */}
      <header className="bg-red-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          🍎 Mercadinho Connect
          <span className="text-xs bg-white text-red-600 px-2 py-0.5 rounded-full ml-auto">Ofertas de Hoje</span>
        </h1>
      </header>

      {/* Lista de Ofertas */}
      <main className="p-4 space-y-4 max-w-md mx-auto">
        {offers?.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Nenhuma oferta cadastrada ainda. 😴</p>
            <Link href="/admin" className="text-blue-500 underline mt-2 block">Sou o dono (Cadastrar)</Link>
          </div>
        ) : (
          offers?.map((offer) => (
            <Card key={offer.id} className="overflow-hidden border-none shadow-lg">
              <div className="relative h-64 w-full bg-gray-200">
                {offer.photo_url && (
                  <Image 
                    src={offer.photo_url} 
                    alt={offer.title} 
                    fill 
                    className="object-cover"
                  />
                )}
                {/* Preço "colado" na foto */}
                <div className="absolute bottom-0 left-0 bg-yellow-400 px-4 py-2 rounded-tr-xl shadow-sm">
                  <span className="text-xs font-bold text-yellow-900 uppercase block">Por apenas</span>
                  <span className="text-2xl font-black text-red-700">R$ {offer.price}</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h2 className="text-lg font-bold text-slate-800 leading-tight">{offer.title}</h2>
              </CardContent>
            </Card>
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
