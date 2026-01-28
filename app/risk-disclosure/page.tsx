'use client';

import FuturisticBackground from '@/components/ui/FuturisticBackground'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RiskDisclosure() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <FuturisticBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border/10">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Risk Disclosure Statement</h1>
              <p className="text-muted-foreground mt-1">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                1. General Trading Risk
              </h3>
              <p>
                Trading in financial markets, including cryptocurrencies, involves a significant level of risk and can result in the loss of your invested capital. You should not invest more than you can afford to lose and should ensure that you fully understand the risks involved.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">2. Cryptocurrency Volatility</h3>
              <p>
                Cryptocurrencies are highly volatile assets. Prices can fluctuate widely in short periods due to market sentiment, regulatory changes, or technical issues. Hybrid Trade AI utilizes algorithms to mitigate some risks, but market conditions can override algorithmic predictions.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">3. Algorithmic Trading Risks</h3>
              <p>
                While our AI models are backtested and monitored, algorithmic trading carries inherent risks, including but not limited to software failure, connectivity issues, and unexpected market behavior that the model may not have encountered during training. Past performance is not indicative of future results.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">4. Regulatory Uncertainty</h3>
              <p>
                The regulatory environment for cryptocurrencies is evolving. Changes in laws or regulations in your jurisdiction could affect your ability to use our platform or the value of your assets.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">5. No Financial Advice</h3>
              <p>
                The content provided on Hybrid Trade AI is for informational and educational purposes only and does not constitute financial, legal, or investment advice. You should consult with a qualified professional before making any investment decisions.
              </p>
            </section>

            <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-6 mt-8">
              <p className="text-sm text-orange-400/80 font-medium text-center">
                By using Hybrid Trade AI, you acknowledge that you have read, understood, and accepted these risks.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
