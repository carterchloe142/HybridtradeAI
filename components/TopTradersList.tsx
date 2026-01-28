"use client"
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/hooks/useI18n'
import { Users } from 'lucide-react'

type Trader = {
    id: string
    name: string
    strategy: string
    roi: number
    risk: 'High' | 'Medium' | 'Low'
}

export default function TopTradersList() {
    const { t } = useI18n()
    const [traders, setTraders] = useState<Trader[]>([])

    useEffect(() => {
        const fetchTraders = async () => {
            const { data } = await supabase.from('TopTraders').select('*').order('roi', { ascending: false })
            if (data) setTraders(data as any)
        }
        fetchTraders()

        const channel = supabase.channel('public:TopTraders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'TopTraders' }, fetchTraders)
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    return (
        <div className="bg-card/30 backdrop-blur-xl border border-border/40 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users size={20} className="text-blue-400" />
                {t('strategy_top_copy_network')}
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border/30">
                            <th className="pb-3 pl-2">{t('strategy_table_trader')}</th>
                            <th className="pb-3">{t('strategy_table_strategy')}</th>
                            <th className="pb-3">{t('strategy_table_roi')}</th>
                            <th className="pb-3">{t('strategy_table_risk')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {traders.map((trader, i) => (
                            <tr key={trader.id || i} className="hover:bg-muted/10 transition-colors">
                                <td className="py-4 pl-2 font-medium">{trader.name}</td>
                                <td className="py-4 text-sm text-muted-foreground">{trader.strategy}</td>
                                <td className="py-4 text-green-400 font-bold">+{trader.roi}%</td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        trader.risk === 'High' ? 'bg-red-500/20 text-red-400' :
                                        trader.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-green-500/20 text-green-400'
                                    }`}>
                                        {trader.risk}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
