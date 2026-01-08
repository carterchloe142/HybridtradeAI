import '../styles/globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata = {
  title: 'HybridTradeAI – Modern Fintech Investing',
  description: 'AI-assisted signals, weekly ROI tracking, and secure withdrawals. Start investing with HybridTradeAI.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-black text-white">
        <div className="min-h-screen">
          {children}
        </div>
        <SpeedInsights />
      </body>
    </html>
  )
}
