import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

export const supabaseReady = Boolean(supabaseUrl && supabaseAnonKey)

function makeStub() {
    const noop = async () => ({ data: null, error: new Error('Supabase not configured') })
    const auth = {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
    }
    const query = {
        select: () => ({ eq: () => ({ limit: () => ({ maybeSingle: noop, single: noop }), maybeSingle: noop, single: noop }), maybeSingle: noop, single: noop }),
        upsert: () => ({ select: noop }),
        eq: () => ({ select: noop }),
        insert: () => ({ select: noop }),
        update: () => ({ select: noop }),
        delete: () => ({ select: noop }),
    }
    // Return a proxy that swallows everything else safely if needed, but this stub covers basic usage
    return { 
        auth, 
        from: () => query,
        channel: () => ({ on: () => ({ subscribe: () => {} }), subscribe: () => {}, unsubscribe: () => {} }) 
    } as any
}

// Client-side / Isomorphic client
// Safe initialization
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createSupabaseClient(supabaseUrl, supabaseAnonKey, { 
        auth: { 
            persistSession: true, 
            autoRefreshToken: true,
            detectSessionInUrl: true
        } 
      })
    : makeStub()

async function getAccessToken() {
  try {
    const { data } = await supabase.auth.getSession()
    const token = (data as any)?.session?.access_token
    return token ? String(token) : null
  } catch {
    return null
  }
}

export async function authedFetcher(url: string) {
  const token = await getAccessToken()
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `request_failed_${res.status}`)
  }
  return res.json()
}

export async function authedJson(url: string, init: RequestInit = {}) {
  const token = await getAccessToken()
  const headers = new Headers(init.headers || undefined)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(url, { ...init, headers })
  const text = await res.text().catch(() => '')
  let json: any = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  if (!res.ok) {
    const msg = json?.error || json?.details || text || `request_failed_${res.status}`
    throw new Error(String(msg))
  }
  return json
}
