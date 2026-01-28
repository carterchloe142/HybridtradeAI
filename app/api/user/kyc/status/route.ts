import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { requireRole } from '../../../../../src/lib/requireRole'
import { supabaseServer, supabaseServiceReady } from '../../../../../src/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireRole('USER', request)
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!supabaseServiceReady) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

    const { data, error: dbError } = await supabaseServer
      .from('kyc_applications')
      .select('status, level, reject_reason, submitted_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (dbError) throw dbError

    return NextResponse.json({
      status: data?.status || 'not_applied',
      level: data?.level || 1,
      rejectReason: data?.reject_reason,
      submittedAt: data?.submitted_at
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
