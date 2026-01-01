import '../styles/globals.css'
import Navbar from '../components/Navbar'
import MainWrapper from '../components/MainWrapper'
import { Providers } from './providers'

export const metadata = {
  title: 'HybridTradeAI – Modern Fintech Investing',
  description: 'AI-assisted signals, weekly ROI tracking, and secure withdrawals. Start investing with HybridTradeAI.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen">
            <Navbar />
            <MainWrapper>
              {children}
            </MainWrapper>
          </div>
        </Providers>
      </body>
    </html>
  )
}
