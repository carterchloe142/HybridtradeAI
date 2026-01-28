'use client';

import FuturisticBackground from '@/components/ui/FuturisticBackground'
import Link from 'next/link'
import { ArrowLeft, Cookie } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CookiePolicy() {
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
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <Cookie size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cookie Policy</h1>
              <p className="text-muted-foreground mt-1">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-6 text-muted-foreground leading-relaxed text-sm">
            <p>
              Hybrid Trade AI uses cookies to improve your experience on our platform. This policy explains what cookies are, how we use them, and your choices regarding their use.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">1. What Are Cookies?</h3>
            <p>
              Cookies are small text files that are stored on your device when you visit a website. They help the website remember your actions and preferences (such as login, language, font size, and other display preferences) over a period of time, so you don’t have to keep re-entering them whenever you come back to the site or browse from one page to another.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">2. How We Use Cookies</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-foreground">Essential Cookies:</strong> Necessary for the operation of the website (e.g., authentication).</li>
              <li><strong className="text-foreground">Analytical Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
              <li><strong className="text-foreground">Functionality Cookies:</strong> Allow the website to remember choices you make (such as your user name, language, or the region you are in).</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-6">3. Managing Cookies</h3>
            <p>
              You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
