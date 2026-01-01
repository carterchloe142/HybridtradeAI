"use client"
import Head from 'next/head'
import { useI18n } from '../../hooks/useI18n'
import { usePathname } from 'next/navigation'

export default function ContactPage() {
  const { t } = useI18n()
  const pathname = usePathname() || '/contact'
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  return (
    <div className="space-y-6">
      <Head>
        <title>{t('contact_page.title')}</title>
        <meta name="description" content={t('contact_page.support_title')} />
        <link rel="canonical" href={`${base}${pathname}`} />
        <link rel="alternate" hrefLang="x-default" href={`${base}${pathname}`} />
      </Head>
      <section className="card-neon">
        <h1 className="text-3xl font-bold neon-text">{t('contact_page.title')}</h1>
        <p className="mt-3 text-white/80 text-sm">{t('contact_page.support_title')}</p>
        <div className="mt-4 text-sm">
          <div>{t('contact_page.email_label')}: <a className="text-neon-blue" href="mailto:support@hybridtradeai.com">support@hybridtradeai.com</a></div>
        </div>
      </section>
      <section className="card-neon">
        <h3 className="font-semibold">{t('contact_page.support_title')}</h3>
        <p className="text-sm text-white/80">{t('contact_page.hours_label')}: Mon–Fri, 9am–6pm</p>
      </section>
    </div>
  )
}
