import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const PREDICTIONS = [
  { text: "BTC breakout above $68k likely in next 4h", confidence: 88, type: 'bullish' },
  { text: "High volatility expected in EUR/USD session", confidence: 92, type: 'warning' },
  { text: "Tech sector accumulation detected", confidence: 75, type: 'bullish' },
  { text: "Gold approaching key resistance at 2050", confidence: 82, type: 'neutral' },
];

export default function AIPredictionCard() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % PREDICTIONS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const pred = PREDICTIONS[current];

  return (
    <div className="relative glass p-6 rounded-2xl border border-border/50 h-full overflow-hidden group">
      {/* Background Gradient Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 animate-pulse-slow" />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
          </div>
          <div className="text-[10px] font-mono bg-background/50 px-2 py-1 rounded border border-border/50">
            {pred.confidence}% Conf.
          </div>
        </div>

        <div className="mt-4">
          <p key={current} className="text-lg font-medium leading-tight animate-slide-up duration-500">
            {pred.text}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary transition-colors cursor-pointer">
          <span>View Analysis</span>
          <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}
