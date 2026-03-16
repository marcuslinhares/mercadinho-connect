'use client'

import { useEffect, useState } from 'react'

interface BoostedBadgeProps {
  expiresAt: string | Date
  showCountdown?: boolean
}

// i18n: These strings are kept as constants for future i18n migration
const BOOSTED_LABEL = 'Destacado'
const DAY_LABEL = 'dia'
const DAYS_LABEL = 'dias'
const REMAINING_LABEL = 'restantes'

/**
 * FRONTEND-002: Boosted Badge Component
 * Displays a visual indicator that an offer is boosted with countdown
 */
export function BoostedBadge({
  expiresAt,
  showCountdown = true,
}: BoostedBadgeProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)

  useEffect(() => {
    const updateCountdown = () => {
      const expiryDate = new Date(expiresAt)
      const now = new Date()
      const msRemaining = expiryDate.getTime() - now.getTime()

      // Handle expiry
      if (msRemaining <= 0) {
        setDaysRemaining(0)
        return
      }

      const days = Math.ceil(msRemaining / (1000 * 60 * 60 * 24))
      setDaysRemaining(days)
    }

    updateCountdown()

    // Update countdown every hour (no need to update constantly)
    const interval = setInterval(updateCountdown, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  if (daysRemaining === null) {
    return null
  }

  if (daysRemaining <= 0) {
    // Badge expired, don't show
    return null
  }

  return (
    <div
      data-testid="boosted-badge"
      className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 px-3 py-1 rounded-full font-bold text-sm shadow-md border border-yellow-600 border-opacity-30"
    >
      <span className="inline-block mr-1">⭐</span>
      <span>{BOOSTED_LABEL}</span>
      {showCountdown && (
        <span
          data-testid="boost-countdown"
          className="ml-2 text-xs font-semibold opacity-90"
        >
          ({daysRemaining} {daysRemaining === 1 ? DAY_LABEL : DAYS_LABEL} {REMAINING_LABEL})
        </span>
      )}
    </div>
  )
}
