import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { publish } from '@lib/sse'
import { requireRole } from '@lib/requireRole'

export async function GET(req: NextRequest) {
  const { error } = await requireRole('ADMIN')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const userId = url.searchParams.get('userId')
  const take = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') ?? '50')))
  const where: any = {}
  if (status) where.status = status
  if (userId) where.userId = userId
  const items = await prisma.investment.findMany({ where, orderBy: { createdAt: 'desc' }, take })
  return new Response(JSON.stringify({ items }), { status: 200 })
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireRole('ADMIN')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const body = await req.json()
  const id = String(body?.id || '')
  const action = String(body?.action || '')
  if (!id || !action) return new Response(JSON.stringify({ error: 'invalid' }), { status: 400 })
  if (action === 'approve') {
    const inv = await prisma.investment.update({ where: { id }, data: { status: 'ACTIVE' } })
    try {
      const n = await prisma.notification.create({ data: { userId: String(inv.userId), type: 'investment_status', title: 'Investment Approved', message: 'Your investment is now active.', read: false } })
      await publish(`user:${String(inv.userId)}`, { id: n.id, type: n.type, title: n.title, message: n.message, createdAt: n.createdAt })
    } catch {}
    return new Response(JSON.stringify({ ok: true, investment: inv }), { status: 200 })
  }
  if (action === 'settle') {
    const inv = await prisma.investment.update({ where: { id }, data: { status: 'MATURED', maturedAt: new Date() } })
    try {
      const n = await prisma.notification.create({ data: { userId: String(inv.userId), type: 'investment_status', title: 'Investment Matured', message: 'Your investment has matured.', read: false } })
      await publish(`user:${String(inv.userId)}`, { id: n.id, type: n.type, title: n.title, message: n.message, createdAt: n.createdAt })
    } catch {}
    return new Response(JSON.stringify({ ok: true, investment: inv }), { status: 200 })
  }
  return new Response(JSON.stringify({ error: 'unknown_action' }), { status: 400 })
}
