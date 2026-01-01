import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
export const supabaseReady = !!(supabaseUrl && supabaseAnonKey)

function makeStub() {
  const noop = async () => ({ data: null, error: new Error('Supabase not configured') });
  const auth = {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') })
  };
  const query = {
    select: () => ({ eq: () => ({ limit: () => ({ maybeSingle: noop }) }), maybeSingle: noop }),
    upsert: () => ({ select: noop }),
    eq: () => ({ select: noop }),
  } as any;
  return { auth, from: () => query } as any;
}

const isProd = process.env.NODE_ENV === 'production'

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: isProd } })
  : makeStub();

export const authedFetcher = async (url: string) => {
  const { data: session } = await supabase.auth.getSession()
  const token = (session as any)?.session?.access_token
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
  return res.json()
}

export const authedJson = async (url: string, init?: RequestInit) => {
  const { data: session } = await supabase.auth.getSession()
  const token = (session as any)?.session?.access_token
  const headers = { ...(init?.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  const res = await fetch(url, { ...init, headers })
  const json = await res.json()
  if (!res.ok) {
    const err = typeof (json as any).error === 'string' ? (json as any).error : ((json as any)?.error?.message || 'Failed')
    throw new Error(err)
  }
  return json
}
