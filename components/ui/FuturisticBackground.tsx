import React from 'react';

export default function FuturisticBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-background transition-colors duration-300">
      {/* Deep space base for dark mode, subtle gradient for light mode */}
      <div className="absolute inset-0 bg-background dark:bg-[#030014]" />
      
      {/* Animated Gradient Orbs - Adjusted for visibility in both modes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 dark:bg-purple-900/20 blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-900/20 blur-[120px] animate-pulse-slow delay-1000" />
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 dark:bg-indigo-900/20 blur-[100px] animate-glow" />

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          color: 'var(--foreground)'
        }}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient-vignette dark:opacity-100 opacity-50" />
    </div>
  );
}
