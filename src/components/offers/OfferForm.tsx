'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createOffer } from '@/actions/offers'
import { useState, useRef } from 'react'

export function OfferForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      await createOffer(formData)
    } catch (error) {
      alert('Erro: ' + (error as Error).message)
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-white">
          <span className="text-2xl">✨</span> Criar Nova Oferta
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form action={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="photo" className="text-base font-semibold">
              📸 Foto do Produto
            </Label>
            
            <div className="relative">
              <input
                ref={fileInputRef}
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                required
                className="hidden"
              />

              {photoPreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-green-500 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 border-2 border-dashed border-green-400 rounded-lg hover:bg-green-50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="text-4xl">📷</span>
                  <span className="text-sm font-medium text-slate-600">
                    Toque para tirar foto ou selecionar
                  </span>
                  <span className="text-xs text-slate-500">
                    (Ambiente bem iluminado = foto melhor!)
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold">
              🏷️ Nome do Produto
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Tomate Graúdo kg"
              required
              className="h-12 text-base"
            />
            <p className="text-xs text-slate-500">
              Seja específico para o cliente saber o que é!
            </p>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-base font-semibold">
              💰 Preço (R$)
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-600 font-bold">R$</span>
              <Input
                id="price"
                name="price"
                placeholder="5,99"
                required
                type="text"
                inputMode="decimal"
                className="h-12 text-base pl-10"
                pattern="[0-9,.]+"
              />
            </div>
            <p className="text-xs text-slate-500">
              Use ponto ou vírgula decimal
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !photoPreview}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg h-12 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Publicando...
              </>
            ) : (
              <>
                ✅ Publicar Oferta
              </>
            )}
          </Button>

          {/* Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">
              💡 <strong>Dica:</strong> Quanto melhor a foto, mais pessoas vão se interessar!
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}