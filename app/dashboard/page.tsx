'use client';

export const dynamic = "force-dynamic";

import dynamicImport from 'next/dynamic'
const Sidebar = dynamicImport(() => import('@/components/Sidebar'))
const LivePerformance = dynamicImport(() => import('@/components/LivePerformance'), { ssr: false })
const TradeFeed = dynamicImport(() => import('@/components/TradeFeed'), { ssr: false })
const InvestmentAllocation = dynamicImport(() => import('@/components/InvestmentAllocation'), { ssr: false })
const StrategyInsights = dynamicImport(() => import('@/components/StrategyInsights'), { ssr: false })
const SentimentGauge = dynamicImport(() => import('@/components/SentimentGauge'), { ssr: false })
const RecentActivity = dynamicImport(() => import('@/components/RecentActivity'), { ssr: false })
const WorldMarketClock = dynamicImport(() => import('@/components/WorldMarketClock'), { ssr: false })
const RiskRadar = dynamicImport(() => import('@/components/RiskRadar'), { ssr: false })
const AssetHeatmap = dynamicImport(() => import('@/components/AssetHeatmap'), { ssr: false })
const AIPredictionCard = dynamicImport(() => import('@/components/AIPredictionCard'), { ssr: false })
import DashboardSkeleton from '@/components/DashboardSkeleton'
import RequireAuth from '@/components/RequireAuth';
import { useCurrency, supportedCurrencies } from '@/hooks/useCurrency';
import { getCurrentUserId, getUserInvestments, getUserWallets } from '@/lib/db';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserNotifications } from '@/src/hooks/useUserNotifications';
import { useI18n } from '@/hooks/useI18n';
import { useRouter } from 'next/navigation';
import { Wallet, Activity, Award, PlusCircle, ArrowUpCircle, History, Zap, Star, Crown, DollarSign, PieChart, BarChart3, Globe, Sparkles, ShieldCheck, AlertCircle, RefreshCw, Menu } from 'lucide-react'
import FuturisticBackground from '@/components/ui/FuturisticBackground';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardCard from '@/components/DashboardCard';

