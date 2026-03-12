import ptBR from '@/locales/pt-BR.json'

const translations = {
  'pt-BR': ptBR,
}

type TranslationKeys = keyof typeof ptBR

export function useTranslations(namespace: TranslationKeys) {
  return translations['pt-BR'][namespace] || {}
}

export function t(key: string): string {
  const keys = key.split('.')
  let value: unknown = translations['pt-BR']
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // Return the key itself if not found
    }
  }
  
  return typeof value === 'string' ? value : key
}
