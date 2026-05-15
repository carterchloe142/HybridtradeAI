'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processed = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) return;

    // Only run once
    if (processed.current) return;
    processed.current = true;

    // Check for errors in URL (e.g. from Google or Magic Link)
    const errorDescription = searchParams.get('error_description');
    const errorMsg = searchParams.get('error');
    if (errorDescription || errorMsg) {
      setError(errorDescription || errorMsg);
      return;
    }

    // Handle PKCE code exchange
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type'); // 'recovery', 'signup', 'invite'
    const next = searchParams.get('next');
    const safeNext = next && next.startsWith('/') ? next : null;

    const navigateAfterAuth = (event?: string, currentType?: string | null) => {
      const isRecoveryFlow = currentType === 'recovery' || event === 'PASSWORD_RECOVERY';
      const finalTarget = isRecoveryFlow ? (safeNext || '/auth/update-password') : (safeNext || '/dashboard');
      router.push(finalTarget);
    };

    // Listen to auth state change to handle implicit flows or post-PKCE state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
            if (session) {
                const storedReferral = (() => {
                  try { return localStorage.getItem('referralCode') } catch { return null }
                })()
                // Sync user if needed - non-blocking
                fetch('/api/auth/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session, referralCode: storedReferral })
                }).catch(console.error);

                try { if (storedReferral) localStorage.removeItem('referralCode') } catch {}

                const hash = typeof window !== 'undefined' ? window.location.hash : '';
                const hashType = hash && hash.includes('type=recovery') ? 'recovery' : type;
                navigateAfterAuth(event, hashType);
            }
        }
    });

    if (tokenHash && type) {
      supabase.auth.verifyOtp({ type: type as any, token_hash: tokenHash })
        .then((res: any) => {
          const { error } = res || {}
          if (error) {
            setError(error.message)
            return
          }

          navigateAfterAuth(undefined, type)
        })
        .catch((err: any) => setError(err.message))
    } else if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(async (res: any) => {
          const { data, error } = res || {}
          if (error) {
            setError(error.message);
          } else {
             // The onAuthStateChange will handle the redirect, but just in case it doesn't fire immediately
             // we can check session here too.
             // However, to avoid double redirects, we rely on the state change listener OR manual check.
             // Let's do manual check here to be safe and fast.
             if (data.session) {
                 const storedReferral = (() => {
                   try { return localStorage.getItem('referralCode') } catch { return null }
                 })()
                 fetch('/api/auth/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session: data.session, referralCode: storedReferral })
                 }).catch(console.error);

                 try { if (storedReferral) localStorage.removeItem('referralCode') } catch {}
                 
                 navigateAfterAuth(undefined, type);
             }
          }
        })
        .catch((err: any) => setError(err.message));
    } else {
       // Implicit flow check
       supabase.auth.getSession().then((res: any) => {
           const data = res?.data
           if (data?.session) {
               const hash = window.location.hash;
               const hashType = hash && hash.includes('type=recovery') ? 'recovery' : type;
               navigateAfterAuth(undefined, hashType);
           } else {
               // If no session yet, we wait for onAuthStateChange or timeout
               // But usually implicit flow happens very quickly via client library parsing hash
               setTimeout(() => {
                   supabase.auth.getSession().then((res2: any) => {
                       const d2 = res2?.data
                       if (!d2?.session) {
                           // Still no session?
                           // Check if it's a recovery link without session establishment?
                           // Recovery links SHOULD establish a session.
                           router.push('/auth/login');
                       }
                   });
               }, 2000);
           }
       })
    }

    return () => {
        subscription.unsubscribe();
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 shadow-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-xl font-bold">Authentication Error</h2>
            <p className="text-muted-foreground text-sm">{error}</p>
            <div className="pt-4">
               <Link href="/auth/login" className="text-primary hover:underline">
                 Return to Login
               </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
