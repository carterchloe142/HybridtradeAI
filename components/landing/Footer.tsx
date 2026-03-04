'use client'

import Link from 'next/link'
import { Instagram, Mail } from 'lucide-react'
import TrustPilotWidget from '@/components/TrustPilotWidget'

export default function Footer() {
  return (
    <footer className="relative bg-background border-t border-border/10 pt-16 pb-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 mb-4 inline-block">
              Hybrid Trade AI
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Advanced algorithmic trading platform powered by institutional-grade AI models.
            </p>
            <div className="flex gap-4 mb-6">
              <Link href="https://www.instagram.com/hybridtradeai?igsh=OGpwanVuZm1rdTFx" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-500 transition-colors">
                <Instagram size={24} />
              </Link>
            </div>
            <div className="w-full max-w-[200px]">
              <TrustPilotWidget />
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/register" className="hover:text-primary transition-colors">Get Started</Link></li>
              <li><Link href="/auth/login" className="hover:text-primary transition-colors">Login</Link></li>
              <li><Link href="/plans" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="/risk-disclosure" className="hover:text-primary transition-colors">Risk Disclosure</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hybrid Trade AI. All rights reserved.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail size={14} /> support@hybridtrade.ai
            </div>
            <div className="flex items-center gap-2">
              <span>+1 213 397 6720</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
