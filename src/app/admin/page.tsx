import { createOffer } from '@/actions/offers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">📢 Cadastrar Oferta</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Nova Promoção</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createOffer} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="photo">📸 Foto do Produto</Label>
              <Input id="photo" name="photo" type="file" accept="image/*" capture="environment" required />
              <p className="text-xs text-muted-foreground">Toque para abrir a câmera</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">🏷️ Nome do Produto</Label>
              <Input id="title" name="title" placeholder="Ex: Tomate Graúdo kg" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">💰 Preço (R$)</Label>
              <Input id="price" name="price" placeholder="Ex: 5,99" required type="text" inputMode="decimal" />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-lg h-12">
              ✅ Publicar Oferta
            </Button>

          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>💡 Dica: Tire a foto num lugar bem iluminado!</p>
      </div>
    </div>
  )
}
