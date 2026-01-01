import { useEffect, useState } from 'react'
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
import { supabase } from '../lib/supabase'

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
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: []
  })

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
        labels.push(new Date(trade.simulatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        values.push(cumulative)
      })

      setChartData({
        labels,
        datasets: [
          {
            label: 'Live Portfolio Performance (%)',
            data: values,
            borderColor: '#3b82f6', // blue-500
            backgroundColor: (context: any) => {
              const ctx = context.chart.ctx
              const gradient = ctx.createLinearGradient(0, 0, 0, 200)
              gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)')
              gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)')
              return gradient
            },
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 6
          }
        ]
      })
    }

    fetchPerformance()
    const interval = setInterval(fetchPerformance, 10000)
    return () => clearInterval(interval)
  }, [])

  const options = {
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
  }

  return (
    <div className="glass p-6 rounded-2xl h-[350px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg">Live Performance</h3>
          <p className="text-xs text-muted-foreground">Real-time cumulative profit</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
           <span className="text-xs font-mono text-green-500">MARKET OPEN</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Line options={options} data={chartData} />
      </div>
    </div>
  )
}
