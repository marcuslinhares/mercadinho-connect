/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Boost utilities - Helper functions for boost queries and validations
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface Boost {
  id: string
  offerId: string
  userId: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'expired'
  paymentMethod: 'stripe' | 'mercado_pago'
  createdAt: string
  updatedAt: string
  expiresAt: string
}

export interface BoostWithOffer extends Boost {
  offer?: {
    id: string
    title: string
    userId: string
  }
}

/**
 * Get active boosts for an offer (not expired, completed)
 */
export async function getActiveBoostsForOffer(
  offerId: string,
  supabaseClient: SupabaseClient
): Promise<Boost[]> {
  const { data, error } = await supabaseClient
    .from('boosts')
    .select('*')
    .eq('offer_id', offerId)
    .eq('status', 'completed')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active boosts:', error)
    return []
  }

  return data || []
}

/**
 * Get all boosts for a user
 */
export async function getBoostsForUser(
  userId: string,
  supabaseClient: SupabaseClient,
  filter?: {
    status?: string
    offerId?: string
  }
): Promise<BoostWithOffer[]> {
  let query = supabaseClient
    .from('boosts')
    .select(
      `
      id,
      offer_id,
      user_id,
      amount,
      status,
      payment_method,
      created_at,
      updated_at,
      expires_at,
      offers(id, title, user_id)
    `
    )
    .eq('user_id', userId)

  if (filter?.status) {
    query = query.eq('status', filter.status)
  }

  if (filter?.offerId) {
    query = query.eq('offer_id', filter.offerId)
  }

  const { data, error } = await query.order('created_at', {
    ascending: false,
  })

  if (error) {
    console.error('Error fetching user boosts:', error)
    return []
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    offerId: item.offer_id,
    userId: item.user_id,
    amount: item.amount,
    status: item.status,
    paymentMethod: item.payment_method,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    expiresAt: item.expires_at,
    offer: item.offers ? {
      id: item.offers.id,
      title: item.offers.title,
      userId: item.offers.user_id,
    } : undefined,
  }))
}

/**
 * Check if offer is currently boosted
 */
export async function isOfferBoosted(
  offerId: string,
  supabaseClient: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from('boosts')
    .select('id')
    .eq('offer_id', offerId)
    .eq('status', 'completed')
    .gt('expires_at', new Date().toISOString())
    .limit(1)

  if (error) {
    console.error('Error checking boost status:', error)
    return false
  }

  return data && data.length > 0
}

/**
 * Get boost expiry info for an offer
 */
export async function getBoostExpiryInfo(
  offerId: string,
  supabaseClient: SupabaseClient
): Promise<{
  isBoosted: boolean
  expiresAt?: string
  daysRemaining?: number
} | null> {
  const { data, error } = await supabaseClient
    .from('boosts')
    .select('expires_at')
    .eq('offer_id', offerId)
    .eq('status', 'completed')
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error getting boost expiry:', error)
    return null
  }

  if (!data || data.length === 0) {
    return { isBoosted: false }
  }

  const expiresAt = new Date(data[0].expires_at)
  const now = new Date()
  const daysRemaining = Math.ceil(
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  return {
    isBoosted: true,
    expiresAt: data[0].expires_at,
    daysRemaining,
  }
}

/**
 * Mark expired boosts as 'expired' (scheduled job)
 */
export async function markExpiredBoosts(
  supabaseClient: SupabaseClient
): Promise<number> {
  const { data, error } = await supabaseClient
    .from('boosts')
    .update({ status: 'expired' })
    .eq('status', 'completed')
    .lt('expires_at', new Date().toISOString())

  if (error) {
    console.error('Error marking expired boosts:', error)
    return 0
  }

  return Array.isArray(data) ? (data as any[]).length : 0
}

/**
 * Get top boosted offers for display (reordering logic)
 */
export async function getTopBoostedOffers(
  supabaseClient: SupabaseClient,
  limit: number = 10
) {
  const { data, error } = await supabaseClient
    .from('boosts')
    .select('offer_id, expires_at')
    .eq('status', 'completed')
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error getting boosted offers:', error)
    return []
  }

  return (data || []).map((item: any) => ({
    offerId: item.offer_id,
    expiresAt: item.expires_at,
  }))
}
