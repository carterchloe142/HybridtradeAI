import React from 'react';
import { TrendingUp, TrendingDown, Target, Percent } from 'lucide-react';

export default function PnLMetrics() {
  // Mock data - in production this would come from props or API
  const metrics = [
    { label: "Today's PnL", value: "+$1,240.50", change: "+2.4%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "7-Day PnL", value: "+$8,450.20", change: "+15.2%", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Win Rate", value: "78.4%", change: "+1.2%", icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Avg. ROI/Trade", value: "12.5%", change: "-0.5%", icon: Percent, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="glass p-4 rounded-xl border border-border/50 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-lg ${m.bg}`}>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${m.change.startsWith('+') ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
              {m.change}
            </span>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{m.label}</div>
            <div className="text-lg font-bold font-mono">{m.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
