"use client"
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { BrainCircuit, Users, ShieldCheck, Activity } from 'lucide-react'
import RequireAuth from '@/components/RequireAuth'
import FuturisticBackground from '@/components/ui/FuturisticBackground'
import { useI18n } from '@/hooks/useI18n'
import { useTheme } from '@/components/ThemeProvider'
import TradeFeed from '@/components/TradeFeed'
import StrategyInsights from '@/components/StrategyInsights'
import AllocationChart from '@/components/AllocationChart'
import TopTradersList from '@/components/TopTradersList'
import AiLogsList from '@/components/AiLogsList'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function StrategyPage() {
  const { t } = useI18n()
  const { theme } = useTheme()

  return (
    <RequireAuth>
      <FuturisticBackground />
      <div className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent flex items-center gap-3 justify-center md:justify-start">
               <BrainCircuit size={32} className="text-primary" />
               {t('strategy_title')}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
                {t('strategy_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Allocation Chart */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-1 bg-card/30 backdrop-blur-xl border border-border/40 rounded-3xl p-6 flex flex-col items-center"
            >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    {t('strategy_current_allocation')}
                </h3>
                <div className="w-64 h-64">
                    <AllocationChart />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-4">
                    {t('strategy_allocation_note')}
                </p>
            </motion.div>

            {/* Right Column */}
            <div className="col-span-1 md:col-span-2 space-y-6">

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 }}
                    className="bg-card/30 backdrop-blur-xl border border-border/40 rounded-3xl p-6"
                >
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-primary" />
                        {t('strategy_activity_title')}
                    </h3>
                    <div className="h-[320px]">
                      <TradeFeed />
                    </div>
                </motion.div>
                
                {/* Top Traders */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <TopTradersList />
                </motion.div>

                {/* AI Logs */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <AiLogsList />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 }}
                    className="h-[420px]"
                >
                  <StrategyInsights />
                </motion.div>

            </div>

          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
