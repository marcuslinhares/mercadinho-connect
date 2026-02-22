'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createOffer(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const price = formData.get('price') as string
  const photo = formData.get('photo') as File

  if (!title || !price || !photo) {
    throw new Error('Preencha tudo, meu patrão!')
  }

  // 1. Upload da Foto
  const filename = `${Date.now()}-${photo.name}`
  const { error: uploadError } = await supabase
    .storage
    .from('offers')
    .upload(filename, photo)

  if (uploadError) {
    console.error('Erro na foto:', uploadError)
    throw new Error('A foto não subiu!')
  }

  // 2. Pegar URL pública da foto
  const { data: { publicUrl } } = supabase
    .storage
    .from('offers')
    .getPublicUrl(filename)

  // 3. Salvar no Banco
  const { error: dbError } = await supabase
    .from('offers')
    .insert({
      title,
      price,
      photo_url: publicUrl,
      active: true
    })

  if (dbError) {
    console.error('Erro no banco:', dbError)
    throw new Error('Não salvou no banco!')
  }

  // Volta pra página e atualiza
  redirect('/admin')
}
