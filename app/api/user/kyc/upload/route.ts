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

    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON body. Payload too large?' }, { status: 400 });
    }

    // Body contains: idFileDataUrl, selfieNeutralDataUrl, etc. and payload

    const files = {
        id_front: body.idFileDataUrl,
        selfie_neutral: body.selfieNeutralDataUrl,
        selfie_smile: body.selfieSmileDataUrl,
        selfie_left: body.selfieLeftDataUrl,
        selfie_right: body.selfieRightDataUrl
    }

    // Create a new application record
    const { data, error: dbError } = await supabaseServer
      .from('kyc_applications')
      .insert({
        user_id: user.id,
        status: 'pending', 
        files: files,
        details: body.payload || {} 
      })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ 
        applicationId: data.id,
        files: files
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
