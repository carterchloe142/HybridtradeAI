'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, PlayCircle, ShieldCheck } from 'lucide-react'

const TechSphere = dynamic(() => import('@/components/3d/TechSphere'), { ssr: false })
const FloatingShapes = dynamic(() => import('@/components/3d/FloatingShapes'), { ssr: false })

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] bg-background overflow-hidden flex flex-col md:flex-row items-center pt-24 px-6 md:px-16 lg:px-24">
      {/* Background Gradients/Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
         <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
         
         {/* Grid Line Overlay */}
         <div className="absolute inset-0 opacity-[0.05]" 
              style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px', color: 'var(--foreground)' }}>
         </div>
      </div>

      {/* Left Content */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col gap-8 md:pr-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit"
        >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">Audited & Secure Platform</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-foreground tracking-tight">
            The Future of <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 animate-gradient-x">Algorithmic</span> <br />
            Wealth Creation
          </h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed"
        >
          Harness the power of institutional-grade AI models to automate your crypto trading. Real-time adaptation, zero emotion, maximum yield.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4 mt-2"
        >
          <Link href="/auth/register" className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl overflow-hidden transition-all hover:scale-105 shadow-lg shadow-blue-500/25">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-2">
                Start Trading Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link href="#platform" className="px-8 py-4 border border-border/10 text-foreground font-semibold rounded-xl hover:bg-muted/5 transition-colors flex items-center gap-2">
            <PlayCircle className="w-5 h-5" /> Watch Demo
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-8 border-t border-border/5 flex items-center gap-6"
        >
            <div className="text-sm text-muted-foreground">Trusted by 10,000+ traders from:</div>
            <div className="flex -space-x-4">
                 {[1,2,3,4].map((i) => (
                     <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-background flex items-center justify-center text-xs text-slate-500 font-bold">
                        U{i}
                     </div>
                 ))}
                 <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-background flex items-center justify-center text-xs text-white font-bold">
                    +10k
                 </div>
            </div>
        </motion.div>
      </div>

      {/* Right 3D Content */}
      <div className="relative z-10 w-full md:w-1/2 h-[500px] md:h-[700px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <TechSphere />
        <div className="absolute inset-0 pointer-events-none">
             <FloatingShapes />
        </div>
        
        {/* Floating Cards */}
        <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-10 bg-card/40 backdrop-blur-xl border border-border/10 p-4 rounded-2xl shadow-xl z-20"
        >
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">AI Bot Active</span>
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">+12.4% <span className="text-xs font-normal text-muted-foreground">/ 24h</span></div>
        </motion.div>

        <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-32 left-0 bg-card/40 backdrop-blur-md border border-border/10 p-4 rounded-2xl shadow-xl z-20"
        >
            <div className="text-xs text-muted-foreground mb-1">Total Volume</div>
            <div className="text-xl font-bold text-foreground">$482,920.54</div>
        </motion.div>
      </div>
    </section>
  )
}
