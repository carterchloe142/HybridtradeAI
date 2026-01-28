import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '../../../../../src/lib/requireRole'
import { supabaseServer } from '../../../../../src/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  const { user, error } = await requireRole('USER', req)
  if (error) return NextResponse.json({ error }, { status: error === 'unauthenticated' ? 401 : 403 })

  const id = String(ctx?.params?.id || '').trim()
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 })

  const { data: tx, error: dbError } = await supabaseServer
    .from('Transaction')
    .select('*')
    .eq('id', id)
    .eq('userId', user.id)
    .maybeSingle()

  if (!dbError && tx) {
    return NextResponse.json({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      provider: tx.provider,
      reference: tx.reference,
      investmentId: tx.investmentId,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    })
  }

  const { data: tx2, error: dbError2 } = await supabaseServer
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (dbError2 || !tx2) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return NextResponse.json({
    id: tx2.id,
    type: tx2.type,
    amount: tx2.amount,
    currency: tx2.currency,
    status: tx2.status,
    provider: tx2.provider,
    reference: tx2.reference,
    investmentId: tx2.investment_id,
    createdAt: tx2.created_at,
    updatedAt: tx2.updated_at,
  })
}

