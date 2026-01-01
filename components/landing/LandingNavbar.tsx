'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import LogoMark from '@/components/LogoMark'

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Platform', href: '#platform' },
    { name: 'Insights', href: '/insights' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#050A18]/80 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50 group">
          <LogoMark size={28} className="text-white group-hover:text-blue-400 transition-colors" animated={true} />
          <span className="text-xl font-bold text-white tracking-wide transition-all">
            HybridTrade<span className="text-[#E5C15B]">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-sm">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="relative px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/auth/login" 
            className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/auth/register"
            className="group px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all flex items-center gap-2 text-sm font-bold"
          >
            Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 w-full bg-[#050A18] border-b border-white/10 p-6 pt-24 flex flex-col gap-6 md:hidden shadow-2xl"
            >
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="text-lg font-medium text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-4 mt-4">
                 <Link 
                    href="/auth/login" 
                    className="px-5 py-3 border border-white/20 text-white rounded text-center"
                    onClick={() => setMobileMenuOpen(false)}
                 >
                    Sign In
                 </Link>
                 <Link
                    href="/auth/register"
                    className="px-5 py-3 bg-[#F3BA2F] text-black rounded text-center font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                 >
                    Get Started
                 </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
