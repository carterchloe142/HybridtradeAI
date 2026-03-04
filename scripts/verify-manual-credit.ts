
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Polyfill fetch for older Node versions if needed, though Node 18+ has it.
// If fetch is not defined, we might need to install node-fetch, but let's try without first.

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

import fs from 'fs';

function log(msg: string) {
  console.log(msg);
  fs.appendFileSync('verify-credit.log', msg + '\n');
}

async function main() {
  fs.writeFileSync('verify-credit.log', '--- Starting Manual Credit Test ---\n');
  log('--- Starting Manual Credit Test ---');

  // 1. Create Temp Admin
  const adminEmail = `admin_${Date.now()}@test.com`;
  const password = 'Password123!';
  
  log(`Creating Admin: ${adminEmail}`);
  const { data: adminAuth, error: adminErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: password,
    email_confirm: true
  });

  if (adminErr) throw adminErr;
  const adminId = adminAuth.user.id;

  // Set role to admin
  // Try 'profiles' table (snake_case seems to be the standard for profiles based on other files)
  const { error: profileErr } = await supabase.from('profiles').upsert({
    user_id: adminId,
    role: 'admin',
    is_admin: true,
    email: adminEmail
  });
  
  if (profileErr) {
      log('Profile upsert failed: ' + profileErr.message);
  }

  // 2. Create Target User
  const userEmail = `user_${Date.now()}@test.com`;
  log(`Creating Target User: ${userEmail}`);
  const { data: userAuth, error: userErr } = await supabase.auth.admin.createUser({
    email: userEmail,
    password: password,
    email_confirm: true
  });

  if (userErr) throw userErr;
  const targetUserId = userAuth.user.id;

  // 3. Login as Admin to get Token
  log('Logging in as Admin...');
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: password
  });

  if (signInErr) throw signInErr;
  const token = signInData.session.access_token;

  // 4. Call API
  const amount = 500;
  log(`Crediting ${amount} USD to ${targetUserId}...`);
  
  const response = await fetch('http://localhost:3000/api/admin/credit-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      userId: targetUserId,
      amount: amount,
      currency: 'USD',
      description: 'Test Manual Credit'
    })
  });

  const result = await response.json();
  log('API Response: ' + JSON.stringify(result));

  if (!response.ok) {
    throw new Error(`API failed: ${JSON.stringify(result)}`);
  }

  // 5. Verify Balance in DB
  log('Verifying Wallet Balance...');
  // Check 'Wallet' (Pascal)
  let { data: wallet } = await supabase.from('Wallet').select('balance').eq('userId', targetUserId).maybeSingle();
  if (!wallet) {
      // Check 'wallets' (snake)
      const { data: w2 } = await supabase.from('wallets').select('balance').eq('user_id', targetUserId).maybeSingle();
      if (w2) wallet = w2;
  }

  if (!wallet) {
      throw new Error('Wallet not found for user');
  }

  log(`Wallet Balance: ${wallet.balance}`);
  
  if (Number(wallet.balance) === amount) {
      log('✅ SUCCESS: Balance matches credit amount.');
  } else {
      log(`❌ FAILURE: Expected ${amount}, got ${wallet.balance}`);
  }

  // 6. Verify Transaction Type
  log('Verifying Transaction Log...');
  let { data: tx } = await supabase.from('Transaction').select('type, status').eq('userId', targetUserId).maybeSingle();
  if (!tx) {
      const { data: t2 } = await supabase.from('transactions').select('type, status').eq('user_id', targetUserId).maybeSingle();
      if (t2) tx = t2;
  }

  if (!tx) {
      throw new Error('Transaction not found');
  }

  log(`Transaction Type: ${tx.type}, Status: ${tx.status}`);
  if (tx.type === 'DEPOSIT' && tx.status === 'COMPLETED') {
      log('✅ SUCCESS: Transaction logged as DEPOSIT.');
  } else {
      log(`❌ FAILURE: Expected DEPOSIT/COMPLETED, got ${tx.type}/${tx.status}`);
  }

  // Cleanup (Optional)
  // await supabase.auth.admin.deleteUser(adminId);
  // await supabase.auth.admin.deleteUser(targetUserId);
}

main().catch(e => {
    log('Test Error: ' + e);
    process.exit(1);
});
