/**
 * Simple i18n helper for Mercadinho Connect (pt-BR)
 * Future: replace with next-intl or react-i18next for full i18n support
 */
const messages = {
  'offer.price_label': 'Por apenas',
  'offer.boost_button': '⭐ Destacar',
  'offer.boosted_button': '✓ Destacada',
  'offer.boost_title': 'Destacar por $0.01 USD',
  'offer.boosted_title': 'Esta oferta já está destacada',
  'badge.boosted': 'Destacado',
} as const

type MessageKey = keyof typeof messages

export function t(key: MessageKey): string {
  return messages[key]
}

const i18n = { t }
export default i18n
