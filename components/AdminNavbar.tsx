import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function AdminNavbar({ onQuickRun }: { onQuickRun?: () => void }) {
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  }
  return (
    <div className="glass rounded-2xl p-4 flex items-center justify-between">
      <h2 className="text-xl font-bold neon-text">Admin Panel</h2>
      <div className="flex items-center gap-3">
        <Link href="/admin/performance" className="btn-neon">Update Performance</Link>
        {onQuickRun && (
          <button className="btn-neon" onClick={onQuickRun}>Quick Run Profit</button>
        )}
        <button className="btn-neon" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

