import { describe, it, expect } from 'vitest'
import { t } from '@/lib/i18n'

describe('i18n', () => {
  it('retorna label de preço', () => {
    expect(t('offer.price_label')).toBe('Por apenas')
  })

  it('retorna texto do botão de boost', () => {
    expect(t('offer.boost_button')).toBe('⭐ Destacar')
  })

  it('retorna texto de oferta destacada', () => {
    expect(t('offer.boosted_button')).toBe('✓ Destacada')
  })

  it('retorna tooltip do botão de boost', () => {
    expect(t('offer.boost_title')).toBe('Destacar por $0.01 USD')
  })

  it('retorna tooltip de oferta já destacada', () => {
    expect(t('offer.boosted_title')).toBe('Esta oferta já está destacada')
  })

  it('retorna badge de destacado', () => {
    expect(t('badge.boosted')).toBe('Destacado')
  })
})
