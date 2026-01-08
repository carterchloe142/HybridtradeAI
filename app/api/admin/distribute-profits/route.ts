export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApp } from '@/lib/adminAuth';
import { runProfitDistributionCycle } from '@/src/lib/admin/cycle-runner';
const STAGE_0_DISABLE = true;

export async function POST(req: NextRequest) {
  if (STAGE_0_DISABLE) return NextResponse.json({ error: 'disabled' }, { status: 503 })
  const admin = await requireAdminApp(req);
  if (!admin.ok) return NextResponse.json({ error: admin.error || 'Unauthorized' }, { status: 401 });

  try {
    const result = await runProfitDistributionCycle();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Profit distribution failed:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
