'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Terminal, Activity, Wifi, Cpu, Shield, Search } from 'lucide-react'

const logs = [
  { type: 'info', msg: 'Initializing Neural Network v4.2...' },
  { type: 'success', msg: 'Connection to Binance, Coinbase, Kraken established.' },
  { type: 'process', msg: 'Scanning BTC/USDT market depth...' },
  { type: 'warning', msg: 'High volatility detected. Adjusting risk parameters.' },
  { type: 'analysis', msg: 'Pattern identified: Bullish Divergence (Confidence: 94%)' },
  { type: 'action', msg: 'Executing LONG order @ $64,230.50' },
  { type: 'success', msg: 'Order Filled. Position Active.' },
  { type: 'process', msg: 'Monitoring trailing stop loss...' },
  { type: 'info', msg: 'RSI divergence detected on ETH/USD.' },
  { type: 'analysis', msg: 'Sentiment Analysis: Positive (Twitter/News API)' },
  { type: 'action', msg: 'Adjusting portfolio allocation: +2% ETH' },
  { type: 'success', msg: 'Profit target hit on SOL/USDT. Closing position.' },
  { type: 'info', msg: 'Realized Profit: +$450.20 (Trade ID: #8823)' },
  { type: 'process', msg: 'Re-calibrating models for Asian session...' }
]

const LogItem = ({ log }: { log: any }) => {
  let color = 'text-slate-400'
  let icon = <Activity className="w-3 h-3" />
  
  switch(log.type) {
    case 'success': color = 'text-green-400'; icon = <Wifi className="w-3 h-3" />; break;
    case 'warning': color = 'text-yellow-400'; icon = <Shield className="w-3 h-3" />; break;
    case 'action': color = 'text-cyan-400'; icon = <Terminal className="w-3 h-3" />; break;
    case 'analysis': color = 'text-purple-400'; icon = <Cpu className="w-3 h-3" />; break;
    case 'process': color = 'text-blue-400'; icon = <Search className="w-3 h-3" />; break;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 font-mono text-sm mb-2 ${color}`}
    >
      <span className="opacity-50 text-xs">[{new Date().toLocaleTimeString()}]</span>
      {icon}
      <span>{log.msg}</span>
    </motion.div>
  )
}

export default function LiveDemoSection() {
  const [visibleLogs, setVisibleLogs] = useState<any[]>([])
  const scrollRef = useRef(null)
  
  // Parallax effect for the background elements
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"]
  })
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100])

  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      setVisibleLogs(prev => {
        const next = [...prev, logs[currentIndex]]
        if (next.length > 8) next.shift() // Keep only last 8 logs
        return next
      })
      currentIndex = (currentIndex + 1) % logs.length
    }, 1500) // New log every 1.5s

    return () => clearInterval(interval)
  }, [])

  return (
    <section ref={scrollRef} className="relative w-full py-32 px-6 md:px-16 lg:px-24 overflow-hidden bg-[#050A18]">
      {/* Narrative Header */}
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/20 border border-blue-500/30 mb-6"
        >
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-blue-400 text-sm font-medium tracking-wide">LIVE SYSTEM STATUS</span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
        >
          Watch the AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Analyze & Execute</span> <br />
          in Real-Time
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg max-w-2xl mx-auto"
        >
          See exactly how our Hybrid Engine processes millions of data points to identify profitable opportunities before the market moves.
        </motion.p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-center justify-center relative z-10">
        
        {/* The "Brain" Visual - Left Side */}
        <motion.div style={{ y: y1 }} className="w-full lg:w-1/2 relative">
             <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full" />
             <div className="relative bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                {/* Simulated Chart/Visual */}
                <div className="h-[300px] w-full bg-[#0a0f1b] rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20" 
                        style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                    />
                    
                    {/* Animated Scanning Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-scan" />
                    
                    {/* Central Pulse */}
                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-full border-2 border-cyan-500/50 flex items-center justify-center animate-pulse">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                <Cpu className="w-6 h-6 text-cyan-400" />
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-cyan-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                    </div>

                    {/* Floating Data Points */}
                    <motion.div 
                        animate={{ y: [0, -10, 0] }} 
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="absolute top-10 right-10 bg-slate-800/80 px-3 py-1 rounded text-xs text-green-400 border border-green-500/20"
                    >
                        BTC +2.4%
                    </motion.div>
                    <motion.div 
                        animate={{ y: [0, 10, 0] }} 
                        transition={{ repeat: Infinity, duration: 5 }}
                        className="absolute bottom-10 left-10 bg-slate-800/80 px-3 py-1 rounded text-xs text-blue-400 border border-blue-500/20"
                    >
                        Vol: High
                    </motion.div>
                </div>
                
                <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
                    <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        System Optimal
                    </div>
                    <div>Latency: 12ms</div>
                </div>
             </div>
        </motion.div>

        {/* The "Terminal" - Right Side */}
        <motion.div style={{ y: y2 }} className="w-full lg:w-1/2">
             <div className="relative bg-[#020408] border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-[400px] flex flex-col">
                {/* Terminal Header */}
                <div className="bg-[#0a0f1b] px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="ml-4 text-xs text-slate-400 font-mono">hybrid-engine-core — bash — 80x24</div>
                </div>
                
                {/* Terminal Content */}
                <div className="p-6 font-mono text-sm overflow-hidden flex-1 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020408]/80 pointer-events-none z-10" />
                    
                    {visibleLogs.map((log, idx) => (
                        <LogItem key={idx} log={log} />
                    ))}
                    
                    <motion.div 
                        animate={{ opacity: [0, 1, 0] }} 
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-2 h-4 bg-cyan-500 mt-2"
                    />
                </div>
             </div>
        </motion.div>
      </div>
    </section>
  )
}
