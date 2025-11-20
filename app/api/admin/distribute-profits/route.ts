import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { runBaselineCycle, runStreamDistribution } from '@lib/profit/engine'
import { requireRole } from '@lib/requireRole'

export async function POST(req: NextRequest) {
  const { error } = await requireRole('ADMIN')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const body = await req.json()
  const dryRun = body?.dryRun === true
  const weekEnding = body?.weekEnding || new Date().toISOString()
  const mode = String(body?.mode || 'baseline')
  if (!dryRun) {
    const week = new Date(weekEnding)
    const existing = await prisma.profitLog.count({ where: { weekEnding: week } })
    if (existing > 0) return new Response(JSON.stringify({ error: 'already_distributed' }), { status: 409 })
  }
  if (mode === 'baseline') {
    const result = await runBaselineCycle({ weekEnding, dryRun })
    return new Response(JSON.stringify(result), { status: 200 })
  }
  if (mode === 'stream') {
    const performance = body?.performance || {}
    const result = await runStreamDistribution({ weekEnding, performance, dryRun })
    return new Response(JSON.stringify(result), { status: 200 })
  }
  return new Response(JSON.stringify({ error: 'invalid_mode' }), { status: 400 })
}
