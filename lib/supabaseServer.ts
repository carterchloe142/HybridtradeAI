import { createClient } from '@supabase/supabase-js'

const IS_BUILD = process.env.VERCEL_ENV === "production" && process.env.NEXT_PHASE === "phase-production-build";

// STAGE 0: Force disable Supabase
const STAGE_0_DISABLE = true;

const url = (IS_BUILD || STAGE_0_DISABLE) ? '' : (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabaseServiceReady = Boolean(url && serviceKey)

function createDisabledClient(): any {
  const err = async () => { throw new Error('supabase_service_not_configured') }
  const from = () => ({
    select: err,
    insert: err,
    update: err,
    delete: err,
    eq: () => ({ select: err, insert: err, update: err, delete: err }),
    order: () => ({ select: err }),
    range: () => ({ select: err }),
    maybeSingle: err,
  })
  return { auth: { getUser: err }, from }
}

export const supabaseServer = supabaseServiceReady ? createClient(url, serviceKey) : null
