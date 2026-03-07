'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect, revalidatePath } from 'next/navigation'

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

  // Revalidate pages
  revalidatePath('/admin')
  revalidatePath('/')
  
  // Volta pra página e atualiza
  redirect('/admin')
}

export async function deleteOffer(offerId: string) {
  const supabase = await createClient()

  // 1. Get offer to find photo filename
  const { data: offer, error: fetchError } = await supabase
    .from('offers')
    .select('photo_url')
    .eq('id', offerId)
    .single()

  if (fetchError || !offer) {
    throw new Error('Oferta não encontrada!')
  }

  // 2. Delete from storage if has photo
  if (offer.photo_url) {
    const filename = offer.photo_url.split('/').pop()
    if (filename) {
      await supabase.storage
        .from('offers')
        .remove([filename])
    }
  }

  // 3. Delete from database
  const { error: dbError } = await supabase
    .from('offers')
    .delete()
    .eq('id', offerId)

  if (dbError) {
    throw new Error('Não conseguiu deletar!')
  }

  // Revalidate pages
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function toggleOfferActive(offerId: string, active: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('offers')
    .update({ active: !active })
    .eq('id', offerId)

  if (error) {
    throw new Error('Não conseguiu atualizar!')
  }

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function updateOffer(offerId: string, title: string, price: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('offers')
    .update({ title, price })
    .eq('id', offerId)

  if (error) {
    throw new Error('Não conseguiu atualizar!')
  }

  revalidatePath('/admin')
  revalidatePath('/')
}
