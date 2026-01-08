import { createClient } from '@supabase/supabase-js'

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return { url, serviceKey }
}

export const supabaseServiceReady = Boolean(getSupabaseConfig().url && getSupabaseConfig().serviceKey)

function createDisabledClient() {
    const err = async () => { throw new Error('supabase_service_not_configured') }
    const noopChain = () => ({
        select: err,
        insert: err,
        update: err,
        delete: err,
        eq: () => noopChain(),
        order: () => noopChain(),
        range: () => noopChain(),
        limit: () => noopChain(),
        single: err,
        maybeSingle: err,
    })

    return { 
        auth: { 
            getUser: err, 
            admin: { deleteUser: err, createUser: err, listUsers: err } 
        }, 
        from: () => noopChain() 
    } as any
}

// Runtime check for environment variables to avoid build-time crashes
// We use a lazy initialization pattern implicitly by checking env vars here.
const { url, serviceKey } = getSupabaseConfig()

export const supabaseServer = (url && serviceKey) 
    ? createClient(url, serviceKey) 
    : createDisabledClient()
