import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { requireRole } from '@lib/requireRole'

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole('ADMIN')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const body = await req.json().catch(() => ({}))
  const id = String(body?.transactionId || '')
  if (!id) return new Response(JSON.stringify({ error: 'invalid' }), { status: 400 })

  const tx = await prisma.transaction.findUnique({ where: { id } })
  if (!tx || tx.type !== 'DEPOSIT' || tx.status !== 'PENDING') {
    return new Response(JSON.stringify({ error: 'not_found_or_not_pending' }), { status: 404 })
  }
  const currency = String((tx.metadata as any)?.currency || (await prisma.user.findUnique({ where: { id: tx.userId } }))?.currency || 'USD')
  const amount = Number(tx.amount)

  const wallet = await prisma.wallet.findUnique({ where: { userId_currency: { userId: tx.userId, currency } } })
  if (wallet) {
    await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: Number(wallet.balance) + amount } })
  } else {
    await prisma.wallet.create({ data: { userId: tx.userId, currency, balance: amount } })
  }

  await prisma.transaction.update({ where: { id }, data: { status: 'COMPLETED', metadata: { ...(tx.metadata as any), approvedBy: String(user?.id || 'admin'), approvedAt: new Date().toISOString() } } })

  const autoActivate = Boolean((tx.metadata as any)?.autoActivate)
  const planId = String((tx.metadata as any)?.planId || '')
  if (autoActivate && planId) {
    const inv = await prisma.investment.create({ data: { userId: tx.userId, planId, amount, status: 'ACTIVE' } })
    const w = await prisma.wallet.findUnique({ where: { userId_currency: { userId: tx.userId, currency } } })
    if (w && Number(w.balance) >= amount) {
      await prisma.wallet.update({ where: { id: w.id }, data: { balance: Number(w.balance) - amount } })
    }
    await prisma.transaction.create({ data: { userId: tx.userId, investmentId: inv.id, type: 'DEPOSIT', amount, status: 'COMPLETED', metadata: { autoActivate: true, approvedBy: String(user?.id || 'admin') } } })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

