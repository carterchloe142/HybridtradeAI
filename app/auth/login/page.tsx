'use client';

export const dynamic = "force-dynamic";

import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import FuturisticBackground from '@/components/ui/FuturisticBackground';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid form');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) throw error;

      // Sync user to database
      if (data?.session) {
        await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session: data.session })
        });
      }

      // Redirect admins to /admin, others to /dashboard
      const userId = data.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role,is_admin')
          .eq('user_id', userId)
          .maybeSingle();
        const role = String(profile?.role || '').toLowerCase();
        const isAdmin = Boolean(profile?.is_admin) || role === 'admin';
        router.push(isAdmin ? '/admin' : '/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <FuturisticBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass Card */}
        <div className="relative overflow-hidden rounded-3xl bg-card/40 backdrop-blur-xl border border-border/10 shadow-2xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-cyan-500 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
                Welcome Back
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">Access your algorithmic trading dashboard</p>
            </motion.div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  className="w-full bg-muted/20 border border-border/50 rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-muted/30 focus:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all"
                  type="email" 
                  placeholder="name@example.com"
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  className="w-full bg-muted/20 border border-border/50 rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-muted/30 focus:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all"
                  type="password" 
                  placeholder="••••••••"
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })} 
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                {error}
              </motion.div>
            )}

            <button 
              className="w-full relative group overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Authenticating...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={18} />
                  </>
                )}
              </span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background/50 backdrop-blur px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full relative group overflow-hidden bg-white text-black hover:bg-gray-100 font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              Google
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              New to HybridTrade?{' '}
              <Link className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline decoration-primary/30 underline-offset-4" href="/auth/register">
                Create an account
              </Link>
            </p>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
