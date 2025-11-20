import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

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

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : makeStub();
