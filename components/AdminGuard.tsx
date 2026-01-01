import { useEffect, useState } from 'react';
import { supabase, supabaseReady } from '../lib/supabase';

type Profile = { role?: string | null; is_admin?: boolean | null };

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'noauth' | 'forbidden' | 'ok'>('loading');

  useEffect(() => {
    let mounted = true;
    async function check() {
      if (!supabaseReady && process.env.NODE_ENV !== 'production') {
        if (mounted) setStatus('ok');
        return;
      }
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        if (mounted) setStatus('noauth');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role,is_admin')
        .eq('user_id', user.id)
        .maybeSingle();
      const p = profile as Profile | null;
      const isAdmin = Boolean(p?.is_admin) || String(p?.role || '').toLowerCase() === 'admin';
      if (mounted) setStatus(isAdmin ? 'ok' : 'forbidden');
    }
    check();
    return () => { mounted = false; };
  }, []);

  if (status === 'loading') return <div className="p-6">Checking permissions…</div>;
  if (status === 'noauth') return <div className="p-6">Sign in required.</div>;
  if (status === 'forbidden') return <div className="p-6">Not authorized.</div>;
  return <>{children}</>;
}
