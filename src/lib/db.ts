import { supabase } from '@/src/lib/supabase'

type SupabaseErrorLike = { message?: string; code?: string } | null | undefined

function isMissingRelation(error: SupabaseErrorLike) {
  const msg = String(error?.message || '')
  return msg.includes('relation') || msg.includes('does not exist') || String(error?.code || '') === '42P01'
}

function isMissingColumn(error: SupabaseErrorLike) {
  const msg = String(error?.message || '')
  return msg.includes('column') && msg.includes('does not exist')
}

async function selectByUser(table: string, userId: string) {
  const res1 = await supabase.from(table).select('*').eq('userId', userId)
  if (!res1.error) return res1
  if (isMissingColumn(res1.error) || String(res1.error?.message || '').includes('userId')) {
    const res2 = await supabase.from(table).select('*').eq('user_id', userId)
    return res2
  }
  return res1
}

async function selectFirstExistingTable(tables: string[], select: (table: string) => Promise<{ data: any; error: any }>) {
  let lastError: any = null
  for (const table of tables) {
    const res = await select(table)
    if (!res.error) return res
    lastError = res.error
    if (!isMissingRelation(res.error)) return res
  }
  return { data: null, error: lastError }
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) return null
    const id = data?.session?.user?.id
    return id ? String(id) : null
  } catch {
    return null
  }
}

export async function getUserWallets(userId: string): Promise<Array<{ id?: string; userId?: string; user_id?: string; currency: string; balance: number }>> {
  const res = await selectFirstExistingTable(['Wallet', 'wallets', 'wallet'], (t) => selectByUser(t, userId))
  if (res.error || !Array.isArray(res.data)) return []
  return res.data.map((w: any) => {
    const currency = String(w?.currency || 'USD')
    const balance = Number(w?.balance ?? 0)
    const uid = w?.userId ?? w?.user_id
    return { ...w, id: w?.id, userId: uid ? String(uid) : undefined, user_id: uid ? String(uid) : undefined, currency, balance }
  })
}

export async function getUserInvestments(userId: string): Promise<any[]> {
  const res = await selectFirstExistingTable(['Investment', 'investments', 'investment'], (t) => selectByUser(t, userId))
  if (res.error || !Array.isArray(res.data)) return []
  return res.data.map((i: any) => {
    const statusRaw = i?.status
    const status = statusRaw != null ? String(statusRaw).toLowerCase() : ''
    const amountUsd = Number(i?.amount_usd ?? i?.amountUsd ?? i?.principal ?? i?.amount ?? 0)
    const planId = String(i?.plan_id ?? i?.planId ?? i?.plan ?? 'starter')
    return { ...i, status, amount_usd: amountUsd, plan_id: planId }
  })
}

export async function getReferralByUser(userId: string): Promise<any | null> {
  const res = await selectFirstExistingTable(['referrals', 'Referral'], async (t) => {
    const r1 = await supabase.from(t).select('*').eq('userId', userId).maybeSingle()
    if (!r1.error) return r1
    if (isMissingColumn(r1.error) || String(r1.error?.message || '').includes('userId')) {
      const r2 = await supabase.from(t).select('*').eq('user_id', userId).maybeSingle()
      return r2
    }
    return r1
  })
  if (res.error) return null
  return res.data ?? null
}

export async function getUserRecentTransactions(userId: string, limit = 5): Promise<any[]> {
  const res = await selectFirstExistingTable(['Transaction', 'transactions', 'transaction'], (t) => selectByUser(t, userId))
  if (res.error || !Array.isArray(res.data)) return []
  // Sort by createdAt desc and take top N
  return res.data
    .sort((a: any, b: any) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime())
    .slice(0, limit)
    .map((t: any) => ({
      ...t,
      createdAt: t.createdAt || t.created_at,
      type: t.type || 'UNKNOWN',
      amount: Number(t.amount || 0),
      currency: t.currency || 'USD',
      status: t.status || 'PENDING'
    }))
}

