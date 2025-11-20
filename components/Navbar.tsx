import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Menu, X, Bot, ShieldCheck, ShieldAlert, ShieldX, IdCard } from 'lucide-react';
import NotificationBell from '../app/components/NotificationBell';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kyc, setKyc] = useState<string>('');
  const kycColor = useMemo(() => (kyc === 'approved' ? 'text-green-500' : kyc === 'rejected' ? 'text-red-500' : kyc === 'pending' ? 'text-yellow-500' : 'text-neon-blue'), [kyc]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const uid = String(data?.session?.user?.id || '');
        if (!uid) return;
        const { data: prof } = await supabase
          .from('profiles')
          .select('kyc_status')
          .eq('user_id', uid)
          .maybeSingle();
        if (!mounted) return;
        setKyc(String((prof as any)?.kyc_status || ''));
      } catch {}
    })();
    return () => { mounted = false };
  }, []);

  return (
    <nav className="w-full sticky top-0 z-30 bg-[#0a0f1b]/70 backdrop-blur-md border-b border-white/10">
      <div className="container-xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Bot className="text-neon-blue" />
          <span className="font-bold text-xl neon-text">HybridTradeAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/plans" className="hover:text-neon-blue">Plans</Link>
          <Link href="/dashboard" className="hover:text-neon-blue">Dashboard</Link>
          <Link href="/kyc" className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="KYC" aria-label="KYC">
            {kyc === 'approved' ? <ShieldCheck className={`w-5 h-5 ${kycColor}`} /> : kyc === 'rejected' ? <ShieldX className={`w-5 h-5 ${kycColor}`} /> : kyc === 'pending' ? <ShieldAlert className={`w-5 h-5 ${kycColor}`} /> : <IdCard className={`w-5 h-5 ${kycColor}`} />}
          </Link>
          <NotificationBell />
          <Link href="/auth/login" className="btn-neon">Login</Link>
        </div>

        <button aria-label="Toggle menu" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3">
          <Link href="/plans" onClick={() => setOpen(false)} className="hover:text-neon-blue">Plans</Link>
          <Link href="/dashboard" onClick={() => setOpen(false)} className="hover:text-neon-blue">Dashboard</Link>
          <Link href="/kyc" onClick={() => setOpen(false)} className="hover:text-neon-blue">KYC</Link>
          <Link href="/auth/login" onClick={() => setOpen(false)} className="btn-neon text-center">Login</Link>
        </div>
      )}
    </nav>
  );
}
