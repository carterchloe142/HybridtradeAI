import '@/styles/globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'HybridTradeAI – Modern Fintech Investing',
  description: 'AI-assisted signals, weekly ROI tracking, and secure withdrawals. Start investing with HybridTradeAI.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <div className="min-h-screen">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  )
}
