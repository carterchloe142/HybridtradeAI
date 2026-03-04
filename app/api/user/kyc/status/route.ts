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
    
    const appStatus = String(data?.status || '').toLowerCase()
    const appLevel = data?.level || 1
    const appReject = data?.reject_reason
    const appSubmitted = data?.submitted_at
    if (appStatus === 'approved' || appStatus === 'verified') {
      return NextResponse.json({ status: appStatus, level: appLevel, rejectReason: appReject, submittedAt: appSubmitted })
    }
    
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('kyc_status, kyc_level, kyc_submitted_at, kyc_reject_reason')
      .eq('user_id', user.id)
      .maybeSingle()
    const pStatus = String((profile as any)?.kyc_status || '').toLowerCase()
    const pLevel = (profile as any)?.kyc_level || appLevel || 1
    const pSubmitted = (profile as any)?.kyc_submitted_at || appSubmitted
    const pReject = (profile as any)?.kyc_reject_reason || appReject
    if (pStatus === 'approved' || pStatus === 'verified') {
      return NextResponse.json({ status: pStatus, level: pLevel, rejectReason: pReject, submittedAt: pSubmitted })
    }
    
    const { data: u } = await supabaseServer
      .from('User')
      .select('kycStatus, kycLevel, kycSubmittedAt, kycRejectReason')
      .eq('id', user.id)
      .maybeSingle()
    const uStatusRaw = String((u as any)?.kycStatus || '').toUpperCase()
    const uStatus = uStatusRaw === 'VERIFIED' ? 'verified' : uStatusRaw === 'REJECTED' ? 'rejected' : uStatusRaw === 'PENDING' ? 'pending' : ''
    const uLevel = (u as any)?.kycLevel || pLevel || appLevel || 1
    const uSubmitted = (u as any)?.kycSubmittedAt || pSubmitted || appSubmitted
    const uReject = (u as any)?.kycRejectReason || pReject || appReject
    return NextResponse.json({ status: uStatus || appStatus || 'not_applied', level: uLevel, rejectReason: uReject, submittedAt: uSubmitted })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
