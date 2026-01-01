'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe, 
  Zap, 
  Clock,
  ArrowRight,
  BarChart3,
  PieChart,
  Newspaper
} from 'lucide-react'
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
import { Line } from 'react-chartjs-2'

// Register ChartJS components
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

const marketData = [
  { symbol: 'BTC/USD', price: '64,231.45', change: '+2.4%', up: true },
  { symbol: 'ETH/USD', price: '3,452.12', change: '+1.8%', up: true },
  { symbol: 'SOL/USD', price: '145.67', change: '-0.5%', up: false },
  { symbol: 'NDX', price: '17,890.00', change: '+0.9%', up: true },
  { symbol: 'GOLD', price: '2,345.50', change: '+0.1%', up: true },
]

const aiSignals = [
  { pair: 'BTC/USDT', type: 'LONG', entry: '64,100', target: '65,500', stop: '63,500', confidence: 92, time: '10m ago' },
  { pair: 'ETH/USDT', type: 'LONG', entry: '3,440', target: '3,550', stop: '3,380', confidence: 88, time: '25m ago' },
  { pair: 'SOL/USDT', type: 'SHORT', entry: '146.50', target: '142.00', stop: '148.00', confidence: 75, time: '1h ago' },
  { pair: 'XRP/USDT', type: 'NEUTRAL', entry: '-', target: '-', stop: '-', confidence: 45, time: '2h ago' },
]

const newsItems = [
  { title: 'SEC Approves New Bitcoin ETF Applications', source: 'CryptoDaily', time: '2h ago', sentiment: 'Bullish' },
  { title: 'Federal Reserve Hints at Rate Cuts in Q3', source: 'FinanceYahoo', time: '4h ago', sentiment: 'Bullish' },
  { title: 'Tech Stocks Rally on AI Innovation Reports', source: 'Bloomberg', time: '5h ago', sentiment: 'Bullish' },
  { title: 'Global Supply Chain Disruptions Impact Manufacturing', source: 'Reuters', time: '8h ago', sentiment: 'Bearish' },
]

export default function InsightsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Chart Data Configuration
  const chartData = {
    labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    datasets: [
      {
        label: 'BTC Price',
        data: [63500, 63800, 63600, 64100, 63900, 64200, 64231],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'AI Prediction',
        data: [63500, 63850, 63700, 64200, 64100, 64400, 64600],
        borderColor: '#06b6d4',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#9ca3af' }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af' }
      }
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen text-white space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
            Market Intelligence
          </h1>
          <p className="text-gray-400 mt-2">Real-time AI analysis and trading signals</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-600/30 transition-all flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Feed
          </button>
          <button className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-600/30 transition-all flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI Scanner
          </button>
        </div>
      </div>

      {/* Market Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {marketData.map((item, index) => (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm hover:border-blue-500/30 transition-colors"
          >
            <div className="text-sm text-gray-400">{item.symbol}</div>
            <div className="text-lg font-bold mt-1">{item.price}</div>
            <div className={`text-xs mt-1 flex items-center gap-1 ${item.up ? 'text-green-400' : 'text-red-400'}`}>
              {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {item.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Chart & Analysis */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                BTC/USD Performance
              </h2>
              <div className="flex gap-2">
                {['1H', '4H', '1D', '1W'].map((tf) => (
                  <button key={tf} className="px-3 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 transition-colors">
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <Line options={chartOptions} data={chartData} />
            </div>
          </motion.div>

          {/* Recent News */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Newspaper className="w-5 h-5 text-cyan-400" />
              Market News
            </h2>
            <div className="space-y-4">
              {newsItems.map((news, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">{news.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{news.source}</span>
                      <span>•</span>
                      <span>{news.time}</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        news.sentiment === 'Bullish' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {news.sentiment}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Signals */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-b from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-md"
          >
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-blue-300">
              <Zap className="w-5 h-5" />
              AI Signals
            </h2>
            <div className="space-y-4">
              {aiSignals.map((signal, i) => (
                <div key={i} className="bg-black/40 border border-white/5 rounded-xl p-4 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl ${
                    signal.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 
                    signal.type === 'SHORT' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {signal.type}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">{signal.pair}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {signal.time}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-500 block">Entry</span>
                      <span className="text-gray-300">{signal.entry}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Target</span>
                      <span className="text-blue-400">{signal.target}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Stop</span>
                      <span className="text-red-400">{signal.stop}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                    <div 
                      className={`h-full rounded-full ${
                        signal.confidence > 80 ? 'bg-green-500' : signal.confidence > 60 ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-500">AI Confidence</span>
                    <span className="text-[10px] text-gray-300">{signal.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
              Upgrade for Premium Signals
            </button>
          </motion.div>

          {/* Market Sentiment */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-pink-400" />
              Sentiment Analysis
            </h2>
            <div className="flex items-center justify-center relative h-40">
               {/* Simple visual representation of sentiment */}
               <div className="text-center">
                 <div className="text-4xl font-bold text-green-400">68%</div>
                 <div className="text-sm text-gray-400">Greed</div>
               </div>
               <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                 <circle cx="50%" cy="50%" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                 <circle cx="50%" cy="50%" r="40" stroke="#4ade80" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="80" strokeLinecap="round" />
               </svg>
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">
              Market sentiment is currently leaning towards <span className="text-green-400">Greed</span> as institutional inflows increase.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
