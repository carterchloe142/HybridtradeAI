import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutGrid, Wallet, User2, Activity, LifeBuoy } from 'lucide-react';
import { useI18n } from '../hooks/useI18n'
import { useUserNotifications } from '../src/hooks/useUserNotifications'

const itemsBase = [
  { href: '/dashboard', key: 'nav_dashboard', icon: LayoutGrid },
  { href: '/deposit', key: 'nav_deposit', icon: Wallet },
  { href: '/withdraw', key: 'nav_withdraw', icon: Wallet },
  { href: '/transactions', key: 'nav_transactions', icon: Activity },
  { href: '/plans', key: 'nav_plans', icon: Wallet },
  { href: '/profile', key: 'nav_profile', icon: User2 },
  { href: '/support', key: 'nav_support', icon: LifeBuoy },
];

export default function Sidebar() {
  const router = useRouter();
  const { t } = useI18n()
  const { items } = useUserNotifications()
  const supportUnread = items.filter((ev) => !ev.read && (ev.type === 'support_reply' || ev.type === 'support_status' || ev.type === 'support_ticket')).length
  return (
    <aside className="hidden md:block w-64 h-[calc(100vh-2rem)] m-4 rounded-3xl bg-card/20 backdrop-blur-xl border border-white/10 sticky top-4 flex flex-col shadow-2xl overflow-hidden z-20">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          HybridAI
        </h2>
      </div>
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {itemsBase.map(({ href, key, icon: Icon }) => {
          const active = router.pathname === href;
          return (
            <Link key={href} href={href}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
                active 
                  ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(0,229,255,0.3)] border border-primary/20' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
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
      <div className="p-4 bg-black/20 border-t border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                U
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">User</p>
                <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
            </div>
        </div>
      </div>
    </aside>
  );
}
