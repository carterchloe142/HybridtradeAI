'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Smartphone } from 'lucide-react'
import Link from 'next/link'

const benefits = [
  "Consistent Performance",
  "Robust Risk Management",
  "In-Depth Analytics"
]

export default function MobileSection() {
  return (
    <section className="relative w-full py-24 bg-transparent overflow-hidden px-6 md:px-16 lg:px-24">
      {/* Background Gradient */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col-reverse md:flex-row items-center gap-20">
        
        {/* Left Content - Phone Mockup */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
             {/* CSS Phone Mockup */}
             <div className="w-[300px] h-[600px] border-[12px] border-border rounded-[3rem] bg-[#02050c] overflow-hidden shadow-2xl relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-border rounded-b-xl z-20"></div>
                
                {/* Screen Content */}
                <div className="w-full h-full pt-10 px-4 pb-4 flex flex-col">
                   {/* App Header */}
                   <div className="flex justify-between items-center mb-6">
                      <div className="text-white font-bold text-sm tracking-wider">HYBRID AI</div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
                      </div>
                   </div>
                   
                   {/* Balance Card */}
                   <div className="bg-gradient-to-br from-blue-600 to-cyan-700 p-5 rounded-2xl mb-6 text-white shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                      <div className="text-xs text-blue-100 mb-1 font-medium">Total Balance</div>
                      <div className="text-3xl font-bold mb-4 tracking-tight">$24,500.00</div>
                      <div className="flex gap-2">
                        <div className="h-2 flex-1 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-white/80 rounded-full" />
                        </div>
                      </div>
                   </div>
                   
                   {/* Chart Area */}
                   <div className="flex-1 bg-white/5 rounded-2xl p-4 relative overflow-hidden mb-4 border border-white/5">
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-green-500/10 to-transparent"></div>
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <path d="M0,80 Q25,70 50,40 T100,20" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      
                      {/* Floating tag */}
                      <div className="absolute top-4 left-4 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400 font-medium">
                        +12.4% Growth
                      </div>
                   </div>
                   
                   {/* Bottom Nav */}
                   <div className="h-14 bg-white/5 rounded-2xl flex items-center justify-around px-2 backdrop-blur-sm">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-500 transition-colors">
                        <div className="w-5 h-5 bg-slate-600 rounded-full" />
                      </div>
                      <div className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-500 transition-colors">
                        <div className="w-5 h-5 bg-slate-600 rounded-full" />
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Glow Effect */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[650px] bg-blue-500/20 rounded-[3rem] blur-2xl -z-10"></div>
          </motion.div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-1/2">
           <motion.div
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             className="flex flex-col gap-10"
           >
              <div className="space-y-2">
                <div className="text-blue-500 font-medium tracking-wide uppercase text-sm">Mobile First</div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                    Trade Anywhere, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Anytime.</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-md">
                    Monitor your portfolio, adjust strategies, and withdraw profits on the go with our powerful mobile dashboard.
                </p>
              </div>

              <div className="space-y-6">
                 {benefits.map((benefit, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.15 }}
                      className="flex items-center gap-4 group"
                    >
                       <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 transition-colors border border-blue-500/20 group-hover:border-blue-500">
                          <Check className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
                       </div>
                       <span className="text-xl md:text-2xl font-medium text-muted-foreground group-hover:text-foreground transition-colors">{benefit}</span>
                    </motion.div>
                 ))}
              </div>

              <Link href="/about" className="group flex items-center gap-2 px-8 py-4 bg-muted/5 border border-border/10 text-foreground w-fit rounded-xl hover:bg-muted/10 transition-all hover:pl-10">
                 <span>View Full Features</span>
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </motion.div>
        </div>
      </div>
    </section>
  )
}
