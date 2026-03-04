'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import FuturisticBackground from '@/components/ui/FuturisticBackground';
import { Lock, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function UpdatePassword() {
  const router = useRouter();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if we have a session (user is logged in via the magic link)
    const checkSession = async () => {
      // Wait a moment for session to be established from URL hash
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Invalid or expired reset link. Redirecting to login...");
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    };
    checkSession();
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid form');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: form.password });
      
      if (error) throw error;
      
      setSuccess('Password updated successfully. Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
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
                Set New Password
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">Create a new secure password for your account</p>
            </motion.div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  className="w-full bg-muted/20 border border-border/50 rounded-xl py-3 pl-10 pr-10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-muted/30 focus:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })} 
                />
                 <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary transition-colors z-10"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  className="w-full bg-muted/20 border border-border/50 rounded-xl py-3 pl-10 pr-10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-muted/30 focus:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  value={form.confirmPassword} 
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
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

            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm flex items-center gap-2"
              >
                <CheckCircle2 size={16} className="text-green-500" />
                {success}
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
                    <Loader2 className="animate-spin" size={20} /> Updating...
                  </>
                ) : (
                  <>
                    Update Password <ArrowRight size={18} />
                  </>
                )}
              </span>
            </button>
          </form>
          
        </div>
      </motion.div>
    </div>
  );
}
