'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { t } from '@/lib/i18n'

export interface TabProps {
  href: string
  icon: ReactNode
  label: string
  badge?: number
}

interface TabComponentProps extends TabProps {
  isActive: boolean
}

/**
 * Individual Tab Component
 * Renders a single tab in the bottom navigation bar
 * 
 * States:
 * - Active: Full color, highlighted
 * - Inactive: Gray, subdued
 * - Hover: Slight color intensification
 * - Disabled: Opacity reduction
 */
export function Tab({ href, icon, label, badge, isActive }: TabComponentProps) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex flex-col items-center justify-center gap-1 flex-1 py-3 px-2 transition-all duration-200 ease-out',
        'hover:bg-slate-100 active:scale-95',
        isActive
          ? 'text-blue-600 border-t-2 border-blue-600'
          : 'text-slate-600 border-t-2 border-transparent'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="relative text-xl md:text-2xl">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-2 -right-2 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium text-center leading-tight">{label}</span>
    </Link>
  )
}

/**
 * Bottom Navigation Bar Component
 * Provides navigation between 4 main sections:
 * - Home (catalog)
 * - Offers (offers list)
 * - Favorites (saved items)
 * - Profile (user account)
 * 
 * Features:
 * - Sticky bottom positioning (mobile-first)
 * - Active tab highlighting
 * - Badge support (for notifications)
 * - Smooth transitions
 * - Accessibility: current page indication
 * - Responsive: hidden on desktop if needed
 */
export function BottomNavigationBar() {
  const pathname = usePathname()
  
  const tabs: TabProps[] = [
    {
      href: '/',
      label: t('navigation.home'),
      icon: <span className="text-lg">🏠</span>,
    },
    {
      href: '/offers',
      label: t('navigation.offers'),
      icon: <span className="text-lg">🏷️</span>,
    },
    {
      href: '/favorites',
      label: t('navigation.favorites'),
      icon: <span className="text-lg">❤️</span>,
      // badge: 3, // TODO: Wire up with favorites count
    },
    {
      href: '/profile',
      label: t('navigation.profile'),
      icon: <span className="text-lg">👤</span>,
    },
  ]

  const isTabActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/' || pathname.startsWith('/products')
    }
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-white border-t border-slate-200 shadow-lg',
        'flex gap-0 h-20 md:hidden'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.href}
          {...tab}
          isActive={isTabActive(tab.href)}
        />
      ))}
    </nav>
  )
}

export default BottomNavigationBar
