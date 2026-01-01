import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../../src/lib/supabaseServer'
import crypto from 'crypto'

export async function GET() {
  const defaultPlans = [
    {
      slug: 'starter',
      name: 'Starter Plan',
      minAmount: 100,
      maxAmount: 500,
      minDurationDays: 7,
      maxDurationDays: 30,
      roiMinPct: 10,
      roiMaxPct: 20,
    },
    {
      slug: 'pro',
      name: 'Pro Plan',
      minAmount: 501,
      maxAmount: 2000,
      minDurationDays: 14,
      maxDurationDays: 60,
      roiMinPct: 15,
      roiMaxPct: 30,
    },
    {
      slug: 'elite',
      name: 'Elite Plan',
      minAmount: 2001,
      maxAmount: 100000,
      minDurationDays: 30,
      maxDurationDays: 90,
      roiMinPct: 25,
      roiMaxPct: 45,
    }
  ]

  const results = []

  for (const plan of defaultPlans) {
    // Check existence by NAME since slug is missing
    const { data: existing } = await supabaseServer
        .from('InvestmentPlan')
        .select('*')
        .eq('name', plan.name)
        .maybeSingle()

    if (existing) {
        results.push({ slug: plan.slug, status: 'exists', id: existing.id, existing })
    } else {
        const id = crypto.randomUUID()
        const { data, error } = await supabaseServer
            .from('InvestmentPlan')
            .insert({
                id,
                // slug: plan.slug, // Missing column
                name: plan.name,
                minAmount: plan.minAmount, 
                maxAmount: plan.maxAmount,
                // Map to existing DB schema columns
                duration: plan.minDurationDays, // Use min duration as the value
                returnPercentage: plan.roiMinPct, // Use min ROI as the value
                // payoutFrequency: 'WEEKLY', // Use default
                // isActive: true, // Use default
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select()
            .single()
        
        results.push({ slug: plan.slug, status: error ? 'error' : 'created', error, data })
    }
  }

  return NextResponse.json({ results })
}
