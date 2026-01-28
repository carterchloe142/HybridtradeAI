"use client"
import React, { useEffect, useState, useMemo } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/hooks/useI18n'
import { useTheme } from '@/components/ThemeProvider'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function AllocationChart() {
  const { t } = useI18n()
  const { theme } = useTheme()
  const [data, setData] = useState<number[]>([50, 25, 20, 5])

  useEffect(() => {
    // Initial fetch
    const fetchAlloc = async () => {
      try {
        const { data: rows } = await supabase
          .from('Allocation')
          .select('algo_pct, copy_pct, staking_pct, ads_pct')
          .limit(1)
          .single()
        
        if (rows) {
          setData([
            Number(rows.algo_pct),
            Number(rows.copy_pct),
            Number(rows.staking_pct),
            Number(rows.ads_pct),
          ])
        }
      } catch {}
    }
    fetchAlloc()

    // Real-time subscription
    const channel = supabase
      .channel('public:Allocation')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Allocation' },
        (payload: any) => {
          const newRow = payload.new as any
          if (newRow) {
            setData([
              Number(newRow.algo_pct),
              Number(newRow.copy_pct),
              Number(newRow.staking_pct),
              Number(newRow.ads_pct),
            ])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const allocationData = {
    labels: [
      t('strategy_allocation_algo'),
      t('strategy_allocation_copy'),
      t('strategy_allocation_staking'),
      t('strategy_allocation_ads')
    ],
    datasets: [
      {
        data,
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)', // Primary (Purple)
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(16, 185, 129, 0.8)', // Green
          'rgba(234, 179, 8, 0.8)',  // Yellow
        ],
        borderColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(234, 179, 8, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const pieOptions = useMemo(
    () => ({
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: theme === 'dark' ? '#E5E7EB' : '#111827',
          },
        },
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart' as const,
      }
    }),
    [theme],
  )

  return <Pie data={allocationData} options={pieOptions} />
}
