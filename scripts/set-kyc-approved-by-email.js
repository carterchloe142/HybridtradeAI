require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const email = (process.argv[2] || '').trim();
  if (!email) {
    console.error('Usage: node scripts/set-kyc-approved-by-email.js <email>');
    process.exit(1);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('Invalid email:', email);
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials (SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const now = new Date().toISOString();

  // Resolve user id by email (User or users)
  let userId = null;
  try {
    const { data: u1, error: e1 } = await supabase.from('User').select('id').eq('email', email).maybeSingle();
    if (!e1 && u1?.id) {
      userId = String(u1.id);
    } else {
      const { data: u2, error: e2 } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
      if (!e2 && u2?.id) {
        userId = String(u2.id);
      }
    }
  } catch (err) {
    console.error('Error resolving user:', err?.message || err);
  }
  if (!userId) {
    console.error('Unable to resolve user ID for email:', email);
    process.exit(1);
  }

  console.log('Resolved userId:', userId);

  // Update profiles (snake_case)
  try {
    const { data: prof } = await supabase.from('profiles').select('user_id').eq('user_id', userId).maybeSingle();
    if (prof) {
      const { error: upErr } = await supabase
        .from('profiles')
        .update({ kyc_status: 'approved', kyc_level: 1, kyc_decision_at: now })
        .eq('user_id', userId);
      if (upErr) throw upErr;
      console.log('Updated profiles: approved');
    } else {
      // Create profile if missing
      const { error: insErr } = await supabase
        .from('profiles')
        .insert({ user_id: userId, email, kyc_status: 'approved', kyc_level: 1, kyc_decision_at: now });
      if (insErr) throw insErr;
      console.log('Inserted profiles: approved');
    }
  } catch (err) {
    console.error('profiles update error:', err?.message || err);
  }

  // Update User (PascalCase)
  try {
    const { error: uErr } = await supabase
      .from('User')
      .update({ kycStatus: 'VERIFIED', kycLevel: 1, kycDecisionAt: now, updatedAt: now })
      .eq('id', userId);
    if (uErr) {
      // Fallback to lowercase users
      const { error: u2Err } = await supabase
        .from('users')
        .update({ kyc_status: 'VERIFIED', kyc_level: 1, kyc_decision_at: now, updated_at: now })
        .eq('id', userId);
      if (u2Err) throw u2Err;
    }
    console.log('Updated user table to VERIFIED');
  } catch (err) {
    console.error('User update error:', err?.message || err);
  }

  // Update latest kyc_applications to approved (if exists)
  try {
    const { data: app } = await supabase
      .from('kyc_applications')
      .select('id,status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (app?.id) {
      const { error: appErr } = await supabase
        .from('kyc_applications')
        .update({ status: 'approved', decided_at: now })
        .eq('id', app.id);
      if (appErr) throw appErr;
      console.log('Updated latest kyc_application to approved');
    } else {
      console.log('No kyc_application found; skipping application update');
    }
  } catch (err) {
    console.error('kyc_applications update error:', err?.message || err);
  }

  // Insert Notification
  try {
    const { error: nErr } = await supabase.from('Notification').insert({
      userId,
      type: 'kyc_status',
      title: 'KYC Verified',
      message: 'Your KYC documents have been approved. You are now verified.',
      link: '/kyc',
      read: false,
      createdAt: now,
    });
    if (nErr) {
      // Fallback to snake_case notifications
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'kyc_status',
        title: 'KYC Verified',
        message: 'Your KYC documents have been approved. You are now verified.',
        link: '/kyc',
        read: false,
        created_at: now,
      });
    }
    console.log('Inserted kyc_status notification');
  } catch (err) {
    console.error('Notification insert error:', err?.message || err);
  }

  console.log('Done. The dashboard should show green verified shortly.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
