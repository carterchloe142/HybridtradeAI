'use client'

import LandingNavbar from '@/components/landing/LandingNavbar'
import HeroSection from '@/components/landing/HeroSection'
import StatsSection from '@/components/landing/StatsSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import LiveDemoSection from '@/components/landing/LiveDemoSection'
import MobileSection from '@/components/landing/MobileSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'
import FuturisticBackground from '@/components/ui/FuturisticBackground'

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-cyan-500/30">
      <FuturisticBackground />
      <LandingNavbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <LiveDemoSection />
      <MobileSection />
      <CTASection />
      <Footer />
    </main>
  )
}
