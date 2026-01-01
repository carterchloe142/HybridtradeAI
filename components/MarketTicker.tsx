import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ASSETS = [
  { symbol: 'BTC', price: 67450.20, change: 2.4 },
  { symbol: 'ETH', price: 3450.80, change: 1.8 },
  { symbol: 'SOL', price: 145.20, change: -0.5 },
  { symbol: 'BNB', price: 580.10, change: 0.2 },
  { symbol: 'SPY', price: 510.45, change: 0.8 },
  { symbol: 'QQQ', price: 440.30, change: 1.2 },
  { symbol: 'NVDA', price: 890.00, change: 3.5 },
  { symbol: 'TSLA', price: 175.50, change: -1.2 },
];

export default function MarketTicker() {
  const [prices, setPrices] = useState(ASSETS);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(asset => ({
        ...asset,
        price: asset.price * (1 + (Math.random() * 0.002 - 0.001)), // Random small fluctuation
        change: asset.change + (Math.random() * 0.1 - 0.05)
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-muted/10 border-b border-border/50 overflow-hidden py-2 mb-6">
      <div className="flex animate-marquee whitespace-nowrap gap-8">
        {[...prices, ...prices].map((asset, i) => ( // Duplicate for seamless loop
          <div key={`${asset.symbol}-${i}`} className="flex items-center gap-2 text-sm">
            <span className="font-bold">{asset.symbol}</span>
            <span className="font-mono">${asset.price.toFixed(2)}</span>
            <span className={`flex items-center text-xs ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {asset.change >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
              {Math.abs(asset.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
