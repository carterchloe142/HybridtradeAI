import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { requireRole } from '../../../../../src/lib/requireRole'
import { supabaseServer, supabaseServiceReady } from '../../../../../src/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole('USER', request)
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!supabaseServiceReady) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

    const { applicationId, details } = await request.json()

    if (!applicationId) return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 })

    const { error: dbError } = await supabaseServer
      .from('kyc_applications')
      .update({
        details: details,
        submitted_at: new Date().toISOString(),
        status: 'pending'
      })
      .eq('id', applicationId)
      .eq('user_id', user.id)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