export default function Dashboard() {
  const { t } = useI18n();
  const router = useRouter()
  const { currency, setCurrency, format, convertToUSD, convertFromUSD } = useCurrency('USD');
  const [loading, setLoading] = useState(true);
  const [walletTotalUSD, setWalletTotalUSD] = useState(0);
  const [investedUSD, setInvestedUSD] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const userIdRef = useRef<string | null>(null);
  const { items: notifications } = useUserNotifications();
  const [userName, setUserName] = useState('')
  
  const [currentPlan, setCurrentPlan] = useState<'starter'|'pro'|'elite'|'none'>('none')
  const [activeApprox, setActiveApprox] = useState<number>(0)
  const [bestStream, setBestStream] = useState({ name: 'High Frequency Trading', roi: 12.5 }) // Mock/Default
  
  // Force active state for demo/UX if no real data
  useEffect(() => {
    // If we have no active traders count yet, set a realistic baseline
    if (activeApprox === 0) {
        setActiveApprox(Math.floor(Math.random() * (150 - 80) + 80))
    }
  }, [activeApprox])

  const [investmentsState, setInvestmentsState] = useState<any[]>([])
  const [walletsState, setWalletsState] = useState<any[]>([])
  const [cycleDay, setCycleDay] = useState<number>(0)
  const [nextCreditDate, setNextCreditDate] = useState<string>('')
  const [cyclePct, setCyclePct] = useState<number>(0)
  const [insightsTab, setInsightsTab] = useState<'performance'|'trades'>('performance')
  const [newsItems, setNewsItems] = useState<Array<{ title: string; link?: string; source?: string; publishedAt?: string; imageUrl?: string }>>([])
  const [newsCategory, setNewsCategory] = useState<'all'|'tech'|'crypto'|'stocks'>('all')
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsError, setNewsError] = useState<string>('')
  const [newsRefreshNonce, setNewsRefreshNonce] = useState(0)
  const newsForceRef = useRef(false)
  const [newsLastUpdatedAt, setNewsLastUpdatedAt] = useState<string>('')
  const [kycStatus, setKycStatus] = useState<string>('pending') // default pending until checked
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [pnl, setPnl] = useState<any | null>(null)


  // Notifications trigger refresh
  const latest = useMemo(() => notifications[0], [notifications]);
  useEffect(() => {
    if (!latest) return;
    const t = String((latest as any)?.type || '');
    if (t === 'manual_credit' || t === 'profit' || t === 'investment_status' || t === 'kyc_status') {
      setRefreshKey((k) => k + 1);
    }
  }, [latest]);

  // Data Fetching
  useEffect(() => {
    async function fetchData() {
      const userId = await getCurrentUserId();
      if (!userId) {
        setLoading(false);
        return;
      }
      userIdRef.current = userId;

      try {
        const { data: sessionRes } = await supabase.auth.getSession()
        const u = sessionRes?.session?.user
        const email = String(u?.email || '')
        const meta: any = (u as any)?.user_metadata || {}
        const metaName = String(meta?.username || meta?.name || meta?.full_name || '')
        const display = metaName || (email ? email.split('@')[0] : '')
        if (display) setUserName(display)
      } catch {}
      
      try {
        console.log('Fetching Profile for:', userId)
        const { data: profile } = await supabase
          .from('profiles')
          .select('currency')
          .eq('user_id', userId)
          .maybeSingle();
        
        console.log('Profile Data:', profile)

        const preferred = (profile?.currency as any) || 'USD';
        setCurrency((prev) => prev || preferred);

        // Fallback to User table if profiles is empty or no name
        const { data: u } = await supabase.from('User').select('kycStatus, name, email').eq('id', userId).maybeSingle();
        console.log('User Table Fallback:', u)
        
        if ((profile as any)?.full_name) {
             setUserName((profile as any).full_name)
        } else if (u?.name) {
             setUserName(u.name)
        } else if (u?.email) {
             setUserName(u.email.split('@')[0])
        }
        
        // Determine KYC Status via API (source of truth)
        try {
          const { data: session } = await supabase.auth.getSession()
          const token = session.session?.access_token
          if (token) {
            const r = await fetch('/api/user/kyc/status', { headers: { Authorization: `Bearer ${token}` } })
            const j = await r.json()
            if (r.ok && j?.status) setKycStatus(String(j.status).toLowerCase())
          }
        } catch {}

      } catch {}

      const [wallets, investments] = await Promise.all([
        getUserWallets(userId),
        getUserInvestments(userId)
      ]);
      setInvestmentsState(investments)
      setWalletsState(wallets)

      const totalUSD = wallets.reduce((sum, w) => {
        const amt = Number(w.balance) || 0;
        return sum + convertToUSD(amt, w.currency as any);
      }, 0);
      setWalletTotalUSD(Number(totalUSD.toFixed(2)));

      const activeInvestments = investments.filter(i => i.status === 'active');
      const totalInvested = activeInvestments.reduce((sum, i) => sum + i.amount_usd, 0);
      setInvestedUSD(totalInvested);
      
      const planId = activeInvestments[0]?.plan_id || 'starter'
      setCurrentPlan((activeInvestments.length > 0 ? planId : 'none') as any)

      try {
        const createdRaw = activeInvestments[0]?.created_at || activeInvestments[0]?.createdAt
        if (createdRaw) {
          const start = new Date(String(createdRaw))
          const now = new Date()
          const diffMs = now.getTime() - start.getTime()
          const planKey = String(activeInvestments[0]?.plan_id || 'starter').toLowerCase()
          const endRaw = activeInvestments[0]?.end_date || activeInvestments[0]?.endDate
          const inferredDays = planKey === 'starter' ? 7 : planKey === 'pro' ? 14 : planKey === 'elite' ? 30 : 14
          const totalDays = endRaw ? Math.max(1, Math.ceil((new Date(String(endRaw)).getTime() - start.getTime()) / (24 * 60 * 60 * 1000))) : inferredDays
          const day = Math.max(1, Math.min(totalDays, Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1))
          setCycleDay(day)
          setCyclePct(Math.min(100, Math.round((day / totalDays) * 100)))
          const nextCredit = new Date(start)
          nextCredit.setDate(start.getDate() + 7)
          setNextCreditDate(nextCredit.toLocaleDateString())
        } else {
          setCycleDay(0)
          setCyclePct(0)
          setNextCreditDate('')
        }
      } catch {}
      setLoading(false);

      try {
        const { data: sessionRes } = await supabase.auth.getSession()
        const token = sessionRes?.session?.access_token || ''
        if (token) {
          const r = await fetch('/api/user/investments/pnl', { headers: { Authorization: `Bearer ${token}` } })
          const j = await r.json()
          if (r.ok) setPnl(j)
        }
      } catch {}
    }
    fetchData();
  }, [currency, refreshKey, convertToUSD, setCurrency]);

  // Market Stats (Best Stream, Presence, Sentiment)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/simulation/market', { cache: 'no-store' })
        const json = await res.json()
        if (!mounted || !res.ok) return
        
        // Best Stream
        const b = json?.bestStream
        if (b && typeof b?.roi === 'number') {
          setBestStream({ name: String(b.name || 'Top Stream'), roi: Number((b.roi).toFixed(2)) })
        }

        // Active Traders
        if (typeof json?.activeTraders === 'number') {
          setActiveApprox(json.activeTraders)
        }

      } catch {
        // keep existing mock if API fails
      }
    })()
    const id = setInterval(async () => {
        try {
            const res = await fetch('/api/simulation/market', { cache: 'no-store' })
            const json = await res.json()
            if (res.ok) {
                if (typeof json?.activeTraders === 'number') setActiveApprox(json.activeTraders)
                const b = json?.bestStream
                if (b && typeof b?.roi === 'number') {
                    setBestStream({ name: String(b.name || 'Top Stream'), roi: Number((b.roi).toFixed(2)) })
                }
            }
        } catch {}
    }, 45000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  const activeInvestments = investmentsState.filter(i => i.status === 'active');

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setNewsLoading(true)
        setNewsError('')
        const force = newsForceRef.current
        newsForceRef.current = false
        const url = force ? `/api/news?category=${newsCategory}&force=1` : `/api/news?category=${newsCategory}`
        const res = await fetch(url, { cache: 'no-store' })
        const json = await res.json()
        if (!mounted) return
        if (!res.ok) {
          setNewsError(String(json?.error || 'Failed to load news'))
          return
        }
        const items = Array.isArray(json?.items) ? json.items : []
        setNewsItems(items.slice(0, 10))
        setNewsLastUpdatedAt(new Date().toISOString())
      } catch (e: any) {
        if (!mounted) return
        setNewsError(String(e?.message || 'Failed to load news'))
      } finally {
        if (mounted) setNewsLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [newsCategory, newsRefreshNonce])

  useEffect(() => {
    const refresh = () => setNewsRefreshNonce((n) => n + 1)
    const id = setInterval(refresh, 5 * 60 * 1000)
    window.addEventListener('focus', refresh)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  function formatHoursAgo(iso?: string) {
    if (!iso) return null
    const t = new Date(iso).getTime()
    if (!Number.isFinite(t)) return null
    const diffHrs = Math.max(1, Math.round((Date.now() - t) / (60 * 60 * 1000)))
    return `${diffHrs}h ago`
  }

  function formatUpdatedAgo(iso?: string) {
    if (!iso) return ''
    const t = new Date(iso).getTime()
    if (!Number.isFinite(t)) return ''
    const diffMin = Math.max(0, Math.round((Date.now() - t) / (60 * 1000)))
    if (diffMin < 1) return 'just now'
    if (diffMin === 1) return '1 min ago'
    return `${diffMin} mins ago`
  }

  return (
    <RequireAuth>
      <FuturisticBackground />
      <div className="flex flex-col md:flex-row min-h-screen text-foreground relative z-10">
        
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
            {isSidebarOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 z-50"
                    >
                        <Sidebar onClose={() => setIsSidebarOpen(false)} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto relative">
          
          {loading ? <DashboardSkeleton /> : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card/40 backdrop-blur-xl p-6 rounded-3xl border border-border/10 shadow-xl">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-xl hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground drop-shadow-lg">
                  {t('hello_user', { name: userName || t('user') })}
                </h1>
              <div className="text-muted-foreground mt-2 flex items-center gap-3 text-sm font-medium">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                    {activeApprox.toLocaleString()} {t('active_label')}
                </span>
                <span className="text-muted-foreground/20">•</span>
                <span className="font-mono text-muted-foreground/60">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
                {/* KYC Button Logic */}
                {kycStatus.toLowerCase() === 'verified' || kycStatus.toLowerCase() === 'approved' ? (
                     <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold shadow-lg">
                        <ShieldCheck size={18} />
                        <span>{t('verified')}</span>
                    </div>
                ) : (
                    <button onClick={() => router.push('/kyc')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500 text-black font-bold shadow-lg hover:scale-105 transition-transform animate-pulse">
                        <AlertCircle size={18} />
                        <span>{t('verify_kyc')}</span>
                    </button>
                )}

               <select
                  className="bg-background/50 border border-border/10 text-foreground text-sm py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm transition-all"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                >
                  {supportedCurrencies.map(c => (
                    <option key={c} value={c} className="bg-background text-foreground">{c}</option>
                  ))}
                </select>

              <button onClick={() => router.push('/deposit')} className="relative group overflow-hidden bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2"><PlusCircle size={18} /> {t('deposit')}</span>
              </button>
              <button onClick={() => router.push('/earn')} className="relative group overflow-hidden bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-purple-400/30">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2"><Award size={18} /> {t('earn')}</span>
              </button>
              <button onClick={() => router.push('/withdraw')} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-muted/50 border border-border/10 hover:bg-muted/80 hover:border-border/20 transition-all backdrop-blur-md text-foreground">
                <ArrowUpCircle size={18} /> {t('withdraw_title')}
              </button>
            </div>
          </div>

          {pnl && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashboardCard
                title="s Weekly P&L"
                value={`${Number(pnl?.totals?.simulatedWeekPnlUSD || 0) >= 0 ? '+' : ''}$${Number(pnl?.totals?.simulatedWeekPnlUSD || 0).toFixed(2)}`}
                icon={<BarChart3 size={20} />}
                trend={Number(pnl?.totals?.simulatedWeekPnlUSD || 0) >= 0 ? 'up' : 'down'}
                trendValue="Market‑referenced"
                className="hover:border-blue-500/30"
              />
              <DashboardCard
                title="Invested Principal"
                value={`$${Number(pnl?.totals?.totalPrincipalUSD || 0).toFixed(2)}`}
                icon={<PieChart size={20} />}
                className="hover:border-purple-500/30"
              />
              <DashboardCard
                title="Realized (Last 30 Days)"
                value={`${Number(pnl?.totals?.last30DaysRealizedUSD || 0) >= 0 ? '+' : ''}$${Number(pnl?.totals?.last30DaysRealizedUSD || 0).toFixed(2)}`}
                icon={<Activity size={20} />}
                className="hover:border-green-500/30"
              />
            </div>
          )}

          {pnl?.items?.length > 0 && (
            <div className="bg-card/20 backdrop-blur-md border border-border/30 shadow-lg rounded-3xl p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  Simulation lifecycle
                </h3>
                <div className="text-xs text-muted-foreground">As of {String(pnl?.items?.[0]?.reference?.asOf || '')}</div>
              </div>

              <div className="space-y-3">
                {(pnl.items as any[]).slice(0, 3).map((it: any) => {
                  const daysTotal = Number(it?.cycle?.daysTotal || 0)
                  const daysElapsed = Number(it?.cycle?.daysElapsed || 0)
                  const pct = daysTotal ? Math.max(0, Math.min(100, Math.round((daysElapsed / daysTotal) * 100))) : 0
                  const pnlCum = Number(it?.simulatedCumulativePnlUSD || 0)
                  const equity = Number(it?.simulatedEquityUSD || 0)
                  const principal = Number(it?.principalUSD || 0)
                  return (
                    <div key={String(it.id)} className="rounded-2xl border border-border/30 bg-muted/10 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold">{String(it?.plan?.name || 'Investment')}</div>
                          <div className="text-xs text-muted-foreground">Cycle: {daysElapsed}/{daysTotal || '—'} days • Weighted weekly ROI: {Number(it?.weightedRoiPct || 0).toFixed(2)}%</div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <div className="rounded-xl bg-muted/10 dark:bg-black/20 border border-border/30 px-3 py-2">Principal: <span className="font-mono text-foreground">${principal.toFixed(2)}</span></div>
                          <div className="rounded-xl bg-muted/10 dark:bg-black/20 border border-border/30 px-3 py-2">P&L: <span className={`font-mono ${pnlCum >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{pnlCum >= 0 ? '+' : ''}${pnlCum.toFixed(2)}</span></div>
                          <div className="rounded-xl bg-muted/10 dark:bg-black/20 border border-border/30 px-3 py-2">Sim Equity: <span className="font-mono text-foreground">${equity.toFixed(2)}</span></div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden">
                          <div className="h-full bg-primary/70" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">Progress: {pct}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 text-xs text-muted-foreground">Market source: {String(pnl?.items?.[0]?.reference?.source || 'unknown')}</div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <DashboardCard 
              title="Total Balance" 
              value={format(convertFromUSD(walletTotalUSD))} 
              icon={<Wallet size={20} />}
              trend="up"
              trendValue={walletTotalUSD > 0 ? "+2.4%" : "0.0%"}
            />

            <DashboardCard 
              title="Total Invested" 
              value={format(convertFromUSD(investedUSD))} 
              icon={<DollarSign size={20} />}
              sublabel="Active Assets"
              className="hover:border-purple-500/30"
            />

            <DashboardCard 
              title="Current Plan" 
              value={currentPlan === 'none' ? 'No Plan' : currentPlan.toUpperCase()}
              icon={currentPlan === 'elite' ? <Crown size={20} /> : currentPlan === 'pro' ? <Star size={20} /> : <Zap size={20} />}
              className="hover:border-yellow-500/30"
            >
                <div className="flex items-end justify-between mt-1">
                     <div className="text-sm font-medium text-muted-foreground">{cycleDay}/{currentPlan === 'starter' ? 7 : currentPlan === 'pro' ? 14 : currentPlan === 'elite' ? 30 : 14} Days</div>
                     {currentPlan !== 'none' && (
                        <div className="w-20 h-1 bg-muted/10 rounded-full overflow-hidden mb-1.5">
                            <div className="h-full bg-yellow-500" style={{ width: `${cyclePct}%` }} />
                        </div>
                     )}
                </div>
            </DashboardCard>

            <DashboardCard 
              title="Top Performer" 
              value={`+${bestStream.roi}%`} 
              icon={<Award size={20} />}
              sublabel={bestStream.name}
              trend="up"
              trendValue="High ROI"
              className="hover:border-pink-500/30"
            />

          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (Primary Content) */}
            <div className="lg:col-span-2 space-y-6">

                {/* Onboarding / Empty State */}
                {walletTotalUSD === 0 && investedUSD === 0 && (
                    <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500" />
                        <div className="relative z-10 space-y-4">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Sparkles size={32} className="text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Welcome to HybridAI Trading</h2>
                            <p className="text-muted-foreground max-w-lg mx-auto">
                                You&apos;re one step away from automated algorithmic trading. 
                                Deposit funds to your wallet to start your first investment cycle.
                            </p>
                            <div className="flex justify-center gap-4 pt-4">
                                <button onClick={() => router.push('/deposit')} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                    <PlusCircle size={20} /> Deposit Funds
                                </button>
                                <button onClick={() => router.push('/plans')} className="px-8 py-3 bg-card border border-border/20 hover:bg-muted/50 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                    <Zap size={20} /> View Plans
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Main Chart Card */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-border/10 flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Activity size={18} className="text-primary" />
                            {investedUSD > 0 ? "My Portfolio Growth" : "Live Market Performance"}
                        </h3>
                        <div className="flex bg-muted/20 rounded-lg p-1 gap-1">
                            <button 
                                onClick={() => setInsightsTab('performance')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${insightsTab === 'performance' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Chart
                            </button>
                            <button 
                                onClick={() => setInsightsTab('trades')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${insightsTab === 'trades' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Trades
                            </button>
                        </div>
                    </div>
                    <div className="p-4 h-[400px]">
                        {insightsTab === 'performance' ? <LivePerformance /> : <TradeFeed />}
                    </div>
                </div>

                {/* Portfolio & Heatmap Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Allocation */}
                    <div className="bg-card/40 backdrop-blur-xl border border-border/10 shadow-xl rounded-3xl p-6 h-[350px] flex flex-col hover:border-blue-500/30 transition-colors">
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <PieChart size={18} className="text-blue-500" />
                            Asset Allocation
                        </h3>
                         {activeInvestments[0] ? (
                            <div className="flex-1">
                                <InvestmentAllocation 
                                planId={activeInvestments[0].plan?.slug || (activeInvestments[0] as any).planId || 'starter'} 
                                amount={activeInvestments[0].amount_usd} 
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="p-3 bg-muted/10 rounded-full mb-3">
                                    <PieChart size={24} className="text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">No active allocation</p>
                                <button onClick={() => router.push('/plans')} className="mt-4 text-xs text-primary hover:underline">
                                    Start Investing &rarr;
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Heatmap */}
                    <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl shadow-xl p-5 h-[350px] flex flex-col">
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <BarChart3 size={18} className="text-purple-500" />
                            Market Heatmap
                        </h3>
                        <div className="flex-1">
                            <AssetHeatmap />
                        </div>
                    </div>
                </div>

                {/* Strategy Insights */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl shadow-xl p-5 h-[300px]">
                    <StrategyInsights />
                </div>

            </div>

            {/* Right Column (Sidebar Widgets) */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* AI Prediction */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl shadow-xl overflow-hidden">
                     <AIPredictionCard />
                </div>

                {/* Market Pulse Group */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl shadow-xl p-4 h-[160px]">
                        <SentimentGauge />
                    </div>
                    <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl shadow-xl p-4 h-[160px]">
                         <RiskRadar />
                    </div>
                </div>

                {/* World Clock */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl shadow-xl p-4 h-[200px]">
                    <WorldMarketClock />
                </div>

                {/* Recent Activity */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/10 shadow-xl rounded-3xl p-6 min-h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <History size={18} className="text-muted-foreground" />
                            Recent Activity
                        </h3>
                        <button onClick={() => router.push('/transactions')} className="text-xs text-primary hover:underline">View All</button>
                    </div>
                    <RecentActivity />
                </div>

                {/* News Feed */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/10 shadow-xl rounded-3xl p-6 h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Globe size={18} className="text-cyan-500" />
                            Market Intel
                        </h3>
                         <div className="flex items-center gap-2">
                            <button
                              onClick={() => { newsForceRef.current = true; setNewsRefreshNonce((n) => n + 1) }}
                              className="p-1.5 rounded bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                              aria-label="Refresh news"
                              disabled={newsLoading}
                            >
                              <RefreshCw size={14} className={newsLoading ? 'animate-spin' : ''} />
                            </button>
                            <div className="text-[10px] text-muted-foreground">Updated {formatUpdatedAgo(newsLastUpdatedAt) || '—'}</div>
                            {(['all','crypto','tech','stocks'] as const).map((c) => (
                                <button key={c} onClick={() => setNewsCategory(c as any)} className={`text-[10px] px-2 py-0.5 rounded ${newsCategory === c ? 'bg-primary text-primary-foreground' : 'bg-muted/20 text-muted-foreground'}`}>
                                    {c.toUpperCase()}
                                </button>
                            ))}
                         </div>
                    </div>
                    <div className="space-y-3 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-muted/20">
                        {newsLoading && newsItems.length === 0 && (
                          <div className="text-xs text-muted-foreground">Loading news…</div>
                        )}
                        {!newsLoading && newsError && newsItems.length === 0 && (
                          <div className="text-xs text-muted-foreground">
                            <div className="mb-2">{newsError}</div>
                            <button onClick={() => setNewsRefreshNonce((n) => n + 1)} className="text-primary hover:underline">Retry</button>
                          </div>
                        )}
                        {newsItems.map((n, i) => (
                        <div key={String(n.link || n.title)+i} className="flex gap-3 pb-3 border-b border-border/50 last:border-0 hover:bg-muted/5 p-2 rounded transition-colors cursor-pointer group">
                            <div className="flex-1 flex flex-col gap-1">
                                <a href={n.link || '#'} target="_blank" rel="noreferrer" className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{n.title}</a>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{n.source || 'News'}</span>
                                    <span>{formatHoursAgo(n.publishedAt) || '—'}</span>
                                </div>
                            </div>
                            {n.imageUrl && (
                                <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-muted/20 border border-border/10">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={n.imageUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" onError={(e) => { (e.target as any).style.display = 'none' }} />
                                </div>
                            )}
                        </div>
                        ))}
                    </div>
                </div>

            </div>

          </div>
          </motion.div>
          )}
        </main>
      </div>
    </RequireAuth>
  );
}
