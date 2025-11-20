import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '../../../lib/adminAuth'
import { supabaseServer, supabaseServiceReady } from '../../../lib/supabaseServer'
import prisma from '../../../src/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })
  const admin = await requireAdmin(req)
  if (!admin.ok) return res.status(401).json({ ok: false, error: admin.error || 'unauthorized' })

  const status: { manualCreditsEnabled: boolean; serviceRoleConfigured: boolean; prismaReady: boolean; walletsTableReady: boolean; prismaError?: string; prismaOptional?: boolean } = {
    manualCreditsEnabled: String(process.env.ENABLE_MANUAL_CREDITS || 'false').toLowerCase() === 'true',
    serviceRoleConfigured: supabaseServiceReady,
    prismaReady: false,
    walletsTableReady: false,
    prismaOptional: true,
  }

  // Check Prisma connectivity
  try {
    await prisma.$queryRaw`SELECT 1`
    status.prismaReady = true
  } catch (e: any) {
    status.prismaError = String(e?.message || e)
  }

  // Check Supabase wallets accessibility with service role
  try {
    const { data, error } = await supabaseServer
      .from('wallets')
      .select('id')
      .limit(1)
    if (!error) status.walletsTableReady = true
  } catch (e) {
    console.error('wallets api error', e)
    status.serviceRoleConfigured = false
  }

  return res.json({ ok: true, status })
}

export const config = { api: { bodyParser: false } }
