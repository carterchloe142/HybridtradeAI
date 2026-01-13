const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const baseUrl = 'http://localhost:3000';

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
  console.error('Missing Supabase credentials (URL, ANON_KEY, or SERVICE_ROLE_KEY) in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function runTest() {
  console.log('--- Starting Investment Flow Test ---');

  // 1. Create/Login User
  const rnd = Math.floor(Math.random() * 100000);
  const email = `testuser${rnd}@gmail.com`;
  const password = 'Password123!';
  console.log(`1. Creating user: ${email}`);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Signup failed:', authError.message);
    process.exit(1);
  }

  let token = authData.session?.access_token;
  let userId = authData.user?.id;

  if (!token && userId) {
    console.log('No session returned. User created but requires confirmation.');
    console.log('Auto-confirming email via Admin...');
    
    const { error: confirmErr } = await supabaseAdmin.auth.admin.updateUserById(
        userId, 
        { email_confirm: true }
    );
    
    if (confirmErr) {
        console.error('Failed to auto-confirm user:', confirmErr.message);
        process.exit(1);
    }
    console.log('User confirmed. Signing in...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (signInError || !signInData.session) {
        console.error('Login failed after confirmation:', signInError?.message);
        process.exit(1);
    }
    token = signInData.session.access_token;
  } else if (!token) {
     console.error('Signup returned no session and no user ID??');
     process.exit(1);
  }
  
  const sessionToken = token;

  console.log('User logged in. Token obtained.');

  // 2. Sync User (mimic frontend behavior)
  console.log('2. Syncing user...');
  const syncRes = await fetch(`${baseUrl}/api/auth/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: { user: { id: userId, email } } })
  });
  console.log('Sync status:', syncRes.status);

  // 2b. Auto-verify KYC (using Admin)
  console.log('2b. Auto-verifying KYC for test user...');
  const { error: kycErr1 } = await supabaseAdmin.from('User').update({ kycStatus: 'VERIFIED' }).eq('id', userId);
  const { error: kycErr2 } = await supabaseAdmin.from('profiles').update({ kyc_status: 'verified', kyc_level: 2 }).eq('user_id', userId);
  
  if (kycErr1 && kycErr2) {
      console.warn('KYC Update failed on both tables:', kycErr1, kycErr2);
      // Try insert if update failed (maybe sync didn't finish?)
  } else {
      console.log('KYC Verified.');
  }

  // 3. Deposit Funds (Simulation)
  console.log('3. Depositing $1000 (Simulation)...');
  const depositRes = await fetch(`${baseUrl}/api/user/deposit`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
        amount: 1000,
        currency: 'USD',
        planId: 'starter', // Just for validation
        provider: 'simulation'
    })
  });
  const depositJson = await depositRes.json();
  console.log('Deposit result:', depositJson);
  
  if (!depositRes.ok) {
      console.error('Deposit failed. Cannot proceed.');
      process.exit(1);
  }

  // 4. Test Invalid Investment (Too Low for Starter - Min $100)
  console.log('4. Testing Invalid Investment (Too Low: $50)...');
  const investLowRes = await fetch(`${baseUrl}/api/user/invest`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
        amount: 50,
        planId: 'starter',
        currency: 'USD'
    })
  });
  const investLowJson = await investLowRes.json();
  console.log('Invest Low Result (Expected Error):', investLowJson);
  if (investLowRes.status !== 400) console.error('FAILED: Should have returned 400');
  else console.log('PASSED: Correctly rejected low amount.');

  // 5. Test Invalid Investment (Too High for Starter - Max $500)
  console.log('5. Testing Invalid Investment (Too High: $600)...');
  const investHighRes = await fetch(`${baseUrl}/api/user/invest`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
        amount: 600,
        planId: 'starter',
        currency: 'USD'
    })
  });
  const investHighJson = await investHighRes.json();
  console.log('Invest High Result (Expected Error):', investHighJson);
  if (investHighRes.status !== 400) console.error('FAILED: Should have returned 400');
  else console.log('PASSED: Correctly rejected high amount.');

  // 6. Test Valid Investment ($200)
  console.log('6. Testing Valid Investment ($200)...');
  const investValidRes = await fetch(`${baseUrl}/api/user/invest`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
        amount: 200,
        planId: 'starter',
        currency: 'USD'
    })
  });
  const investValidJson = await investValidRes.json();
  console.log('Invest Valid Result:', investValidJson);
  
  if (investValidRes.ok) {
      console.log('PASSED: Investment successful.');
  } else {
      console.error('FAILED: Investment failed.', investValidJson);
  }

  console.log('--- Test Complete ---');
}

runTest();
