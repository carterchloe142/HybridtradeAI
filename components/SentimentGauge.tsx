import React, { useEffect, useState } from 'react';
import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SentimentGauge() {
  const [score, setScore] = useState(72); // 0-100
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('up');

  useEffect(() => {
    // Simulate live sentiment updates
    const interval = setInterval(() => {
      setScore(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const newScore = Math.min(95, Math.max(20, prev + change));
        setTrend(newScore > prev ? 'up' : newScore < prev ? 'down' : 'neutral');
        return newScore;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getLabel = (s: number) => {
    if (s < 25) return { text: 'Extreme Fear', color: 'text-red-500' };
    if (s < 45) return { text: 'Fear', color: 'text-orange-500' };
    if (s < 55) return { text: 'Neutral', color: 'text-yellow-500' };
    if (s < 75) return { text: 'Greed', color: 'text-green-500' };
    return { text: 'Extreme Greed', color: 'text-emerald-500' };
  };

  const label = getLabel(score);
  const rotation = (score / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="glass p-6 rounded-2xl border border-border/50 h-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Gauge size={16} className="text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">AI Market Sentiment</span>
      </div>

      <div className="relative w-48 h-24 mt-4">
        {/* Gauge Background */}
        <div className="absolute inset-0 rounded-t-full border-[12px] border-muted/20 border-b-0" />
        
        {/* Gauge Value (Colored) */}
        {/* Note: CSS rotation for semi-circles is complex, using a simplified SVG approach for reliability */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50">
          <path d="M10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/10" />
          <path 
            d="M10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke={score > 50 ? '#22c55e' : '#ef4444'} 
            strokeWidth="12" 
            strokeDasharray="126"
            strokeDashoffset={126 - (126 * score) / 100}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-[calc(100%-10px)] bg-foreground origin-bottom transition-all duration-1000 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="w-3 h-3 bg-foreground rounded-full absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" />
        </div>
      </div>

      <div className="text-center mt-4">
        <div className={`text-2xl font-bold ${label.color} transition-colors duration-500`}>
          {label.text}
        </div>
        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          Score: {score}/100
          {trend === 'up' && <TrendingUp size={12} className="text-green-500" />}
          {trend === 'down' && <TrendingDown size={12} className="text-red-500" />}
          {trend === 'neutral' && <Minus size={12} className="text-yellow-500" />}
        </div>
      </div>
    </div>
  );
}
