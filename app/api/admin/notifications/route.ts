import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { requireRole } from '@lib/requireRole'

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole('ADMIN')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const url = new URL(req.url)
  const scope = String(url.searchParams.get('scope') || 'personal')
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') || '50')))
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true'
  const type = url.searchParams.get('type')
  if (scope === 'global') {
    const where: any = {}
    if (type) where.type = type
    const items = await prisma.globalNotification.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit })
    return new Response(JSON.stringify({ items }), { status: 200 })
  }
  const where: any = { userId: String(user.id) }
  if (unreadOnly) where.read = false
  if (type) where.type = type
  const items = await prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit })
  return new Response(JSON.stringify({ items }), { status: 200 })
}

