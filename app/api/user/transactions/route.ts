import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '../../../../src/lib/requireRole'
import { supabaseServer } from '../../../../src/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole('USER', req)
  if (error) return NextResponse.json({ error }, { status: error === 'unauthenticated' ? 401 : 403 })
  
  const url = new URL(req.url)
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || '25')))
  const type = String(url.searchParams.get('type') || '')
  
  // Use PascalCase 'Transaction' table
  let query = supabaseServer
      .from('Transaction')
      .select('*', { count: 'exact' })
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

  if (type && type !== 'all') {
      query = query.eq('type', type.toUpperCase())
  }

  const { data: items, count, error: dbError } = await query

  if (dbError) {
      // Fallback to snake_case 'transactions' if PascalCase fails
      const { data: snakeItems, count: snakeCount, error: snakeError } = await supabaseServer
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)
      
      if (snakeError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 })
      }
      
      // Map snake_case to standard
      const mappedSnake = (snakeItems || []).map((t: any) => ({
          id: t.id,
          type: t.type === 'ADMIN_CREDIT' ? 'DEPOSIT' : t.type,
          amount: t.amount,
          status: t.status,
          created_at: t.created_at,
          currency: t.currency
      }))
      return NextResponse.json({ items: mappedSnake, total: snakeCount || 0, page, limit })
  }

  // Map PascalCase to standard
  const mappedItems = (items || []).map((t: any) => ({
      id: t.id,
      type: t.type === 'ADMIN_CREDIT' ? 'DEPOSIT' : t.type,
      amount: t.amount,
      status: t.status,
      created_at: t.createdAt,
      currency: t.currency
  }))

  return NextResponse.json({ items: mappedItems, total: count || 0, page, limit })
}
