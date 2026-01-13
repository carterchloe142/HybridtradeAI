'use client'

import React from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const NeonGrid = dynamic(() => import('@/components/3d/NeonGrid'), { ssr: false })

export default function CTASection() {
  return (
    <section className="relative py-24 px-6 md:px-12 lg:px-24 overflow-hidden bg-transparent">
      <NeonGrid />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-purple-900/10 pointer-events-none" />
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight"
        >
          Ready to Start Your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Wealth Journey?</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
        >
          Join thousands of investors using Hybrid Trade AI to automate their portfolio growth.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-10 py-5 bg-foreground text-background font-bold rounded-full text-lg hover:bg-muted-foreground/20 hover:text-foreground transition-colors shadow-2xl shadow-foreground/10 hover:shadow-foreground/20 transform hover:-translate-y-1">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">No credit card required • Cancel anytime</p>
        </motion.div>
      </div>
    </section>
  )
}
