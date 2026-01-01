'use client'

import React from 'react'
import { motion } from 'framer-motion'

const stats = [
  { label: 'Total Volume', value: '$2.4B+', prefix: '' },
  { label: 'Verified Users', value: '150K+', prefix: '' },
  { label: 'AI Accuracy', value: '99.4%', prefix: '' },
  { label: 'Countries', value: '120+', prefix: '' },
]

export default function StatsSection() {
  return (
    <section className="py-12 border-y border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                {stat.value}
              </h3>
              <p className="text-sm md:text-base text-gray-500 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
