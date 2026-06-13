'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createOffer(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const price = formData.get('price') as string
  const photo = formData.get('photo') as File
  const description = (formData.get('description') as string) || null
  const category = (formData.get('category') as string) || 'geral'
  const originalPrice = (formData.get('original_price') as string) || null

  if (!title || !price || !photo) {
    throw new Error('Preencha tudo, meu patrão!')
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Faça login primeiro!')
  }

  // 1. Upload da Foto
  const filename = `${Date.now()}-${photo.name}`
  const { error: uploadError } = await supabase.storage
    .from('offers')
    .upload(filename, photo)

  if (uploadError) {
    console.error('Erro na foto:', uploadError)
    throw new Error('A foto não subiu!')
  }

  // 2. Pegar URL pública da foto
  const {
    data: { publicUrl },
  } = supabase.storage.from('offers').getPublicUrl(filename)

  // 3. Sanitizar preços (vírgula pra ponto)
  const priceClean = price.replace(',', '.').replace(/[^0-9.]/g, '')
  const originalPriceClean = originalPrice
    ? originalPrice.replace(',', '.').replace(/[^0-9.]/g, '')
    : null

  // 4. Salvar no Banco
  const { error: dbError } = await supabase.from('offers').insert({
    title,
    description,
    category,
    price: parseFloat(priceClean),
    original_price: originalPriceClean ? parseFloat(originalPriceClean) : null,
    photo_url: publicUrl,
    user_id: user.id,
    active: true,
  })

  if (dbError) {
    console.error('Erro no banco:', dbError)
    throw new Error('Não salvou no banco!')
  }

  redirect('/admin')
}
