import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { requireRole } from '@lib/requireRole'

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole('USER')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const url = new URL(req.url)
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || '25')))
  const status = String(url.searchParams.get('status') || '')
  const where: any = { userId: String(user.id) }
  if (status) where.status = status as any
  const [items, total] = await Promise.all([
    prisma.investment.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, include: { plan: true } }),
    prisma.investment.count({ where }),
  ])
  return new Response(JSON.stringify({ items, total, page, limit }), { status: 200 })
}
