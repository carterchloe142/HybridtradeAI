import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useTheme } from '@/components/ThemeProvider';
import { ShieldAlert } from 'lucide-react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function RiskRadar() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = {
    labels: ['Volatility', 'Diversification', 'Sentiment', 'Exposure', 'Stability', 'Liquidity'],
    datasets: [
      {
        label: 'Current Portfolio',
        data: [65, 85, 90, 45, 80, 75],
        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.2)',
        borderColor: isDark ? '#22c55e' : '#16a34a',
        borderWidth: 2,
        pointBackgroundColor: isDark ? '#22c55e' : '#16a34a',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: isDark ? '#22c55e' : '#16a34a',
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      r: {
        angleLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          color: isDark ? '#9ca3af' : '#4b5563',
          font: {
            size: 10,
          },
        },
        ticks: {
          display: false,
          backdropColor: 'transparent',
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="glass p-6 rounded-2xl border border-border/50 h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2 z-10">
        <ShieldAlert className="text-primary w-4 h-4" />
        <h3 className="font-semibold text-sm text-muted-foreground">Risk Analysis</h3>
      </div>
      
      <div className="flex-1 min-h-[200px] relative z-10">
        <Radar data={data} options={options} />
      </div>

      <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground z-10">
        <span>Risk Score: <strong className="text-green-500">Low</strong></span>
        <span>Health: <strong className="text-blue-500">92/100</strong></span>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0" />
    </div>
  );
}
