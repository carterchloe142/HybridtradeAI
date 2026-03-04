
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
// Load .env.local first (overrides .env)
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

console.log('Test Script connecting to:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
// Create a separate client for verification that stays as Service Role
const supabaseRoot = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

function log(msg) {
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

  // Ensure public.User record exists (needed for FKs)
  log(`Ensuring public.User record for ${targetUserId}`);
  const { error: publicUserErr } = await supabase.from('User').upsert({
      id: targetUserId,
      email: userEmail,
      name: 'Test User',
      role: 'USER',
      kycStatus: 'VERIFIED',
      updatedAt: new Date().toISOString()
  });
  
  if (publicUserErr) {
      log('Error creating public.User: ' + JSON.stringify(publicUserErr));
      // Fallback to 'users' if exists? No, User is Pascal.
  }

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
  
  // Use global fetch (Node 18+)
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

  // Wait for DB propagation
  log('Waiting 2s for DB propagation...');
  await new Promise(r => setTimeout(r, 2000));

  // 5. Verify Balance in DB
  log('Verifying Wallet Balance...');
  let { data: wallet } = await supabaseRoot.from('Wallet').select('balance').eq('userId', targetUserId).maybeSingle();
  if (!wallet) {
      const { data: w2 } = await supabaseRoot.from('wallets').select('balance').eq('user_id', targetUserId).maybeSingle();
      if (w2) wallet = w2;
  }

  // Try direct insert to verify permissions/table
  log('Attempting direct insert into Transaction...');
  const directTxId = '11111111-1111-1111-1111-111111111111'; // Dummy UUID
  const { error: insErr } = await supabaseRoot.from('Transaction').insert({
      id: directTxId,
      userId: targetUserId,
      type: 'DEPOSIT',
      amount: 1,
      currency: 'USD',
      status: 'COMPLETED',
      updatedAt: new Date().toISOString()
  });
  if (insErr) log('Direct Insert Error: ' + JSON.stringify(insErr));
  else log('Direct Insert Success');

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
  
  // Try selecting specific columns
  const { data: allTx1, error: selErr } = await supabaseRoot.from('Transaction').select('id, userId, type, amount');
  
  if (selErr) log('Select Error: ' + JSON.stringify(selErr));
  log(`Found ${allTx1?.length} tx in Transaction table`);
  if (allTx1 && allTx1.length > 0) log('Sample: ' + JSON.stringify(allTx1[0]));

  const { data: txList, error: txErr } = await supabaseRoot.from('Transaction').select('type, status').eq('userId', targetUserId);
  
  if (txErr) log('Tx Query Error: ' + JSON.stringify(txErr));
  
  const tx = txList && txList.length > 0 ? txList[0] : null;

  if (!tx) {
      throw new Error('Transaction not found');
  }

  log(`Transaction Type: ${tx.type}, Status: ${tx.status}`);
  if (tx.type === 'DEPOSIT' && tx.status === 'COMPLETED') {
      log('✅ SUCCESS: Transaction logged as DEPOSIT.');
  } else {
      log(`❌ FAILURE: Expected DEPOSIT/COMPLETED, got ${tx.type}/${tx.status}`);
  }
}

main().catch(e => {
    log('Test Error: ' + e);
    process.exit(1);
});
