'use client'

import { ReactNode } from 'react'
import BottomNavigationBar from '@/components/navigation/tab'

export default function AppLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      <main className="pb-20">
        {children}
      </main>
      <BottomNavigationBar />
    </>
  )
}
