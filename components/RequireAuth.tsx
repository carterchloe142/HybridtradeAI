import { useEffect, useState } from 'react';
import { supabase, supabaseReady } from '../lib/supabase';
import { useRouter } from 'next/navigation';

type Props = { children: React.ReactNode };

export default function RequireAuth({ children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!supabaseReady && process.env.NODE_ENV !== 'production') {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then((res: { data: { session: any } }) => {
      const isAuthed = !!res.data?.session;
      if (!isAuthed) {
        router.replace('/auth/login');
      } else if (mounted) {
        setReady(true);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!session) router.replace('/auth/login');
    });
    return () => { sub?.subscription?.unsubscribe(); mounted = false; };
  }, [router]);

  if (!ready) {
    return (
      <div className="card-neon text-center">
        <p>Checking your session...</p>
      </div>
    );
  }
  return <>{children}</>;
}
