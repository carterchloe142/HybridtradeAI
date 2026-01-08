import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from './ThemeProvider';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Loader2, TrendingUp, Calendar, DollarSign } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailyPerformance {
  day: number;
  date: string;
  roi: number;
  amount: number;
  status: 'actual' | 'projected';
  marketCondition: string;
}

export default function InvestmentPerformanceChart({ investmentId, amount }: { investmentId: string, amount: number }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [data, setData] = useState<DailyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!investmentId) return;

    const fetchSim = async () => {
      try {
        const { data: session } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
        const token = session.session?.access_token;
        
        const res = await fetch(`/api/user/investments/${investmentId}/simulation`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to load performance data');
        
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSim();
  }, [investmentId]);

  if (loading) return <div className="flex items-center justify-center p-12 text-muted-foreground"><Loader2 className="animate-spin mr-2" /> Generating Performance Report...</div>;
  if (error) return <div className="text-destructive p-4 text-sm">Unable to load chart: {error}</div>;
  if (!data.length) return null;

  // Calculate Totals
  const totalRoi = data.reduce((sum, d) => sum + d.roi, 0);
  const totalProfit = data.reduce((sum, d) => sum + d.amount, 0);
  const currentDay = data.filter(d => d.status === 'actual').length;

  // Chart Configuration
  const chartData = {
    labels: data.map(d => `Day ${d.day}`),
    datasets: [
      {
        label: 'Daily Return (%)',
        data: data.map(d => d.roi),
        backgroundColor: data.map(d => d.status === 'actual' ? '#00e5ff' : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
        borderRadius: 4,
        borderWidth: 0,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: '#00e5ff',
        bodyColor: isDark ? '#fff' : '#000',
        padding: 12,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) => {
            const d = data[ctx.dataIndex];
            return [
              `ROI: ${d.roi.toFixed(2)}%`,
              `Profit: $${d.amount.toFixed(2)}`,
              `Status: ${d.status.toUpperCase()}`,
              `Market: ${d.marketCondition.toUpperCase()}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }
      }
    }
  };

  return (
    <div className="card-neon p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            14-Day Performance Analysis
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Day {currentDay} of 14 • {currentDay < 14 ? 'In Progress' : 'Completed'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-neon-green">
            +${totalProfit.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            Total Projected Profit ({totalRoi.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        <Stat label="Initial Investment" value={`$${amount.toFixed(2)}`} icon={<DollarSign size={14} />} />
        <Stat label="Maturity Date" value={new Date(data[13].date).toLocaleDateString()} icon={<Calendar size={14} />} />
        <Stat label="Avg. Daily ROI" value={`${(totalRoi / 14).toFixed(2)}%`} icon={<TrendingUp size={14} />} />
        <Stat label="Risk Adjusted Yield" value="Optimal" icon={<TrendingUp size={14} />} color="text-primary" />
      </div>
    </div>
  );
}

function Stat({ label, value, icon, color = 'text-foreground' }: any) {
  return (
    <div className="glass p-3 rounded-lg">
      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
        {icon} {label}
      </div>
      <div className={`font-semibold ${color}`}>{value}</div>
    </div>
  );
}
