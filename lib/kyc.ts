import { supabaseServer } from './supabaseServer';

export type KycStatus = 'approved' | 'pending' | 'rejected' | null;

export async function getKycStatus(userId: string): Promise<KycStatus> {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('kyc_status')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return null;
  return (data?.kyc_status as KycStatus) ?? null;
}
