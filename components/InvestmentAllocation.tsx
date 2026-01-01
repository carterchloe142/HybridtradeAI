import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getPlanConfig } from '../lib/plans';
import { useTheme } from './ThemeProvider';
import { PieChart, Activity, Zap, Layers } from 'lucide-react';
import { useMemo } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function InvestmentAllocation({ planId, amount }: { planId: string, amount: number }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const config = getPlanConfig(planId);
  const palette = useMemo(() => {
    const tokens = ['success', 'primary', 'accent', 'warning', 'destructive', 'secondary'];
    const alpha = isDark ? 0.7 : 0.6;
    const resolve = (token: string) => {
      if (typeof window === 'undefined') return null;
      const v = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();
      return v ? `hsl(${v} / ${alpha})` : null;
    };
    const len = config?.allocation?.length ?? 0;
    return Array.from({ length: len }).map((_, i) => {
      const fromToken = resolve(tokens[i % tokens.length]);
      if (fromToken) return fromToken;
      const fallback = config?.allocation?.[i]?.color;
      return fallback || 'hsl(var(--primary))';
    });
  }, [isDark, config]);
  
  if (!config) return null;

  const data = {
    labels: config.allocation.map(a => a.name),
    datasets: [
      {
        data: config.allocation.map(a => a.percentage),
        backgroundColor: palette,
        borderColor: 'transparent',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const idx = ctx.dataIndex;
            const item = config.allocation[idx];
            const val = (amount * item.percentage) / 100;
            return `${item.name}: ${item.percentage}% ($${val.toFixed(2)})`;
          }
        }
      }
    },
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      {/* Allocation Chart */}
      <div className="card-neon p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
          <PieChart size={20} className="text-primary" />
          Capital Allocation
        </h3>
        
        <div className="grid grid-cols-[1fr,1.5fr] gap-6 items-center">
          <div className="relative h-40 w-40 mx-auto">
            <Doughnut data={data} options={options} />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-bold text-lg">${amount.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {config.allocation.map((item, idx) => (
              <div key={item.name} className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: palette[idx] }} />
                <div>
                  <div className="font-medium text-sm flex justify-between w-full gap-4">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    ${((amount * item.percentage) / 100).toFixed(2)} allocated
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Streams & Activity */}
      <div className="card-neon p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
          <Activity size={20} className="text-primary" />
          Active Revenue Streams
        </h3>

        <div className="space-y-4">
          {config.allocation.map((item, i) => (
            <div key={i} className="glass p-3 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {i === 0 ? <Zap size={18} /> : <Layers size={18} />}
                </div>
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/40 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  <span className="text-xs font-medium text-success">Active</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">Generating Yield</span>
              </div>
            </div>
          ))}
          
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground text-center bg-muted/20 p-2 rounded-lg">
            Profit generation is automated. Returns are credited to your wallet weekly.
          </div>
        </div>
      </div>
    </div>
  );
}
