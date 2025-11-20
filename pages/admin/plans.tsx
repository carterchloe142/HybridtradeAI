import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';
import { supabase } from '../../lib/supabase';

type Plan = {
  id: string;
  name: string;
  weekly_roi: number;
  min_amount: number;
  max_amount: number;
  features: string[];
};

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [edit, setEdit] = useState<Plan | null>(null);

  async function fetchPlans() {
    setLoading(true);
    const { data, error } = await supabase.from('plans').select('*').order('min_amount', { ascending: true });
    if (error) console.error(error);
    else setPlans((data as any) || []);
    setLoading(false);
  }

  async function savePlan(p: Plan) {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) return setMsg('Session lost');
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(p),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMsg('Plan saved');
      setEdit(null);
      fetchPlans();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <AdminGuard>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Investment Plans</h1>
        {msg && <p className="mb-2 text-sm text-blue-600">{msg}</p>}
        {loading && <p className="text-sm">Loading…</p>}
        <div className="overflow-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="px-2 py-1 text-left">Name</th>
                <th className="px-2 py-1 text-left">Weekly ROI %</th>
                <th className="px-2 py-1 text-left">Min</th>
                <th className="px-2 py-1 text-left">Max</th>
                <th className="px-2 py-1 text-left">Features</th>
                <th className="px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-2 py-1">{p.name}</td>
                  <td className="px-2 py-1">{p.weekly_roi}</td>
                  <td className="px-2 py-1">{p.min_amount}</td>
                  <td className="px-2 py-1">{p.max_amount}</td>
                  <td className="px-2 py-1">{p.features.join(', ')}</td>
                  <td className="px-2 py-1">
                    <button
                      onClick={() => setEdit(p)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {edit && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h2 className="text-lg font-medium mb-2">Edit {edit.name}</h2>
            <label className="block text-sm mb-1">Weekly ROI %</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded p-2 mb-2"
              value={edit.weekly_roi}
              onChange={(e) => setEdit({ ...edit, weekly_roi: parseFloat(e.target.value) })}
            />
            <label className="block text-sm mb-1">Min Amount</label>
            <input
              type="number"
              className="w-full border rounded p-2 mb-2"
              value={edit.min_amount}
              onChange={(e) => setEdit({ ...edit, min_amount: parseFloat(e.target.value) })}
            />
            <label className="block text-sm mb-1">Max Amount</label>
            <input
              type="number"
              className="w-full border rounded p-2 mb-2"
              value={edit.max_amount}
              onChange={(e) => setEdit({ ...edit, max_amount: parseFloat(e.target.value) })}
            />
            <label className="block text-sm mb-1">Features (comma separated)</label>
            <input
              type="text"
              className="w-full border rounded p-2 mb-3"
              value={edit.features.join(', ')}
              onChange={(e) => setEdit({ ...edit, features: e.target.value.split(',').map((s) => s.trim()) })}
            />
            <div className="flex gap-2">
              <button
                onClick={() => savePlan(edit)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setEdit(null)}
                className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
