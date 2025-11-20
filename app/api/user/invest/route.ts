import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { requireRole } from '@lib/requireRole'

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole('USER')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const body = await req.json()
  const planId = String(body?.planId || '')
  const amount = Number(body?.amount || 0)
  if (!planId || amount <= 0) return new Response(JSON.stringify({ error: 'invalid' }), { status: 400 })
  const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } })
  if (!plan) return new Response(JSON.stringify({ error: 'plan_not_found' }), { status: 404 })
  if (amount < Number(plan.minAmount) || amount > Number(plan.maxAmount)) {
    return new Response(JSON.stringify({ error: 'amount_out_of_range' }), { status: 400 })
  }
  const currency = String((user as any).currency || 'USD')
  const wallet = await prisma.wallet.findUnique({ where: { userId_currency: { userId: String(user.id), currency } } })
  let status: 'PENDING' | 'ACTIVE' = 'PENDING'
  if (wallet && Number(wallet.balance) >= amount) {
    await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: Number(wallet.balance) - amount } })
    status = 'ACTIVE'
  }
  const inv = await prisma.investment.create({
    data: {
      userId: String(user.id),
      planId: plan.id,
      amount,
      status,
    },
  })
  await prisma.transaction.create({
    data: {
      userId: String(user.id),
      investmentId: inv.id,
      type: status === 'ACTIVE' ? 'DEPOSIT' : 'DEPOSIT',
      amount,
      status: status === 'ACTIVE' ? 'COMPLETED' : 'PENDING',
      metadata: { currency, planId },
    },
  })
  return new Response(JSON.stringify({ ok: true, investment: inv }), { status: 200 })
}

