"use client"
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/hooks/useI18n'
import { ShieldCheck } from 'lucide-react'

type Log = {
    id: string
    date: string
    action: string
}

export default function AiLogsList() {
    const { t } = useI18n()
    const [logs, setLogs] = useState<Log[]>([])

    useEffect(() => {
        const fetchLogs = async () => {
            const { data } = await supabase.from('AiLogs').select('*').order('created_at', { ascending: false })
            if (data) setLogs(data as any)
        }
        fetchLogs()

        const channel = supabase.channel('public:AiLogs')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'AiLogs' }, fetchLogs)
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    return (
        <div className="bg-card/30 backdrop-blur-xl border border-border/40 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-green-400" />
                {t('strategy_reallocation_log')}
            </h3>
            <div className="space-y-4">
                {logs.map((log, i) => (
                    <div key={log.id || i} className="flex gap-4 items-start">
                        <div className="min-w-[60px] text-sm text-muted-foreground font-mono pt-1">{log.date}</div>
                        <div className="p-3 rounded-xl bg-muted/10 border border-border/30 flex-1 text-sm">
                            {log.action}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
