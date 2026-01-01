'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Shield, ChevronRight, BarChart3, Globe, Lock } from 'lucide-react'
import TiltCard from '@/components/ui/TiltCard'

const features = [
  {
    icon: <Brain className="w-8 h-8 text-blue-400" />,
    title: "AI-Driven Insights",
    desc: "Advanced machine learning algorithms analyze market trends in real-time to provide actionable insights.",
    colSpan: "md:col-span-2"
  },
  {
    icon: <Zap className="w-8 h-8 text-purple-400" />,
    title: "Hybrid Execution",
    desc: "Combine the best of manual expertise and automated execution for consistent profitability.",
    colSpan: "md:col-span-1"
  },
  {
    icon: <Shield className="w-8 h-8 text-green-400" />,
    title: "Bank-Grade Security",
    desc: "Enterprise-grade security protocols ensure your assets and data remain protected at all times.",
    colSpan: "md:col-span-1"
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-orange-400" />,
    title: "Real-Time Analytics",
    desc: "Track your portfolio performance with millisecond-precision updates and detailed reporting.",
    colSpan: "md:col-span-2"
  }
]

export default function FeaturesSection() {
  return (
    <section id="platform" className="relative w-full py-24 bg-[#050A18] overflow-hidden px-6 md:px-16 lg:px-24">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Intelligent Investing with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Advanced AI Models</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 max-w-2xl mx-auto text-lg"
          >
            Our platform leverages state-of-the-art neural networks to predict market movements and execute trades with superhuman precision.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`${feature.colSpan} h-full group`}
              >
                <TiltCard className="h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500">
                    <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit border border-white/5 shadow-lg group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300">
                        {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  )
}
