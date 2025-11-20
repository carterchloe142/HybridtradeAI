import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { requireRole } from '@lib/requireRole'
import { publish } from '@lib/sse'

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole('USER')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const url = new URL(req.url)
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || '25')))
  const type = String(url.searchParams.get('type') || '')
  const status = String(url.searchParams.get('status') || '')
  const where: any = { userId: String(user.id) }
  if (type) where.type = type as any
  if (status) where.status = status as any
  const [items, total] = await Promise.all([
    prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.transaction.count({ where }),
  ])
  return new Response(JSON.stringify({ items, total, page, limit }), { status: 200 })
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole('USER')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const body = await req.json()
  const kind = String(body?.kind || '')
  const amount = Number(body?.amount || 0)
  const currency = String(body?.currency || (user as any).currency || 'USD')
  if (!kind || amount <= 0) return new Response(JSON.stringify({ error: 'invalid' }), { status: 400 })
  if (kind === 'deposit') {
    const txn = await prisma.transaction.create({ data: { userId: String(user.id), type: 'DEPOSIT', amount, status: 'PENDING', metadata: { currency, provider: String(body?.provider || 'paystack') } } })
    return new Response(JSON.stringify({ ok: true, transaction: txn, paystack: { authorizationUrl: '', reference: txn.id } }), { status: 200 })
  }
  if (kind === 'withdraw') {
    const wallet = await prisma.wallet.findUnique({ where: { userId_currency: { userId: String(user.id), currency } } })
    if (!wallet || Number(wallet.balance) < amount) return new Response(JSON.stringify({ error: 'insufficient_balance' }), { status: 400 })
    const txn = await prisma.transaction.create({ data: { userId: String(user.id), type: 'WITHDRAWAL', amount, status: 'PENDING', metadata: { currency } } })
    await publish(`user:${String(user.id)}`, { id: `req:${txn.id}`, type: 'withdrawal_status', title: 'Withdrawal Requested', message: `Requested ${amount} ${currency}`, createdAt: new Date().toISOString() })
    return new Response(JSON.stringify({ ok: true, transaction: txn }), { status: 200 })
  }
  return new Response(JSON.stringify({ error: 'invalid_kind' }), { status: 400 })
}
