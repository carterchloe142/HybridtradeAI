import React from 'react';

export default function ROIGauge({ value = 12.5, target = 15 }) {
  const percentage = Math.min(100, Math.max(0, (value / target) * 100));
  const radius = 30;
  const circumference = radius * Math.PI; // Semi-circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-12 flex items-end justify-center overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 70 35">
        <path
          d="M5 30 A 25 25 0 0 1 65 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/20"
        />
        <path
          d="M5 30 A 25 25 0 0 1 65 30"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute bottom-0 text-xs font-bold text-foreground">
        {value}%
      </div>
    </div>
  );
}
