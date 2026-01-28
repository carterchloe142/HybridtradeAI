import { useEffect, useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import { useI18n } from '@/hooks/useI18n'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function LivePerformance() {
  const { theme } = useTheme()
  const { nf, t, df } = useI18n()
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: []
  })

  const [stats, setStats] = useState<{ total: number; winRate: number; lastAt: string; lastPnl: number }>(
    { total: 0, winRate: 0, lastAt: '', lastPnl: 0 },
  )

  const readColor = (varName: string, fallback: string) => {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
      if (!v) return fallback
      return `hsl(${v})`
    } catch {
      return fallback
    }
  }

  useEffect(() => {
    const fetchPerformance = async () => {
      // Get recent trades to build the curve
      const { data } = await supabase
        .from('TradeLog')
        .select('profitPct, simulatedAt')
        .order('simulatedAt', { ascending: true })
        .limit(50) // Last 50 trades
      
      if (!data) return

      let cumulative = 0
      const labels = []
      const values = []

      // Start from 0
      labels.push('')
      values.push(0)

      data.forEach((trade: any) => {
        cumulative += Number(trade.profitPct || 0)
        labels.push(df(new Date(trade.simulatedAt), { hour: '2-digit', minute: '2-digit' } as any))
        values.push(cumulative)
      })

      const total = data.length
      const wins = data.filter((x: any) => Number(x.profitPct || 0) > 0).length
      const winRate = total ? (wins / total) * 100 : 0
      const last = data[total - 1]
      setStats({
        total,
        winRate,
        lastAt: last?.simulatedAt ? String(last.simulatedAt) : '',
        lastPnl: Number(last?.profitPct || 0),
      })

      const line = readColor('--primary', theme === 'dark' ? '#22d3ee' : '#0284c7')
      const grid = readColor('--border', theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)')
      const tick = readColor('--muted-foreground', theme === 'dark' ? '#94a3b8' : '#475569')
      const tooltipBg = readColor('--card', theme === 'dark' ? '#0b1020' : '#ffffff')
      const tooltipText = readColor('--foreground', theme === 'dark' ? '#ffffff' : '#0f172a')
      const tooltipBorder = readColor('--border', theme === 'dark' ? '#334155' : '#e2e8f0')

      setChartData({
        labels,
        datasets: [
          {
            label: 'Live Portfolio Performance (%)',
            data: values,
            borderColor: line,
            backgroundColor: (context: any) => {
              const ctx = context.chart.ctx
              const gradient = ctx.createLinearGradient(0, 0, 0, 200)
              gradient.addColorStop(0, theme === 'dark' ? 'rgba(34, 211, 238, 0.35)' : 'rgba(2, 132, 199, 0.25)')
              gradient.addColorStop(1, theme === 'dark' ? 'rgba(34, 211, 238, 0.0)' : 'rgba(2, 132, 199, 0.0)')
              return gradient
            },
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 6
          }
        ]
      })

      setOptions((prev: any) => ({
        ...prev,
        plugins: {
          ...prev.plugins,
          tooltip: {
            ...(prev.plugins as any)?.tooltip,
            backgroundColor: tooltipBg,
            titleColor: tooltipText,
            bodyColor: tooltipText,
            borderColor: tooltipBorder,
          },
        },
        scales: {
          x: {
            ...(prev.scales as any)?.x,
            ticks: { ...(prev.scales as any)?.x?.ticks, color: tick },
            grid: { ...(prev.scales as any)?.x?.grid, color: grid },
          },
          y: {
            ...(prev.scales as any)?.y,
            ticks: { ...(prev.scales as any)?.y?.ticks, color: tick },
            grid: { ...(prev.scales as any)?.y?.grid, color: grid },
          },
        },
      }))
    }

    fetchPerformance()
    const interval = setInterval(fetchPerformance, 10000)
    return () => clearInterval(interval)
  }, [theme, df])

  const [options, setOptions] = useState<any>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          maxTicksLimit: 6
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  })

  const statPills = useMemo(() => {
    const last = stats.lastAt ? df(new Date(stats.lastAt)) : '—'
    const wr = nf(stats.winRate, { maximumFractionDigits: 1 })
    const lastPnl = nf(stats.lastPnl, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
    return [
      { k: t('total_trades'), v: String(stats.total) },
      { k: t('win_rate'), v: `${wr}%` },
      { k: t('last_trade'), v: `${last} • ${stats.lastPnl >= 0 ? '+' : ''}${lastPnl}%` },
    ]
  }, [df, nf, stats.lastAt, stats.lastPnl, stats.total, stats.winRate, t])

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/10 px-3 py-1 text-[11px] text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-green-600 dark:text-green-400">{t('market_open')}</span>
        </div>
        {statPills.map((p) => (
          <div key={p.k} className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/10 px-3 py-1 text-[11px] text-muted-foreground">
            <span className="text-foreground/90">{p.k}:</span>
            <span className="font-mono text-foreground">{p.v}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        <Line options={options} data={chartData} />
      </div>
    </div>
  )
}
