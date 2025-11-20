import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
// Initialize Sentry (client & server)
import '../sentry.client.config'
import '../sentry.server.config'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container-xl px-4 py-6">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
