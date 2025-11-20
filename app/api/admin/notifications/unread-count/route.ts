import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { requireRole } from '@lib/requireRole'

export async function GET(req: NextRequest) {
  const { error } = await requireRole('ADMIN')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const url = new URL(req.url)
  const type = url.searchParams.get('type')
  const where: any = { read: false }
  if (type) where.type = type
  const total = await prisma.notification.count({ where })
  const groups = await prisma.notification.groupBy({ by: ['type'], where: { read: false }, _count: { _all: true } })
  const unreadByType: Record<string, number> = {}
  for (const g of groups) unreadByType[g.type] = (g as any)._count._all
  return new Response(JSON.stringify({ total, unreadByType }), { status: 200 })
}
