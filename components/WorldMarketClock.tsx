import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const MARKETS = [
  { city: 'New York', timezone: 'America/New_York', open: 9.5, close: 16 },
  { city: 'London', timezone: 'Europe/London', open: 8, close: 16.5 },
  { city: 'Tokyo', timezone: 'Asia/Tokyo', open: 9, close: 15 },
  { city: 'Sydney', timezone: 'Australia/Sydney', open: 10, close: 16 },
];

export default function WorldMarketClock() {
  const [times, setTimes] = useState<any[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const newTimes = MARKETS.map(m => {
        const timeString = now.toLocaleTimeString('en-US', { timeZone: m.timezone, hour: '2-digit', minute: '2-digit', hour12: false });
        const [h, min] = timeString.split(':').map(Number);
        const decimalTime = h + min / 60;
        const isOpen = decimalTime >= m.open && decimalTime < m.close;
        return { ...m, time: timeString, isOpen };
      });
      setTimes(newTimes);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass p-6 rounded-2xl border border-border/50 h-full flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-muted-foreground w-4 h-4" />
        <h3 className="font-semibold text-sm text-muted-foreground">Global Markets</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {times.map((m) => (
          <div key={m.city} className="flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground">{m.city}</span>
              <span className={`w-2 h-2 rounded-full ${m.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500/50'}`} />
            </div>
            <div className={`font-mono text-lg font-bold ${m.isOpen ? 'text-foreground' : 'text-muted-foreground opacity-60'}`}>
              {m.time}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {m.isOpen ? 'OPEN' : 'CLOSED'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
