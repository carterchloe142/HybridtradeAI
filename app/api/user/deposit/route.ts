import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { requireRole } from '@lib/requireRole'

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole('USER')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const body = await req.json().catch(() => ({}))
  const amount = Number(body?.amount || 0)
  const currency = String(body?.currency || 'NGN')
  const planId = String(body?.planId || '')
  const autoActivate = body?.autoActivate === true
  const email = String((user as any)?.email || body?.email || '')
  if (!amount || amount <= 0) return new Response(JSON.stringify({ error: 'invalid_amount' }), { status: 400 })
  if (!email) return new Response(JSON.stringify({ error: 'missing_email' }), { status: 400 })

  const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      email,
      currency,
      metadata: { userId: String(user.id), planId, autoActivate, currency },
    }),
  })
  const json = await initRes.json()
  if (!initRes.ok || !json?.status) {
    return new Response(JSON.stringify({ error: 'init_failed', details: json }), { status: 502 })
  }
  const reference = String(json?.data?.reference || '')
  const authorizationUrl = String(json?.data?.authorization_url || '')

  await prisma.transaction.create({
    data: {
      userId: String(user.id),
      type: 'DEPOSIT',
      amount,
      status: 'PENDING',
      metadata: { provider: 'paystack', reference, currency, planId, autoActivate },
    },
  })

  return new Response(JSON.stringify({ ok: true, authorizationUrl, reference }), { status: 200 })
}

