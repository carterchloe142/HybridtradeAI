'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const processed = useRef(false);

  useEffect(() => {
    // Only run once
    if (processed.current) return;

    const handleSession = async () => {
      processed.current = true;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        try {
          // Sync user to database
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session })
          });
          
          // Determine redirect based on role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role,is_admin')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          const role = String(profile?.role || '').toLowerCase();
          const isAdmin = Boolean(profile?.is_admin) || role === 'admin';
          
          router.replace(isAdmin ? '/admin' : '/dashboard');
        } catch (e) {
          console.error('Sync failed', e);
          router.replace('/dashboard');
        }
      } else {
        // Wait for auth state change if session not immediately available
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
             // Re-run sync logic
             await fetch('/api/auth/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session })
             });
             router.replace('/dashboard');
          }
        });
        
        // Timeout fallback
        setTimeout(() => {
            if (!session) router.replace('/auth/login');
        }, 5000);

        return () => subscription.unsubscribe();
      }
    };

    handleSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
