import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../../src/lib/supabaseServer'

export async function GET() {
  const tables = ['Investment', 'investments', 'User', 'users', 'InvestmentPlan', 'investment_plans', 'Wallet', 'wallets']
  const results: any = {}

  for (const t of tables) {
    const { data, error, count } = await supabaseServer.from(t).select('*', { count: 'exact', head: true })
    results[t] = { 
        exists: !error || error.code !== '42P01', // 42P01 is undefined_table
        error: error?.message, 
        code: error?.code,
        count 
    }
  }

  return NextResponse.json({ results })
}
