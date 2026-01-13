'use client';

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import FuturisticBackground from '@/components/ui/FuturisticBackground'
import { ArrowLeft, Filter, RefreshCw, CheckCircle2, XCircle, Clock, ArrowRightLeft } from 'lucide-react'
import Link from 'next/link'

type TxRow = {
  id: string
  user_id: string
  type: string
  amount?: number
  amount_usd?: number
  currency: string
  status: string
  tx_hash?: string
  created_at: string
}

export default function UserTransactions() {
  const [rows, setRows] = useState<TxRow[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  async function fetchTx() {
    setLoading(true)
    setMsg('')
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) {
        setMsg('Sign in required')
        setRows([])
        return
      }
      const params = new URLSearchParams()
      params.set('page', '1')
      params.set('limit', '100')
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/user/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.error || 'Failed to load transactions')
      setRows(Array.isArray(payload.items) ? payload.items : [])
    } catch (e: any) {
      setMsg(e?.message || 'Failed to load transactions')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTx()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter])

  const types = useMemo(() => {
    const set = new Set<string>()
    rows.forEach((r) => { if (r.type) set.add(r.type.toLowerCase()) })
    return ['all', ...Array.from(set).sort()]
  }, [rows])

  const statuses = useMemo(() => {
    const set = new Set<string>()
    rows.forEach((r) => { if (r.status) set.add(r.status.toLowerCase()) })
    return ['all', ...Array.from(set).sort()]
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (typeFilter !== 'all' && r.type.toLowerCase() !== typeFilter.toLowerCase()) return false
      if (statusFilter !== 'all' && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false
      return true
    })
  }, [rows, typeFilter, statusFilter])

  function formatType(tx: TxRow) {
    const t = tx.type?.toUpperCase() || '';
    if (t === 'DEPOSIT') return 'Deposit';
    if (t === 'WITHDRAWAL') return 'Withdrawal';
    if (t === 'INVESTMENT') return 'Investment';
    if (t === 'ROI') return 'ROI';
    if (t === 'REFERRAL') return 'Referral';
    return tx.type || '-';
  }

  return (
    <>
      <FuturisticBackground />
      
      <div className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/dashboard" className="p-2 rounded-xl bg-card/40 border border-border/10 hover:bg-accent/10 transition-all text-muted-foreground hover:text-foreground backdrop-blur-md group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Transaction History
              </h1>
              <p className="text-muted-foreground text-sm">Track your deposits, withdrawals, and trades</p>
            </div>
          </motion.div>

          {msg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"
            >
              <XCircle size={16} />
              {msg}
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl"
          >
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-border/10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter size={16} />
                Filters:
              </div>
              
              <select 
                className="bg-background/50 border border-border/10 rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none transition-colors capitalize" 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {types.map((t) => (<option key={t} value={t} className="bg-background text-foreground capitalize">{t === 'all' ? 'All Types' : t}</option>))}
              </select>

              <select 
                className="bg-background/50 border border-border/10 rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 outline-none transition-colors capitalize" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map((s) => (<option key={s} value={s} className="bg-background text-foreground capitalize">{s === 'all' ? 'All Statuses' : s}</option>))}
              </select>

              <button 
                onClick={fetchTx}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted/80 border border-border/10 transition-colors text-sm text-muted-foreground hover:text-foreground"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/10">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Currency</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {loading && rows.length === 0 && (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`sk_${i}`} className="animate-pulse">
                        <td className="px-4 py-4"><div className="h-4 w-24 bg-muted/50 rounded" /></td>
                        <td className="px-4 py-4"><div className="h-4 w-20 bg-muted/50 rounded" /></td>
                        <td className="px-4 py-4"><div className="h-4 w-12 bg-muted/50 rounded" /></td>
                        <td className="px-4 py-4"><div className="h-4 w-20 bg-muted/50 rounded" /></td>
                        <td className="px-4 py-4"><div className="h-4 w-32 bg-muted/50 rounded ml-auto" /></td>
                      </tr>
                    ))
                  )}
                  {filtered.map((tx, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={tx.id} 
                      className="hover:bg-muted/50 transition-colors group"
                    >
                      <td className="px-4 py-4 text-foreground capitalize flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <ArrowRightLeft size={14} />
                        </span>
                        {formatType(tx)}
                      </td>
                      <td className="px-4 py-4 text-foreground font-mono font-medium">
                        {typeof tx.amount_usd === 'number' ? tx.amount_usd.toFixed(2) : tx.amount}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 rounded bg-muted/50 border border-border/10 text-xs font-medium text-muted-foreground uppercase">
                          {tx.currency}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            tx.status.toLowerCase() === 'confirmed' || tx.status.toLowerCase() === 'completed'
                              ? 'bg-green-500/10 border-green-500/20 text-green-500'
                              : tx.status.toLowerCase() === 'cancelled' || tx.status.toLowerCase() === 'failed' || tx.status.toLowerCase() === 'rejected'
                              ? 'bg-destructive/10 border-destructive/20 text-destructive'
                              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                          }`}
                        >
                          {tx.status.toLowerCase() === 'confirmed' && <CheckCircle2 size={12} />}
                          {(tx.status.toLowerCase() === 'cancelled' || tx.status.toLowerCase() === 'failed' || tx.status.toLowerCase() === 'rejected') && <XCircle size={12} />}
                          {tx.status.toLowerCase() !== 'confirmed' && tx.status.toLowerCase() !== 'cancelled' && tx.status.toLowerCase() !== 'failed' && tx.status.toLowerCase() !== 'rejected' && <Clock size={12} />}
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-xs text-right font-mono">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td className="px-4 py-12 text-center text-muted-foreground" colSpan={5}>
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 rounded-full bg-muted/50">
                            <Filter size={24} className="opacity-20" />
                          </div>
                          <p>No transactions found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
