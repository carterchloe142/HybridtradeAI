import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

const INSIGHTS = [
  { type: 'analysis', text: 'Analyzing BTC/USD volatility patterns across major exchanges.', icon: Brain, color: 'text-purple-500' },
  { type: 'action', text: 'Detected bullish divergence on ETH 4h chart. Increasing long exposure.', icon: Zap, color: 'text-yellow-500' },
  { type: 'market', text: 'Tech sector showing strength. Rebalancing portfolio towards NASDAQ-100 constituents.', icon: TrendingUp, color: 'text-blue-500' },
  { type: 'risk', text: 'High volatility detected in Asian markets. Tightening stop-loss parameters.', icon: AlertTriangle, color: 'text-red-500' },
  { type: 'analysis', text: 'Processing sentiment analysis from 50+ news sources. Sentiment: Greed.', icon: Brain, color: 'text-purple-500' },
];

export default function StrategyInsights() {
  const [currentInsight, setCurrentInsight] = useState(0);
  const [history, setHistory] = useState<any[]>([INSIGHTS[0]]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const nextIndex = Math.floor(Math.random() * INSIGHTS.length);
      const newInsight = { ...INSIGHTS[nextIndex], id: Date.now(), timestamp: new Date().toLocaleTimeString() };
      setHistory(prev => [newInsight, ...prev].slice(0, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass p-6 rounded-2xl border border-border/50 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Brain className="text-primary w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm">AI Strategy Log</h3>
          <p className="text-xs text-muted-foreground">Live decision processing</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-hidden relative">
        {history.map((item, i) => (
          <div key={item.id || i} className={`flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-500 ${i === 0 ? 'opacity-100' : 'opacity-60'}`}>
            <item.icon className={`w-4 h-4 mt-1 shrink-0 ${item.color}`} />
            <div className="text-sm">
              <p className="leading-snug">{item.text}</p>
              <span className="text-[10px] text-muted-foreground">
                {item.timestamp || (mounted ? new Date().toLocaleTimeString() : '')}
              </span>
            </div>
          </div>
        ))}
        
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
