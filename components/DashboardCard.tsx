import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  title: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function DashboardCard({ title, value, sublabel, icon, trend, trendValue, className = '', children }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(0, 229, 255, 0.2)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-card/40 backdrop-blur-xl border border-border/10
        shadow-lg group
        ${className}
      `}
    >
      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">{title}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground tracking-tight">{value}</span>
            {trend && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                trend === 'up' ? 'text-green-400 bg-green-400/10' : 
                trend === 'down' ? 'text-red-400 bg-red-400/10' : 
                'text-gray-400 bg-gray-400/10'
              }`}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
              </span>
            )}
          </div>
          {sublabel && <p className="mt-1 text-xs text-muted-foreground/80">{sublabel}</p>}
        </div>
        
        {icon && (
          <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:text-primary-foreground transition-colors duration-300">
            {icon}
          </div>
        )}
      </div>

      {/* Neon Line at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      {children && <div className="relative z-10 mt-3">{children}</div>}
    </motion.div>
  );
}
