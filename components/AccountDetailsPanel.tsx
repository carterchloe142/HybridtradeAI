'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Wallet, ReceiptText, PieChart, Settings, LogOut, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId, getUserInvestments, getUserRecentTransactions, getUserWallets } from '@/lib/db'

type Props = {
  open: boolean
  onClose: () => void
}

type Snapshot = {
  userId: string
  email: string
  displayName: string
  planLabel: string
  wallets: Array<{ currency: string; balance: number }>
  investments: any[]
  transactions: Array<{ createdAt?: string; type: string; amount: number; currency: string; status: string }>
  loadedAt: string
}

function fmtMoney(n: number) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '0.00'
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function planName(raw: string) {
  const k = String(raw || '').toLowerCase()
  if (!k) return 'Free'
  if (k === 'starter') return 'Starter'
  if (k === 'pro') return 'Pro'
  if (k === 'elite') return 'Elite'
  return raw
}

export default function AccountDetailsPanel({ open, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [error, setError] = useState<string>('')
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  const initials = useMemo(() => {
    const s = String(snapshot?.displayName || snapshot?.email || '').trim()
    if (!s) return 'U'
    const base = s.includes('@') ? s.split('@')[0] : s
    const parts = base.split(/[\s._-]+/).filter(Boolean)
    const a = parts[0]?.[0] || base[0]
    const b = parts[1]?.[0] || parts[0]?.[1] || ''
    return `${String(a || '').toUpperCase()}${String(b || '').toUpperCase()}`.slice(0, 2) || 'U'
  }, [snapshot?.displayName, snapshot?.email])

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const [{ data: sessionRes }, userId] = await Promise.all([supabase.auth.getSession(), getCurrentUserId()])
      const u = sessionRes?.session?.user
      const email = String(u?.email || '')
      const meta: any = (u as any)?.user_metadata || {}
      const displayName = String(meta?.username || meta?.name || meta?.full_name || '') || (email ? email.split('@')[0] : '')
      const uid = userId ? String(userId) : String(u?.id || '')
      if (!uid) throw new Error('not_authenticated')

      const [walletsRaw, investmentsRaw, txsRaw] = await Promise.all([
        getUserWallets(uid),
        getUserInvestments(uid),
        getUserRecentTransactions(uid, 6),
      ])

      const active = investmentsRaw.find((i) => String(i.status || '').toLowerCase() === 'active')
      const label = planName(String(active?.plan_id || ''))

      const wallets = walletsRaw.map((w) => ({ currency: String(w.currency || 'USD'), balance: Number(w.balance || 0) }))
      const transactions = txsRaw.map((t) => ({
        createdAt: t.createdAt,
        type: String(t.type || 'UNKNOWN'),
        amount: Number(t.amount || 0),
        currency: String(t.currency || 'USD'),
        status: String(t.status || 'PENDING'),
      }))

      setSnapshot({
        userId: uid,
        email,
        displayName,
        planLabel: label || 'Free',
        wallets,
        investments: investmentsRaw,
        transactions,
        loadedAt: new Date().toISOString(),
      })
    } catch (e: any) {
      setError(String(e?.message || 'load_failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return
    refresh()
    const id = window.setInterval(() => refresh(), 15000)
    return () => window.clearInterval(id)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [open])

  const totalInvestedUSD = useMemo(() => {
    const investments = Array.isArray(snapshot?.investments) ? snapshot.investments : []
    return investments
      .filter((i) => String(i.status || '').toLowerCase() === 'active')
      .reduce((sum, i) => sum + Number(i.amount_usd ?? i.amountUsd ?? i.principal ?? i.amount ?? 0), 0)
  }, [snapshot?.investments])

  const activeCount = useMemo(() => {
    const investments = Array.isArray(snapshot?.investments) ? snapshot.investments : []
    return investments.filter((i) => String(i.status || '').toLowerCase() === 'active').length
  }, [snapshot?.investments])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-card/95 backdrop-blur-xl border-l border-border/40 shadow-2xl">
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-border/40 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">账户详情</div>
              <div className="text-xs text-muted-foreground truncate">{snapshot?.email || '—'}</div>
            </div>
            <button ref={closeBtnRef} onClick={onClose} className="p-2 rounded-xl hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors" aria-label="Close panel">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{snapshot?.displayName || snapshot?.email || 'User'}</div>
                <div className="text-xs text-muted-foreground truncate">Plan: {snapshot?.planLabel || 'Free'}</div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-border/40 bg-muted/10 p-4 text-xs text-muted-foreground">{error}</div>
            )}

            <div className="rounded-2xl border border-border/40 bg-muted/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <Wallet size={16} className="text-primary" />
                账户余额
              </div>
              {loading && !snapshot ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Loading…
                </div>
              ) : (
                <div className="space-y-2">
                  {(snapshot?.wallets || []).length === 0 ? (
                    <div className="text-xs text-muted-foreground">暂无钱包</div>
                  ) : (
                    snapshot!.wallets.map((w) => (
                      <div key={w.currency} className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">{w.currency}</div>
                        <div className="font-mono text-foreground">{fmtMoney(w.balance)}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border/40 bg-muted/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <PieChart size={16} className="text-primary" />
                投资组合概览
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/10 dark:bg-black/20 border border-border/40 p-3">
                  <div className="text-[11px] text-muted-foreground">Active Investments</div>
                  <div className="text-lg font-bold text-foreground">{activeCount}</div>
                </div>
                <div className="rounded-xl bg-muted/10 dark:bg-black/20 border border-border/40 p-3">
                  <div className="text-[11px] text-muted-foreground">Invested (USD)</div>
                  <div className="text-lg font-bold text-foreground">${fmtMoney(totalInvestedUSD)}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-muted/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <ReceiptText size={16} className="text-primary" />
                近期交易
              </div>
              <div className="space-y-2">
                {(snapshot?.transactions || []).length === 0 ? (
                  <div className="text-xs text-muted-foreground">暂无记录</div>
                ) : (
                  snapshot!.transactions.slice(0, 5).map((t, idx) => (
                    <div key={`${t.type}-${idx}`} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate">{t.type}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{t.createdAt ? new Date(t.createdAt).toLocaleString() : '—'} • {t.status}</div>
                      </div>
                      <div className="text-xs font-mono text-foreground">{t.amount >= 0 ? '+' : ''}{fmtMoney(t.amount)} {t.currency}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-muted/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <Settings size={16} className="text-primary" />
                账户设置
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { onClose(); router.push('/profile') }} className="rounded-xl bg-muted/10 dark:bg-black/20 border border-border/40 px-3 py-2 text-xs text-foreground hover:bg-muted/20 transition-colors">Profile</button>
                <button onClick={() => { onClose(); router.push('/transactions') }} className="rounded-xl bg-muted/10 dark:bg-black/20 border border-border/40 px-3 py-2 text-xs text-foreground hover:bg-muted/20 transition-colors">Transactions</button>
                <button onClick={() => { onClose(); router.push('/plans') }} className="rounded-xl bg-muted/10 dark:bg-black/20 border border-border/40 px-3 py-2 text-xs text-foreground hover:bg-muted/20 transition-colors">Plans</button>
                <button onClick={() => { onClose(); router.push('/withdraw') }} className="rounded-xl bg-muted/10 dark:bg-black/20 border border-border/40 px-3 py-2 text-xs text-foreground hover:bg-muted/20 transition-colors">Withdraw</button>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  onClose()
                  router.push('/')
                }}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/15 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>

            <div className="text-[11px] text-muted-foreground">Updated: {snapshot?.loadedAt ? new Date(snapshot.loadedAt).toLocaleTimeString() : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
