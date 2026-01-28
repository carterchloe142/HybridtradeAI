import '@/styles/globals.css'
import { Providers } from './providers'
import GlobalUIControls from '@/components/GlobalUIControls'

export const metadata = {
  title: 'HybridTradeAI – Automated Crypto Wealth Creation',
  description: 'Institutional-grade AI trading algorithms for passive portfolio growth. Secure, audited, and automated investing for the modern era.',
  keywords: ['crypto trading', 'ai investing', 'algorithmic trading', 'passive income', 'bitcoin', 'ethereum', 'wealth management'],
  authors: [{ name: 'Hybrid Trade AI' }],
  openGraph: {
    title: 'HybridTradeAI – Automated Crypto Wealth Creation',
    description: 'Institutional-grade AI trading algorithms for passive portfolio growth.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Hybrid Trade AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HybridTradeAI',
    description: 'Automated Crypto Wealth Creation',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HybridTradeAI',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <div className="min-h-screen">
          <Providers>
            {children}
            <GlobalUIControls />
          </Providers>
        </div>
      </body>
    </html>
  )
}
