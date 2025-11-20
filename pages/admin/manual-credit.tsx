import { useEffect, useState } from 'react'
import AdminGuard from '../../components/AdminGuard'
import { supabase } from '../../lib/supabase'

type Action = {
  id: string
  adminId: string
  userId: string
  amount: string
  action: 'MANUAL_CREDIT' | 'APPROVE_CREDIT'
  note?: string | null
  status: 'PENDING' | 'COMPLETED' | 'REJECTED'
  createdAt: string
}

export default function ManualCreditPage() {
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [history, setHistory] = useState<Action[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [total, setTotal] = useState(0)
  const [health, setHealth] = useState<{ manualCreditsEnabled?: boolean; prismaReady?: boolean; walletsTableReady?: boolean; serviceRoleConfigured?: boolean; prismaError?: string; prismaOptional?: boolean } | null>(null)
  const [healthMsg, setHealthMsg] = useState<string>('')

  async function loadHistory(nextPage = page, nextLimit = limit) {
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      const res = await fetch(`/api/admin/credit-user?page=${nextPage}&limit=${nextLimit}` , {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Failed to load admin credits')
        setHistory([])
      } else {
        setHistory((data.actions ?? []) as Action[])
        setTotal(Number(data.total || 0))
        setPage(Number(data.page || nextPage))
        setLimit(Number(data.limit || nextLimit))
      }
    } catch (e: any) {
      setMessage(e?.message || 'Failed to load admin credits')
    }
  }

  async function loadHealth() {
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      const res = await fetch('/api/admin/health', { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      const payload = await res.json()
      if (!res.ok) {
        setHealthMsg(payload.error || 'Health check failed')
      } else {
        setHealth(payload.status || null)
      }
    } catch (e: any) {
      setHealthMsg(e?.message || 'Health check failed')
    }
  }

  useEffect(() => {
    loadHistory(page, limit)
    loadHealth()
  }, [page, limit])

  async function submit() {
    setMessage(null)
    setErrorCode(null)
    setLoading(true)
    try {
      const amt = Number(amount)
      if (!userId || !amt || amt <= 0) {
        setMessage('Enter a valid user identifier (email or UUID) and amount > 0')
        return
      }
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      const res = await fetch('/api/admin/credit-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          // Send email if provided, otherwise assume UUID/cuid
          ...(userId.includes('@') ? { email: userId } : { userId }),
          amount: amt,
          description
        }),
      })
      const payload = await res.json()
      if (!res.ok) {
        const code = String(payload.error || '')
        setErrorCode(code || null)
        setMessage(
          code === 'manual_credits_disabled' ? 'Manual credits are disabled by configuration.' :
          code === 'service_role_not_configured' ? 'Supabase service role is not configured.' :
          code === 'invalid_user_identifier' ? 'User not found. Check email or UUID.' :
          code.startsWith('wallet_select_failed') ? 'Could not read wallet; check Supabase permissions.' :
          code.startsWith('wallet_create_failed') ? 'Could not create wallet; check Supabase schema.' :
          code.startsWith('wallet_update_failed') ? 'Could not update wallet; check Supabase RLS.' :
          code.startsWith('transactions_insert_failed') ? 'Could not insert transaction; check Supabase schema.' :
          payload.error || 'Credit failed'
        )
      } else if (payload.status === 'pending') {
        setMessage('Credit logged as pending approval')
      } else {
        setMessage(`Credited. New balance: ${payload.balance}`)
        // Reset the form after a successful transaction
        setUserId('')
        setAmount('')
        setDescription('')
      }
      loadHistory()
    } catch (e: any) {
      setMessage(e?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminGuard>
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Manual Credit</h1>
      {health && (
        <div className="mb-4 text-sm">
          <p>Manual Credits Enabled: {String(health.manualCreditsEnabled ?? false)}</p>
          <p>Service Role Configured: {String(health.serviceRoleConfigured ?? false)}</p>
          <p>Prisma Ready: {String(health.prismaReady ?? false)}</p>
          <p>Wallets Table Ready: {String(health.walletsTableReady ?? false)}</p>
          {!health.prismaReady && health.prismaError && health.prismaOptional !== true && (
            <div className="mt-2 rounded px-3 py-2 bg-red-100 text-red-700">
              Prisma error: {health.prismaError}
            </div>
          )}
          <div className={`mt-2 rounded px-3 py-2 ${health.manualCreditsEnabled && health.serviceRoleConfigured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {(!health.manualCreditsEnabled) && <span>Manual credits are disabled. Enable in environment config.</span>}
            {(health.manualCreditsEnabled && !health.serviceRoleConfigured) && <span>Supabase service role is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.</span>}
            {(health.manualCreditsEnabled && health.serviceRoleConfigured) && <span>Manual credit is ready.</span>}
          </div>
        </div>
      )}
      {healthMsg && <p className="text-sm text-red-600 mb-2">{healthMsg}</p>}
      <div className="bg-white shadow rounded p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium">User Identifier</label>
          <input
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Enter user email or Supabase UUID"
          />
          <p className="mt-1 text-xs text-gray-600">You can paste the user's email, Supabase user UUID, or a Prisma cuid; emails are recommended.</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Amount</label>
          <input value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" type="number" step="0.01" placeholder="e.g., 100" />
        </div>
        <div>
          <label className="block text-sm font-medium">Description (optional)</label>
          <input value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="Reason" />
        </div>
        <button disabled={loading || Boolean(health && (!health.manualCreditsEnabled || !health.serviceRoleConfigured))} onClick={submit} className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50">
          {loading ? 'Processing...' : 'Credit User'}
        </button>
      {message && (
        <div className={`mt-2 text-sm ${errorCode ? 'text-red-600' : 'text-green-700'}`}>
          {message}
          {errorCode && <span className="ml-2">({errorCode})</span>}
        </div>
      )}
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Recent Admin Credits</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Admin</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.id} className="border-t">
                <td className="px-3 py-2">{new Date(h.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">{h.adminId}</td>
                <td className="px-3 py-2">{h.userId}</td>
                <td className="px-3 py-2">{h.amount}</td>
                <td className="px-3 py-2">{h.status}</td>
                <td className="px-3 py-2">{h.note ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <button
            className="bg-gray-200 text-black rounded px-3 py-1 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >Prev</button>
          <button
            className="bg-gray-200 text-black rounded px-3 py-1 disabled:opacity-50"
            disabled={page * limit >= total}
            onClick={() => setPage(p => p + 1)}
          >Next</button>
        </div>
        <div className="text-sm">
          Page {page} • Showing {history.length} of {total}
          <select
            className="border rounded px-2 py-1 ml-3"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[10,25,50,100].map(l => <option key={l} value={l}>{l}/page</option>)}
          </select>
        </div>
      </div>
    </div>
    </AdminGuard>
  )
}
