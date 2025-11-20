import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/router';

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

  return (
    <div className="max-w-md mx-auto card-neon">
      <h2 className="text-2xl font-bold neon-text">Welcome back</h2>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm text-white/70">Email</label>
          <input className="input-neon mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="text-sm text-white/70">Password</label>
          <input className="input-neon mt-1" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button className="btn-neon w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-sm text-white/70">New here? <Link className="text-neon-blue" href="/auth/register">Create an account</Link></p>
    </div>
  );
}
