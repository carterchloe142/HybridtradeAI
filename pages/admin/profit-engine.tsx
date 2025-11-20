import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';
import { supabase } from '../../lib/supabase';

type Config = {
  fee_percent: number;
  reserve_percent: number;
  cycle_length_days: number;
};

export default function AdminProfitEngine() {
  const [config, setConfig] = useState<Config>({ fee_percent: 0, reserve_percent: 0, cycle_length_days: 7 });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  async function fetchConfig() {
    setLoading(true);
    const { data, error } = await supabase.from('settings').select('key,value').in('key', ['fee_percent', 'reserve_percent', 'cycle_length_days']);
    if (error) console.error(error);
    else {
      const map = (data as any).reduce((acc: any, row: any) => {
        acc[row.key] = parseFloat(row.value);
        return acc;
      }, {});
      setConfig({
        fee_percent: map.fee_percent ?? 5,
        reserve_percent: map.reserve_percent ?? 10,
        cycle_length_days: map.cycle_length_days ?? 7,
      });
    }
    setLoading(false);
  }

  async function saveConfig() {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) return setMsg('Session lost');
    try {
      const res = await fetch('/api/admin/profit-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMsg('Settings saved');
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <AdminGuard>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Profit-Engine Config</h1>
        {msg && <p className="mb-2 text-sm text-blue-600">{msg}</p>}
        {loading && <p className="text-sm">Loading…</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fee Percent</label>
            <input
              type="number"
              step="0.1"
              className="w-full border rounded p-2"
              value={config.fee_percent}
              onChange={(e) => setConfig({ ...config, fee_percent: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reserve Percent</label>
            <input
              type="number"
              step="0.1"
              className="w-full border rounded p-2"
              value={config.reserve_percent}
              onChange={(e) => setConfig({ ...config, reserve_percent: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cycle Length (days)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={config.cycle_length_days}
              onChange={(e) => setConfig({ ...config, cycle_length_days: parseInt(e.target.value) })}
            />
          </div>
          <button
            onClick={saveConfig}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </AdminGuard>
  );
}