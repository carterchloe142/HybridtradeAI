import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import type { AppContext } from 'next/app';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import GlobalBanner from '../components/GlobalBanner'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import '../sentry.client.config'
import '../sentry.server.config'
import { I18nProvider } from '../hooks/useI18n'
import { SWRConfig } from 'swr'
import { ThemeProvider } from '../components/ThemeProvider'
import LogoMark from '../components/LogoMark'

export default function App({ Component, pageProps }: AppProps & { pageProps: { initialLang?: string } }) {
  const router = useRouter();
  const isDashboard = router.pathname?.startsWith('/dashboard') || router.pathname?.startsWith('/admin');
  const isLanding = router.pathname === '/';
  const showNavbar = !isDashboard && !isLanding;
  const useContentWrapper = !isDashboard && !isLanding;
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const Router = require('next/router').default
    const start = () => setLoading(true)
    const stop = () => setLoading(false)
    Router.events.on('routeChangeStart', start)
    Router.events.on('routeChangeComplete', stop)
    Router.events.on('routeChangeError', stop)
    const onGlobal = (ev: any) => { try { const v = !!ev?.detail; setLoading(v) } catch {} }
    window.addEventListener('htai:loading', onGlobal as any)
    return () => {
      Router.events.off('routeChangeStart', start)
      Router.events.off('routeChangeComplete', stop)
      Router.events.off('routeChangeError', stop)
      window.removeEventListener('htai:loading', onGlobal as any)
    }
  }, [])
  return (
    <ThemeProvider>
      <I18nProvider initialLang={pageProps.initialLang}>
        <SWRConfig value={{ fetcher: (url: string) => fetch(url).then((r) => r.json()), errorRetryCount: 3, errorRetryInterval: 3000, shouldRetryOnError: true }}>
          <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/30 selection:text-primary-foreground">
            {!isDashboard && <Navbar />}
            <GlobalBanner />
            {loading && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity">
                <div className="flex flex-col items-center justify-center gap-4">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: [0.8, 1.1, 1], opacity: 1, rotate: [0, 0, 360] }} 
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} 
                    className="rounded-full p-6 bg-secondary/20 border border-primary/30 shadow-[0_0_30px_rgba(0,229,255,0.3)]"
                  >
                    <LogoMark size={64} animated className="text-primary" />
                  </motion.div>
                  <p className="text-primary font-mono text-sm tracking-widest animate-pulse">INITIALIZING CORE...</p>
                </div>
              </div>
            )}
            {!useContentWrapper ? (
              <Component {...pageProps} />
            ) : (
              <main className="container-xl px-4 py-6 relative z-10">
                <Component {...pageProps} />
              </main>
            )}
          </div>
        </SWRConfig>
      </I18nProvider>
    </ThemeProvider>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const { default: NextApp } = await import('next/app')
  const appProps = await NextApp.getInitialProps(appContext)
  const req = appContext.ctx.req as any
  const cookieHeader = String(req?.headers?.cookie || '')
  const m = cookieHeader.match(/(?:^|;\s*)lang=([^;]+)/)
  const cookieLang = m ? decodeURIComponent(m[1]) : ''
  const accept = String(req?.headers?.['accept-language'] || '')
  const headerLang = accept ? accept.split(',')[0]?.split('-')[0] || '' : ''
  const initialLang = cookieLang || headerLang || 'en'
  return { ...appProps, pageProps: { ...appProps.pageProps, initialLang } }
}
