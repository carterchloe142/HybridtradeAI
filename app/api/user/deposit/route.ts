import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireRole } from '../../../../src/lib/requireRole'
import { supabaseServer } from '../../../../src/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRole('USER', req)
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!supabaseServer) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

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

    const body = await req.json()
    const { amount, currency = 'USD', provider = 'paystack', planId, cryptoCurrency, txHash, transactionId } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const providerName = String(provider || '').toLowerCase()

    if (providerName === 'nowpayments' || providerName === 'crypto') {
      const txId = String(transactionId || '').trim()
      if (!txId) return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 })

      const { data: tx, error: txReadErr } = await supabaseServer
        .from('Transaction')
        .select('id,userId,reference,status')
        .eq('id', txId)
        .maybeSingle()

      if (txReadErr || !tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      if (String(tx.userId) !== String(user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

      let meta: any = {}
      try { meta = tx.reference ? JSON.parse(String(tx.reference)) : {} } catch { meta = {} }
      meta.planId = planId || meta.planId
      meta.cryptoCurrency = cryptoCurrency || meta.cryptoCurrency
      if (txHash) meta.txHash = txHash

      await supabaseServer
        .from('Transaction')
        .update({ reference: JSON.stringify(meta), updatedAt: nowIso })
        .eq('id', txId)

      return NextResponse.json({ message: 'Deposit recorded', transactionId: txId })
    }

    const txId = crypto.randomUUID()
    const { error: txError } = await supabaseServer.from('Transaction').insert({
      id: txId,
      userId: user.id,
      type: 'DEPOSIT',
      amount: amount,
      currency: currency,
      status: 'PENDING',
      provider: providerName.toUpperCase(),
      reference: JSON.stringify({
        planId,
        gateway_reference: providerName === 'paystack' ? `ref_${Date.now()}` : undefined,
      }),
      createdAt: nowIso,
      updatedAt: nowIso,
    })

    if (txError) throw txError

    // Mock Paystack URL
    if (provider === 'paystack') {
        // In a real app, you'd call Paystack API here to initialize transaction
        // For now, we'll just return a success message or a mock URL
        // If we want to simulate instant success for demo:
        
        // AUTO-APPROVE FOR DEMO PURPOSES (Optional - maybe remove for prod)
        // await supabase.from('Transaction').update({ status: 'COMPLETED' }).eq('id', txId)
        // And update wallet...
        
      return NextResponse.json({
        message: 'Deposit initialized',
        authorizationUrl: `https://checkout.paystack.com/mock-checkout?ref=${txId}&amount=${amount}`,
        reference: txId,
      })
    }

    return NextResponse.json({ 
        message: 'Deposit recorded', 
        transactionId: txId 
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
