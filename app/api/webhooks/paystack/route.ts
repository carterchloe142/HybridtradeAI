import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import crypto from 'crypto'

function hmacValid(raw: string, signature: string | null) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY || ''
  if (!secret || !signature) return false
  const hash = crypto.createHmac('sha512', secret).update(raw).digest('hex')
  return hash === signature
}

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const sig = req.headers.get('x-paystack-signature')
  if (!hmacValid(raw, sig)) return new Response(JSON.stringify({ error: 'invalid_signature' }), { status: 401 })

  let payload: any
  try { payload = JSON.parse(raw) } catch { return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400 }) }

  const event = String(payload?.event || '')
  const data = payload?.data || {}
  const reference = String(data?.reference || '')
  const status = String(data?.status || '')
  const amountKobo = Number(data?.amount || 0)
  const currency = String(data?.currency || 'NGN')
  const meta = data?.metadata || {}
  const userId = String(meta?.userId || '')
  const planId = String(meta?.planId || '')
  const autoActivate = Boolean(meta?.autoActivate)

  if (!reference || !userId) {
    return new Response(JSON.stringify({ error: 'missing_reference_or_user' }), { status: 400 })
  }

  let verified = status === 'success'
  if (!verified) {
    try {
      const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      })
      const v = await res.json()
      verified = v?.data?.status === 'success'
    } catch {}
  }
  if (!verified) return new Response(JSON.stringify({ error: 'not_success' }), { status: 200 })

  const amount = Number((amountKobo || 0) / 100)

  const existing = await prisma.transaction.findFirst({ where: { type: 'DEPOSIT', userId, status: 'PENDING', metadata: { equals: { provider: 'paystack', reference } } } as any })

  if (existing) {
    await prisma.transaction.update({ where: { id: existing.id }, data: { status: 'COMPLETED' } })
  } else {
    await prisma.transaction.create({
      data: { userId, type: 'DEPOSIT', amount, status: 'COMPLETED', metadata: { provider: 'paystack', reference, currency, planId, autoActivate } },
    })
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId_currency: { userId, currency } } })
  if (wallet) {
    await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: Number(wallet.balance) + amount } })
  } else {
    await prisma.wallet.create({ data: { userId, currency, balance: amount } })
  }

  if (autoActivate && planId) {
    const inv = await prisma.investment.create({ data: { userId, planId, amount, status: 'ACTIVE' } })
    const w = await prisma.wallet.findUnique({ where: { userId_currency: { userId, currency } } })
    if (w && Number(w.balance) >= amount) {
      await prisma.wallet.update({ where: { id: w.id }, data: { balance: Number(w.balance) - amount } })
    }
    await prisma.transaction.create({ data: { userId, investmentId: inv.id, type: 'DEPOSIT', amount, status: 'COMPLETED', metadata: { autoActivate: true, reference, currency, planId } } })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

