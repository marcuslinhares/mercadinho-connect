/**
 * Boost tiers configuration for Mercadinho Connect
 */
export interface BoostTier {
  id: string
  label: string
  priceUsdCents: number // in USD cents (1 = $0.01)
  durationDays: number
  badgeColor: string
  popular?: boolean
}

export const BOOST_TIERS: BoostTier[] = [
  {
    id: 'basic',
    label: 'Básico',
    priceUsdCents: 1, // $0.01
    durationDays: 3,
    badgeColor: 'bg-slate-400',
  },
  {
    id: 'standard',
    label: 'Padrão',
    priceUsdCents: 1, // $0.01
    durationDays: 7,
    badgeColor: 'bg-yellow-400',
    popular: true,
  },
  {
    id: 'premium',
    label: 'Premium',
    priceUsdCents: 5, // $0.05
    durationDays: 14,
    badgeColor: 'bg-purple-500',
  },
  {
    id: 'super',
    label: 'Super Destaque',
    priceUsdCents: 10, // $0.10
    durationDays: 30,
    badgeColor: 'bg-red-500',
  },
]

export function getBoostTier(tierId: string): BoostTier | undefined {
  return BOOST_TIERS.find((t) => t.id === tierId)
}
