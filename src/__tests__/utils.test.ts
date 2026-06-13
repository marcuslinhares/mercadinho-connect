import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn (classname utility)', () => {
  it('junta classes simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('mescla classes do Tailwind corretamente', () => {
    expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6')
  })

  it('lida com valores falsy', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('lida com undefined', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
  })

  it('retorna string vazia sem args', () => {
    expect(cn()).toBe('')
  })
})
