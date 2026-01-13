'use client';

export const dynamic = "force-dynamic";

import { motion } from 'framer-motion'
import FuturisticBackground from '@/components/ui/FuturisticBackground'
import Link from 'next/link'
import { useI18n } from '@/hooks/useI18n'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function FAQs() {
  const { t } = useI18n()
  const pathname = usePathname()
  const langs = ['en','es','fr']
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  const path = pathname || '/faqs'
  const { lang } = useI18n() as any
  
  return (
    <>
      <FuturisticBackground />
      <div className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/dashboard" className="p-2 rounded-xl bg-card/40 border border-border/10 hover:bg-accent/10 transition-all text-muted-foreground hover:text-foreground backdrop-blur-md group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('faqs_title')}
              </h1>
              <p className="text-muted-foreground mt-1">Common questions and answers</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-8 shadow-xl space-y-6 text-sm text-muted-foreground"
          >
            <div className="space-y-2">
              <div className="font-semibold text-foreground text-base">{t('faqs_q1_title')}</div>
              <div className="leading-relaxed">{t('faqs_q1_body')}</div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-foreground text-base">{t('faqs_q2_title')}</div>
              <div className="leading-relaxed">{t('faqs_q2_body')}</div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-foreground text-base">{t('faqs_q3_title')}</div>
              <div className="leading-relaxed">{t('faqs_q3_body')}</div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-foreground text-base">{t('faqs_q4_title')}</div>
              <div className="leading-relaxed">{t('faqs_q4_body')}</div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-foreground text-base">{t('faqs_q5_title')}</div>
              <div className="leading-relaxed">{t('faqs_q5_body')} <Link href="/proof-of-reserves" className="text-primary hover:underline">Proof‑of‑Reserves</Link></div>
            </div>
          </motion.div>
          <div className="text-xs text-muted-foreground text-center">{t('returns_variable_disclaimer')}</div>
        </div>
      </div>
    </>
  )
}
