'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function StoryLine() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Calculate height of the line based on scroll
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])
  
  return (
    <div ref={containerRef} className="absolute left-6 md:left-12 lg:left-24 top-0 bottom-0 w-[2px] z-0 hidden md:block pointer-events-none">
        {/* Background Track */}
        <div className="absolute inset-0 bg-slate-800/30 w-full h-full" />
        
        {/* Active Line */}
        <motion.div 
            style={{ scaleY, transformOrigin: 'top' }}
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500 via-purple-500 to-cyan-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />

        {/* Nodes at key sections - positioned absolutely relative to the container */}
        {/* These would need to be manually positioned or dynamically calculated. 
            For now, we place them at rough % intervals assuming standard section heights */}
        
        {/* Hero Node */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] z-10" />
        
        {/* Stats Node */}
        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-purple-500 border border-black z-10" />
        
        {/* Live Demo Node */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,1)] z-10" />
        
        {/* Features Node */}
        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-pink-500 border border-black z-10" />

        {/* Mobile Node */}
        <div className="absolute top-[85%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-green-500 border border-black z-10" />
    </div>
  )
}
