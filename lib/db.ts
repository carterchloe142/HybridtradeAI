import { supabase } from './supabase';

export type WalletRow = {
  id: string;
  user_id: string;
  currency: 'USD' | 'EUR' | 'NGN' | 'BTC' | 'ETH';
  balance: number;
};

export type InvestmentRow = {
  id: string;
  user_id: string;
  plan_id: 'starter' | 'pro' | 'elite';
  amount_usd: number;
  status: 'active' | 'completed' | 'pending';
};

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function getUserWallets(userId: string): Promise<WalletRow[]> {
  // First try client-side read (requires RLS policies). If empty or blocked, fallback to server API.
  const { data, error } = await supabase
    .from('wallets')
    .select('id,user_id,currency,balance')
    .eq('user_id', userId);
  const direct = (data ?? []) as WalletRow[];
  if (!error && direct.length > 0) return direct;
  try {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) return direct; // cannot fallback without token
    const res = await fetch(`/api/user/wallets?ts=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token}` },
      // Ensure no caching by intermediaries
      cache: 'no-store',
    });
    if (!res.ok) return direct;
    const payload = await res.json();
    return (payload.wallets ?? []) as WalletRow[];
  } catch {
    return direct;
  }
}

export async function getUserInvestments(userId: string): Promise<any[]> {
  // Try API first for rich data (Plan relations)
  try {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (token) {
      const res = await fetch(`/api/user/investments?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        // Map Prisma "plan" (camelCase) to what UI might expect if needed, 
        // but dashboard.tsx now uses plan?.slug so we are good.
        // We map to snake_case to match existing "InvestmentRow" if we want compatibility,
        // but dashboard checks `i.amount_usd` (snake_case in types) vs `i.amount` (Prisma).
        // Let's normalize.
        return (json.items || []).map((i: any) => ({
          ...i,
          id: i.id,
          user_id: i.userId,
          plan_id: i.planId,
          amount_usd: Number(i.principal),
          status: i.status.toLowerCase(),
          plan: i.plan // Include the plan object
        }));
      }
    }
  } catch {}

  // Fallback to Supabase direct (might lack Plan details if not joined)
  const { data, error } = await supabase
    .from('investments')
    .select('*, plan:plan_id(*)') // Try to join if relation exists
    .eq('user_id', userId);
  if (error) return [];
  
  return (data ?? []).map((i: any) => ({
    ...i,
    plan: i.plan // Supabase might return it if relation is set
  }));
}

export async function upsertReferral(userId: string, code: string) {
  const { data, error } = await supabase
    .from('referrals')
    .upsert({ user_id: userId, code }, { onConflict: 'user_id' })
    .select();
  if (error) return null;
  return data?.[0] ?? null;
}

export async function getReferralByUser(userId: string) {
  const { data } = await supabase
    .from('referrals')
    .select('code,total_earnings')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  return data ?? null;
}
