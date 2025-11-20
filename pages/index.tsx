import Link from 'next/link';
import { motion } from 'framer-motion';
import ChatWidget from '../components/ChatWidget';
import { useI18n } from '../hooks/useI18n';

export default function Home() {
  const { t } = useI18n('en');
  return (
    <div>
      <section className="text-center py-16">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold neon-text"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {t.headline}
        </motion.h1>
        <motion.p
          className="mt-4 text-white/80 text-lg md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {t.subheadline}
        </motion.p>
        <motion.div
          className="mt-8 flex gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link href="/auth/register" className="btn-neon">{t.getStarted}</Link>
          <a href="#features" className="btn-neon">{t.learnMore}</a>
        </motion.div>
      </section>

      <section id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'AI-assisted Investment', desc: 'Leverage signals and risk models for smarter entries.' },
          { title: 'Multi-currency & Multilingual', desc: 'Invest in USD, EUR, NGN, BTC, ETH across languages.' },
          { title: 'Referral Program', desc: 'Earn commissions by inviting friends to HybridTradeAI.' },
          { title: 'Withdrawable Profits', desc: 'Weekly profits tracked with waiting-period safeguards.' }
        ].map((f) => (
          <motion.div
            key={f.title}
            className="card-neon"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="font-bold text-xl">{f.title}</h3>
            <p className="mt-2 text-white/80 text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      <footer className="mt-12 flex items-center justify-between text-sm text-white/70">
        <span>© {new Date().getFullYear()} HybridTradeAI. All rights reserved.</span>
        <a className="hover:text-neon-blue" href="mailto:support@hybridtrade.ai">Contact Support</a>
      </footer>

      <ChatWidget />
    </div>
  );
}
