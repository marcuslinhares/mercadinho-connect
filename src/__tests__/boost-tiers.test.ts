import { describe, it, expect } from 'vitest'
import { BOOST_TIERS, getBoostTier } from '@/lib/boost-tiers'

describe('boost-tiers', () => {
  it('tem 4 tiers definidos', () => {
    expect(BOOST_TIERS).toHaveLength(4)
  })

  it('tier basic tem 3 dias', () => {
    const basic = BOOST_TIERS.find((t) => t.id === 'basic')
    expect(basic?.durationDays).toBe(3)
  })

  it('tier standard é o popular', () => {
    const std = BOOST_TIERS.find((t) => t.id === 'standard')
    expect(std?.popular).toBe(true)
    expect(std?.durationDays).toBe(7)
  })

  it('tier premium tem 14 dias e $0.05', () => {
    const prem = BOOST_TIERS.find((t) => t.id === 'premium')
    expect(prem?.durationDays).toBe(14)
    expect(prem?.priceUsdCents).toBe(5)
  })

  it('tier super tem 30 dias e $0.10', () => {
    const super_ = BOOST_TIERS.find((t) => t.id === 'super')
    expect(super_?.durationDays).toBe(30)
    expect(super_?.priceUsdCents).toBe(10)
  })

  it('getBoostTier retorna tier correto', () => {
    expect(getBoostTier('standard')?.label).toBe('Padrão')
  })

  it('getBoostTier retorna undefined para tier inexistente', () => {
    expect(getBoostTier('inexistente')).toBeUndefined()
  })

  it('todos os tiers têm id único', () => {
    const ids = BOOST_TIERS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todos os tiers têm preço > 0', () => {
    for (const tier of BOOST_TIERS) {
      expect(tier.priceUsdCents).toBeGreaterThan(0)
    }
  })

  it('todos os tiers têm duração > 0', () => {
    for (const tier of BOOST_TIERS) {
      expect(tier.durationDays).toBeGreaterThan(0)
    }
  })
})
