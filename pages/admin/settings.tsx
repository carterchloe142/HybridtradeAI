import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';
import { supabase } from '../../lib/supabase';

type Setting = { key: string; value: string };

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const keys = ['maintenance_mode', 'global_notice'];

  async function fetchSettings() {
    setLoading(true);
    const { data, error } = await supabase.from('settings').select('key,value').in('key', keys);
    if (error) console.error(error);
    else setSettings((data as any) || []);
    setLoading(false);
  }

  async function save(key: string, value: string) {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) return setMsg('Session lost');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key, value }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMsg(`${key} saved`);
      fetchSettings();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const get = (k: string) => settings.find((s) => s.key === k)?.value ?? '';

  return (
    <AdminGuard>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>
        {msg && <p className="mb-2 text-sm text-blue-600">{msg}</p>}
        {loading && <p className="text-sm">Loading…</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Maintenance Mode</label>
            <select
              className="w-full border rounded p-2"
              value={get('maintenance_mode')}
              onChange={(e) => save('maintenance_mode', e.target.value)}
            >
              <option value="false">Off</option>
              <option value="true">On</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Global Notice (Markdown supported)</label>
            <textarea
              className="w-full border rounded p-2"
              rows={4}
              value={get('global_notice')}
              onChange={(e) => save('global_notice', e.target.value)}
              placeholder="Leave empty to hide"
            />
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}