import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid form');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
      if (error) throw error;
      setSuccess('Registration successful. Please check your email for confirmation.');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card-neon">
      <h2 className="text-2xl font-bold neon-text">Create your account</h2>
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
        {success && <div className="text-neon-blue text-sm">{success}</div>}
        <button className="btn-neon w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-sm text-white/70">Already have an account? <Link className="text-neon-blue" href="/auth/login">Login</Link></p>
    </div>
  );
}
