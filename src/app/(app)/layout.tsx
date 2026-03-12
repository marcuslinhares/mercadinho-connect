import { ReactNode } from 'react'
import BottomNavigationBar from '@/components/navigation/tab'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mercadinho Connect - Ofertas e Promoções',
  description: 'Explore as melhores ofertas do mercadinho do bairro com preços imperdíveis.',
}

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
