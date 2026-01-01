'use client'

import { usePathname } from 'next/navigation'

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  
  if (isLanding) {
    return <>{children}</>
  }

  return (
    <main className="container-xl px-4 py-6 page-fade-in">
      {children}
    </main>
  )
}
