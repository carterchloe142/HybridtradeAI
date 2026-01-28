import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Wallet, User2, Activity, LifeBuoy, X, Smartphone, PlayCircle, BrainCircuit, Settings } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n'
import { useUserNotifications } from '@/src/hooks/useUserNotifications'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId, getUserInvestments } from '@/lib/db'
import AccountDetailsPanel from '@/components/AccountDetailsPanel'

const itemsBase = [
  { href: '/dashboard', key: 'nav_dashboard', icon: LayoutGrid },
  { href: '/strategy', key: 'nav_strategy', icon: BrainCircuit },
  { href: '/deposit', key: 'nav_deposit', icon: Wallet },
  { href: '/withdraw', key: 'nav_withdraw', icon: Wallet },
  { href: '/transactions', key: 'nav_transactions', icon: Activity },
  { href: '/plans', key: 'nav_plans', icon: Wallet },
  { href: '/earn', key: 'nav_earn', icon: PlayCircle },
  { href: '/profile', key: 'nav_profile', icon: User2 },
  { href: '/settings', key: 'nav_settings', icon: Settings },
  { href: '/download-app', key: 'nav_download_app', icon: Smartphone },
  { href: '/support', key: 'nav_support', icon: LifeBuoy },
];

import LogoMark from './LogoMark';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n()
  const { items } = useUserNotifications()
  const supportUnread = items.filter((ev) => !ev.read && (ev.type === 'support_reply' || ev.type === 'support_status' || ev.type === 'support_ticket')).length

  const [displayName, setDisplayName] = useState<string>('')
  const [planKey, setPlanKey] = useState<'starter' | 'pro' | 'elite' | 'free'>('free')
  const [accountOpen, setAccountOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const u = data?.session?.user
        const email = String(u?.email || '')
        const meta: any = (u as any)?.user_metadata || {}
        const metaName = String(meta?.username || meta?.name || meta?.full_name || '')
        const name = metaName || email || ''
        if (mounted) setDisplayName(name)
      } catch {
        if (mounted) setDisplayName('')
      }

      try {
        const userId = await getCurrentUserId()
        if (!userId) return
        const investments = await getUserInvestments(userId)
        const active = investments.find((i) => String(i.status || '').toLowerCase() === 'active')
        const raw = String(active?.plan_id || '')
        const key = raw ? raw.toLowerCase() : ''
        const normalized = key === 'starter' || key === 'pro' || key === 'elite' ? (key as any) : 'free'
        if (mounted) setPlanKey(normalized)
      } catch {
        if (mounted) setPlanKey('free')
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const initials = useMemo(() => {
    const s = String(displayName || '').trim()
    if (!s) return 'U'
    const base = s.includes('@') ? s.split('@')[0] : s
    const parts = base.split(/[\s._-]+/).filter(Boolean)
    const a = parts[0]?.[0] || base[0]
    const b = parts[1]?.[0] || parts[0]?.[1] || ''
    return `${String(a || '').toUpperCase()}${String(b || '').toUpperCase()}`.slice(0, 2) || 'U'
  }, [displayName])

  const planText = planKey === 'starter' ? t('plan_starter') : planKey === 'pro' ? t('plan_pro') : planKey === 'elite' ? t('plan_elite') : t('free')

  return (
    <aside className="w-64 h-[calc(100vh-2rem)] m-4 rounded-3xl bg-card/90 backdrop-blur-xl border border-border/40 sticky top-4 flex flex-col shadow-2xl overflow-hidden z-20">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <LogoMark size={40} className="text-primary" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              HybridTradeAI
            </h2>
        </div>
        {onClose && (
            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
            </button>
        )}
      </div>
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {itemsBase.map(({ href, key, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
                active 
                  ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(0,229,255,0.3)] border border-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
              }`}>
              
              {active && <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />}
              
              <Icon size={20} className={`relative z-10 transition-transform group-hover:scale-110 ${active ? 'text-primary' : ''}`} />
              <span className="relative z-10 font-medium">{t(key)}</span>
              
              {href === '/support' && supportUnread > 0 && (
                <span className="ml-auto relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs animate-pulse">
                  {supportUnread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* User Mini Profile or Footer */}
      <div className="p-4 bg-muted/10 dark:bg-black/20 border-t border-border/30 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setAccountOpen(true)}
          className="w-full text-left rounded-2xl p-2 -m-2 hover:bg-muted/20 transition-colors"
          aria-label="Open account details"
        >
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                  {initials}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">{displayName || t('user')}</p>
                <p className="text-xs text-muted-foreground truncate">{planText}</p>
              </div>
          </div>
        </button>
      </div>
      <AccountDetailsPanel open={accountOpen} onClose={() => setAccountOpen(false)} />
    </aside>
  );
}
