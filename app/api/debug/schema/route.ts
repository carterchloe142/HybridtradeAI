import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../../src/lib/supabaseServer'

export async function GET() {
  const possibleColumns = [
    'id', 'Id', 'ID',
    'slug', 'name',
    'minAmount'
  ]
  
  const results: any = {}
  
  // Check InvestmentPlan
  results['InvestmentPlan'] = {}
  for (const col of possibleColumns) {
    const { error } = await supabaseServer
        .from('InvestmentPlan')
        .select(col)
        .limit(1)
    results['InvestmentPlan'][col] = error ? error.message : 'exists'
  }
  
  return NextResponse.json({ results })
}
