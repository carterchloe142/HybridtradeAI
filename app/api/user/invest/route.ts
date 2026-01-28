import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '../../../../src/lib/requireRole'
import { supabaseServer } from '../../../../src/lib/supabaseServer'
import { convertFromUSD, convertToUSD } from '../../../../lib/rates'
import crypto from 'crypto'

type WalletRow = { id: string; currency: string; balance: any }

export async function POST(req: NextRequest) {
  console.log('[Invest API] START (Supabase Native Mode)')
  
  try {
    const { user, error } = await requireRole('USER', req)
    if (error) {
      console.log('[Invest API] Auth error:', error)
      return NextResponse.json({ error }, { status: error === 'unauthenticated' ? 401 : 403 })
    }
    
    let body
    try {
      body = await req.json()
    } catch (e) {
      return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
    }

    const planId = String(body?.planId || '')
    const reqAmount = Number(body?.amount || 0)
    
    if (!planId || reqAmount <= 0) {
      return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
    }

    // --- 1. FIND PLAN ---
    let plan: any = null
    const slugToName: Record<string, string> = {
        'starter': 'Starter Plan',
        'pro': 'Pro Plan',
        'elite': 'Elite Plan'
    }
    const mappedName = slugToName[planId.toLowerCase()]

    // Try finding by mapped name first (most reliable if slug column missing)
    if (mappedName) {
         const { data: byMappedName } = await supabaseServer
            .from('InvestmentPlan')
            .select('*')
            .eq('name', mappedName)
            .maybeSingle()
        if (byMappedName) {
            plan = byMappedName
            plan.slug = planId
            console.log(`[Invest API] Found plan by name: ${mappedName}`)
        }
    }

    // Fallback: built-in defaults if DB lookup fails
    if (!plan) {
        console.log('[Invest API] Plan not found in DB, using fallback defaults')
        const defaultPlans = [
            { slug: 'starter', name: 'Starter Plan', minAmount: 100, maxAmount: 500, minDurationDays: 7, roiMinPct: 10 },
            { slug: 'pro', name: 'Pro Plan', minAmount: 501, maxAmount: 2000, minDurationDays: 14, roiMinPct: 15 },
            { slug: 'elite', name: 'Elite Plan', minAmount: 2001, maxAmount: 100000, minDurationDays: 30, roiMinPct: 25 }
        ]
        const fallback = defaultPlans.find(p => p.slug === planId)
        if (fallback) {
            plan = fallback
            // Attempt to seed this plan into DB to satisfy Foreign Key
            try {
                const newPlanId = crypto.randomUUID ? crypto.randomUUID() : `plan_${Date.now()}`
                const { data: seeded, error: seedErr } = await supabaseServer
                    .from('InvestmentPlan')
                    .insert({
                        id: newPlanId,
                        name: plan.name,
                        minAmount: plan.minAmount,
                        maxAmount: plan.maxAmount,
                        duration: plan.minDurationDays,
                        returnPercentage: plan.roiMinPct,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    })
                    .select()
                    .single()
                
                if (seeded) {
                    plan.id = seeded.id
                    console.log(`[Invest API] Seeded missing plan: ${plan.name} (${plan.id})`)
                } else {
                    console.error('[Invest API] Failed to seed plan:', seedErr)
                    // Try to fetch ID again in case it was created concurrently
                    const { data: existing } = await supabaseServer.from('InvestmentPlan').select('id').eq('name', plan.name).maybeSingle()
                    if (existing) plan.id = existing.id
                }
            } catch (e) {
                console.error('[Invest API] Seeding exception:', e)
            }
        }
    }

    if (!plan) {
         return NextResponse.json({ error: 'plan_not_found' }, { status: 404 })
    }

    // --- 2. VALIDATE AMOUNT ---
    const reqCurrency = String(body?.currency || (user as any).currency || 'USD')
    const userId = String(user.id)
    const amountUSD = convertToUSD(reqAmount, reqCurrency)
    
    const min = Number(plan.minAmount || plan.min_amount || 0)
    const max = Number(plan.maxAmount || plan.max_amount || Infinity)

    if (amountUSD < min || amountUSD > max) {
      return NextResponse.json({ 
        error: 'amount_out_of_range', 
        details: `Amount ${amountUSD.toFixed(2)} USD is out of range [${min}-${max}]` 
      }, { status: 400 })
    }

    // --- 3. CHECK & DEDUCT BALANCE ---
    let walletTable: 'Wallet' | 'wallets' = 'Wallet'
    let wallets: WalletRow[] = []

    const { data: w1, error: wErr1 } = await supabaseServer.from('Wallet').select('id,currency,balance').eq('userId', userId)
    if (!wErr1 && w1) {
      wallets = (w1 as any[]).map((w) => ({ id: String(w.id), currency: String(w.currency || 'USD'), balance: w.balance }))
    } else {
      const { data: w2 } = await supabaseServer.from('wallets').select('id,currency,balance').eq('user_id', userId)
      if (w2) {
        walletTable = 'wallets'
        wallets = (w2 as any[]).map((w) => ({ id: String(w.id), currency: String(w.currency || 'USD'), balance: w.balance }))
      }
    }

    const candidates = wallets
      .map((w) => {
        const bal = Number(w.balance || 0)
        const usdEq = convertToUSD(bal, w.currency)
        return { ...w, bal, usdEq }
      })
      .filter((w) => w.usdEq >= amountUSD - 1e-9)
      .sort((a, b) => {
        const aPref = a.currency === reqCurrency ? 0 : 1
        const bPref = b.currency === reqCurrency ? 0 : 1
        if (aPref !== bPref) return aPref - bPref
        return (a.usdEq - amountUSD) - (b.usdEq - amountUSD)
      })

    const chosen = candidates[0]
    if (!chosen) {
      const totalUsd = wallets.reduce((sum, w) => sum + convertToUSD(Number(w.balance || 0), w.currency), 0)
      return NextResponse.json({ error: 'insufficient_funds', details: `Total balance ≈ ${totalUsd.toFixed(2)} USD` }, { status: 400 })
    }

    const debitAmount = convertFromUSD(amountUSD, chosen.currency)
    const newBalance = chosen.bal - debitAmount
    if (newBalance < -1e-6) {
      return NextResponse.json({ error: 'insufficient_funds' }, { status: 400 })
    }

    const { error: upErr } = await supabaseServer
      .from(walletTable)
      .update({ balance: Math.max(0, newBalance) })
      .eq('id', chosen.id)

    if (upErr) {
      console.error('[Invest API] Failed to deduct balance:', upErr)
      return NextResponse.json({ error: 'balance_update_failed' }, { status: 500 })
    }

    // --- 4. CREATE INVESTMENT ---
    const invId = crypto.randomUUID ? crypto.randomUUID() : `inv_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const durationDays = plan.duration || plan.minDurationDays || 30
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + durationDays)

    // Using 'principal' column as discovered in schema
    let inv: any = null
    try {
      const { data: created, error: invError } = await supabaseServer
        .from('Investment')
        .insert({
          id: invId,
          userId,
          planId: plan.id,
          principal: amountUSD,
          status: 'ACTIVE',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()

      if (invError) throw invError
      inv = created
    } catch (invError: any) {
      try {
        await supabaseServer.from(walletTable).update({ balance: chosen.bal }).eq('id', chosen.id)
      } catch {}
      console.error('[Invest API] Investment Insert Error:', invError)
      return NextResponse.json(
        {
          error: 'investment_persistence_failed',
          details: invError?.message,
          code: invError?.code,
          hint: invError?.hint,
        },
        { status: 500 }
      )
    }

    // --- 5. CREATE TRANSACTION ---
    const trxId = crypto.randomUUID ? crypto.randomUUID() : `trx_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const { error: trxError } = await supabaseServer.from('Transaction').insert({
      id: trxId,
      userId,
      investmentId: invId,
      type: 'TRANSFER',
      amount: amountUSD,
      status: 'COMPLETED',
      currency: 'USD',
      provider: 'investment',
      reference: JSON.stringify({ plan: planId, sourceCurrency: chosen.currency, debited: debitAmount }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    if (trxError) {
        console.error('[Invest API] Transaction Insert Error:', trxError)
    }

    return NextResponse.json({ message: 'Investment activated', investment: inv, newBalance })

  } catch (err: any) {
    console.error('[Invest API] Global Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
