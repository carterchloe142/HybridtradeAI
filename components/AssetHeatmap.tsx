import React from 'react';
import { Layers } from 'lucide-react';

const SECTORS = [
  { name: 'Crypto', change: +4.2, color: 'bg-green-500' },
  { name: 'Tech', change: +1.8, color: 'bg-green-400' },
  { name: 'Forex', change: -0.5, color: 'bg-red-400' },
  { name: 'Energy', change: +2.1, color: 'bg-green-500' },
  { name: 'Metals', change: -1.2, color: 'bg-red-500' },
  { name: 'Defi', change: +5.6, color: 'bg-green-600' },
  { name: 'NFTs', change: -3.4, color: 'bg-red-600' },
  { name: 'Bonds', change: +0.1, color: 'bg-gray-400' },
];

export default function AssetHeatmap() {
  return (
    <div className="glass p-6 rounded-2xl border border-border/50 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="text-muted-foreground w-4 h-4" />
        <h3 className="font-semibold text-sm text-muted-foreground">Sector Heatmap</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-2 flex-1">
        {SECTORS.map((s) => (
          <div 
            key={s.name} 
            className={`${s.color} bg-opacity-20 hover:bg-opacity-30 transition-all rounded-lg p-2 flex flex-col justify-center items-center cursor-pointer group`}
          >
            <span className="text-[10px] font-bold opacity-70 group-hover:opacity-100">{s.name}</span>
            <span className={`text-xs font-mono font-bold ${s.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {s.change > 0 ? '+' : ''}{s.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
