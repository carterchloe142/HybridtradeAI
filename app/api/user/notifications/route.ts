import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { requireRole } from '@lib/requireRole'
import { supabaseServer } from '@lib/supabaseServer'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  let userId = ''
  const token = url.searchParams.get('token') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || ''
  if (token) {
    const { data, error } = await supabaseServer.auth.getUser(token)
    if (!error && data?.user?.id) userId = String(data.user.id)
  }
  if (!userId) {
    const { user, error } = await requireRole('USER')
    if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
    userId = String(user.id)
  }
  const limit = Number(url.searchParams.get('limit') ?? '20')
  const sinceParam = url.searchParams.get('since')
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true'
  const type = url.searchParams.get('type')
  const where: any = { userId }
  if (unreadOnly) where.read = false
  if (type) where.type = type
  if (sinceParam) {
    const since = new Date(sinceParam)
    if (!isNaN(since.getTime())) where.createdAt = { gt: since }
  }
  const items = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: Math.max(1, Math.min(100, limit)),
  })
  return new Response(JSON.stringify({ items }), { status: 200 })
}
