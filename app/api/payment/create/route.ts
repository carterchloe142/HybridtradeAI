import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireRole } from '../../../../src/lib/requireRole'
import { supabaseServer } from '../../../../src/lib/supabaseServer'
import { getPaymentProvider } from '../../../../src/lib/payment'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRole('USER', req)
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!supabaseServer) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const amount = Number(body?.amount || 0)
    const currency = String(body?.currency || 'USD')
    let cryptoCurrency = String(body?.cryptoCurrency || 'USDT')
    const providerName = String(body?.provider || 'nowpayments').toLowerCase()
    const planId = body?.planId != null ? String(body.planId) : ''
    const autoActivate = Boolean(body?.autoActivate)

    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    if (!cryptoCurrency) return NextResponse.json({ error: 'Missing cryptoCurrency' }, { status: 400 })

    if (providerName === 'nowpayments') {
      const c = cryptoCurrency.toLowerCase()
      if (c === 'usdt') cryptoCurrency = 'usdttrc20'

      if (String(currency).toUpperCase() === 'USD' && amount < 20) {
        return NextResponse.json({ error: 'Minimum crypto deposit is $20' }, { status: 400 })
      }
    }

    const txId = crypto.randomUUID()
    const nowIso = new Date().toISOString()

    const userEmail = String(user.email || '').trim()
    if (!userEmail) return NextResponse.json({ error: 'Missing user email' }, { status: 400 })

    const { data: appUser, error: appUserErr } = await supabaseServer
      .from('User')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (appUserErr) throw appUserErr
    if (!appUser) {
      const { error: createUserErr } = await supabaseServer.from('User').insert({
        id: user.id,
        email: userEmail,
        role: 'USER',
        kycStatus: 'PENDING',
        createdAt: nowIso,
        updatedAt: nowIso,
      })
      if (createUserErr) throw createUserErr
    }

    const baseMeta: any = {
      gateway: providerName,
      cryptoCurrency: cryptoCurrency.toUpperCase(),
      createdVia: 'api/payment/create',
      ...(planId ? { planId } : {}),
      ...(autoActivate ? { autoActivate: true } : {}),
    }

    const { error: txErr } = await supabaseServer.from('Transaction').insert({
      id: txId,
      userId: user.id,
      type: 'DEPOSIT',
      amount,
      currency,
      status: 'PENDING',
      provider: providerName.toUpperCase(),
      reference: JSON.stringify(baseMeta),
      createdAt: nowIso,
      updatedAt: nowIso,
    })
    if (txErr) throw txErr

    const ipnCallbackUrl = String(process.env.NOWPAYMENTS_IPN_CALLBACK_URL || '').trim()
    const provider = getPaymentProvider(providerName === 'nowpayments' ? 'nowpayments' : 'mock')
    const payment = await provider.createPayment({
      amount,
      currency,
      cryptoCurrency,
      orderId: txId,
      email: userEmail,
      userId: user.id,
      ipnCallbackUrl,
    })

    const meta = {
      ...baseMeta,
      nowpayments: {
        paymentId: payment.id,
        payCurrency: payment.currencyExpected,
        payAmount: payment.amountExpected,
        walletAddress: payment.walletAddress,
        payUrl: payment.payUrl,
      },
    }

    await supabaseServer
      .from('Transaction')
      .update({ reference: JSON.stringify(meta), updatedAt: new Date().toISOString() })
      .eq('id', txId)

    return NextResponse.json({
      transactionId: txId,
      walletAddress: payment.walletAddress,
      payUrl: payment.payUrl,
      amountExpected: payment.amountExpected,
      currencyExpected: payment.currencyExpected,
      provider: providerName,
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
