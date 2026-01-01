"use client"
import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0a0f1b]">
      <div className="flex flex-col items-center gap-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: [0.8, 1.05, 1], opacity: 1 }} transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }} className="rounded-full p-4 bg-white/5 border border-white/10">
          <Bot className="w-12 h-12 text-neon-blue" />
        </motion.div>
        <div className="flex items-center gap-1 text-2xl font-bold">
          {Array.from('HybridTradeAI').map((ch, i) => (
            <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: [0, 1, 0.6, 1], y: [6, 0, 0, 0] }} transition={{ duration: 1.2, delay: i * 0.05, repeat: Infinity }} className="neon-text">
              {ch}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  )
}
