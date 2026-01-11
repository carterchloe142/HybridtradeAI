import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SimulationResult } from '@/src/lib/market-data/types';
import { Activity, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserSimulationWidget({ plan = 'starter' }: { plan: 'starter' | 'pro' | 'elite' | 'none' }) {
  const [data, setData] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/simulation/run')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return (
    <div className="card-neon p-6 animate-pulse">
      <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
      <div className="h-24 bg-secondary rounded"></div>
    </div>
  );

  const scenario = data.scenarios.realtime;
  const isPositive = scenario.projectedRoi >= 0;
  
  // Plan-specific commentary
  const planName = plan === 'none' ? 'starter' : plan;
  const efficiency = {
    starter: { text: "Stable", color: "text-blue-500 dark:text-blue-400" },
    pro: { text: "Balanced", color: "text-purple-500 dark:text-purple-400" },
    elite: { text: "Aggressive", color: "text-pink-500 dark:text-pink-400" }
  }[planName];

  return (
    <div className="card-neon p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Activity size={100} />
      </div>

      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground">
        <Activity className="text-neon-blue" size={20} />
        Live Market Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Market Pulse */}
        <div className="glass p-4 rounded-xl border border-border">
          <div className="text-xs text-muted-foreground mb-1">Market Volatility</div>
          <div className="text-2xl font-bold text-foreground flex items-center gap-2">
            {(data.marketData.find(t => t.symbol === 'BTC')?.volatility || 0 * 100).toFixed(1)}%
            <span className="text-xs px-2 py-0.5 rounded bg-secondary font-normal text-foreground">High</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Based on BTC/ETH 24h movements
          </div>
        </div>

        {/* Projected Performance */}
        <div className="glass p-4 rounded-xl border border-border">
          <div className="text-xs text-muted-foreground mb-1">Projected Daily ROI</div>
          <div className={`text-2xl font-bold flex items-center gap-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {(scenario.projectedRoi * 100 / 365).toFixed(2)}%
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Real-time projection for <b>{planName.toUpperCase()}</b>
          </div>
        </div>

        {/* Risk/Reward */}
        <div className="glass p-4 rounded-xl border border-border">
          <div className="text-xs text-muted-foreground mb-1">Plan Efficiency</div>
          <div className={`text-2xl font-bold flex items-center gap-2 ${efficiency?.color}`}>
            <Shield size={20} />
            {efficiency?.text}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Risk Score: {scenario.riskScore.toFixed(0)}/100
          </div>
        </div>
      </div>

      {/* Live Ticker Tape */}
      <div className="mt-6 border-t border-border pt-4 overflow-hidden relative">
         <motion.div 
           className="flex gap-8 whitespace-nowrap"
           animate={{ x: [0, -500] }}
           transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
         >
           {[...data.marketData, ...data.marketData].map((ticker, i) => (
             <div key={i} className="flex items-center gap-2 text-sm">
               <span className="font-mono font-bold text-foreground">{ticker.symbol}</span>
               <span className={ticker.change24h >= 0 ? 'text-success' : 'text-destructive'}>
                 {ticker.change24h > 0 ? '+' : ''}{ticker.change24h.toFixed(2)}%
               </span>
             </div>
           ))}
         </motion.div>
      </div>
      
      <div className="mt-4 text-center">
        <Link href="/plans" className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors">
            Start Investing
        </Link>
      </div>
    </div>
  );
}
