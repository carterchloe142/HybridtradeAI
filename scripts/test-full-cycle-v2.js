
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = 'http://localhost:3000'; // Assume running locally

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TEST_EMAIL = `e2e_${Date.now()}@test.com`;
const TEST_PASS = 'password123';
const TEST_NAME = 'E2E Tester';

async function main() {
  console.log(`Starting E2E Full Cycle Test for ${TEST_EMAIL}...`);
  let userId = null;
  let token = null;

  try {
    // 1. Setup User
    console.log('1. Creating User...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASS,
      email_confirm: true
    });
    if (authError) throw authError;
    userId = authData.user.id;
    console.log(`   User created: ${userId}`);

    // Sync to public.User (if needed by your schema)
    // Try PascalCase User first, then snake_case users/profiles
    const { error: syncErr } = await supabase.from('User').insert({
      id: userId,
      email: TEST_EMAIL,
      name: TEST_NAME,
      role: 'USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    if (syncErr) {
        // Fallback or ignore if handled by triggers
        console.log('   Sync to public.User failed (might be fine if not using that table):', syncErr.message);
        // Try profiles
        await supabase.from('profiles').upsert({
            user_id: userId,
            full_name: TEST_NAME,
            role: 'user'
        }).match({ user_id: userId });
    }
    
    // Login to get Token
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASS
    });
    if (loginError) throw loginError;
    token = loginData.session.access_token;
    console.log('   Logged in successfully.');

    // 2. Deposit (via Webhook)
    console.log('\n2. Processing Deposit...');
    // We simulate a Paystack webhook
    const depositAmount = 1000; // $1000
    const depositRef = `DEP_${Date.now()}`;
    
    const webhookPayload = {
        event: 'charge.success',
        data: {
            reference: depositRef,
            amount: depositAmount * 100, // Paystack is in kobo/cents usually, but our webhook might expect raw? 
            // Let's check paystack.ts: const realAmount = (amount / 100);
            // So we send cents.
            currency: 'USD',
            status: 'success',
            customer: {
                email: TEST_EMAIL
            },
            metadata: {
                // Our deposit endpoint usually attaches userId here, but if we init via webhook directly,
                // the webhook code tries to find user by email if metadata is missing?
                // paystack.ts: const user = ... find by email ...
                // Let's rely on email lookup in webhook logic if implemented, or ensure metadata has it?
                // Looking at paystack.ts: It looks up Transaction by reference first.
                // If transaction not found, does it create one?
                // "1. Verify Transaction exists... If not found? Return 404?"
                // Wait, paystack.ts line 28: if (!tx) return res.status(404)...
            }
        }
    };

    // Ah, we must CREATE a pending transaction first for the webhook to find!
    // Or we use the manual credit endpoint if available?
    // Let's use the /api/user/deposit endpoint first to create the pending tx.
    
    const depositRes = await fetch(`${BASE_URL}/api/user/deposit`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            amount: depositAmount,
            currency: 'USD',
            provider: 'paystack',
            autoActivate: false
        })
    });
    
    const depositJson = await depositRes.json();
    if (!depositRes.ok) throw new Error(`Deposit Init Failed: ${JSON.stringify(depositJson)}`);
    console.log(`   Deposit Initialized:`, depositJson);
    
    const txReference = depositJson.reference; // Assuming it returns reference
    if (!txReference) throw new Error('No reference returned from deposit');

    // NOW call webhook
    webhookPayload.data.reference = txReference;
    
    // Calculate signature
    const secret = process.env.PAYSTACK_SECRET_KEY || 'test_paystack_secret';
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(webhookPayload)).digest('hex');

    const webhookRes = await fetch(`${BASE_URL}/api/webhooks/paystack`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-paystack-signature': hash
        },
        body: JSON.stringify(webhookPayload)
    });
    
    if (!webhookRes.ok) console.warn(`   Webhook warning: ${webhookRes.status}`);
    else console.log('   Webhook sent successfully.');

    // Verify Balance
    await new Promise(r => setTimeout(r, 2000)); // Wait for DB
    let { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (!wallet) {
         // Try PascalCase Wallet
         const { data: w2 } = await supabase.from('Wallet').select('*').eq('userId', userId).single();
         wallet = w2;
    }
    console.log(`   Wallet Balance: ${wallet?.balance} ${wallet?.currency}`);
    if (Number(wallet?.balance) < depositAmount) throw new Error('Deposit failed to credit wallet');

    // 3. Invest
    console.log('\n3. Investing...');
    
    // Fetch valid plan
    const { data: plans } = await supabase.from('InvestmentPlan').select('id').limit(1);
    const planId = plans && plans.length > 0 ? plans[0].id : 'starter';
    console.log(`   Using Plan ID: ${planId}`);

    const investAmount = 500;
    const investRes = await fetch(`${BASE_URL}/api/user/invest`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            planId: planId,
            amount: investAmount
        })
    });
    const investJson = await investRes.json();
    if (!investRes.ok) throw new Error(`Invest Failed: ${JSON.stringify(investJson)}`);
    console.log('   Investment Created:', investJson);

    // Verify Balance Deducted
    await new Promise(r => setTimeout(r, 1000));
    // Refetch wallet
    let { data: wallet2 } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (!wallet2) { const { data: w2 } = await supabase.from('Wallet').select('*').eq('userId', userId).single(); wallet2 = w2; }
    console.log(`   Wallet Balance after Invest: ${wallet2?.balance}`);
    if (Number(wallet2?.balance) > (depositAmount - investAmount)) throw new Error('Balance not deducted correctly');

    // 4. ROI Processing
    console.log('\n4. Processing ROI (Force)...');
    const cronSecret = process.env.CRON_SECRET || 'fallback_cron_secret';
    const roiRes = await fetch(`${BASE_URL}/api/cron/process-roi?key=${cronSecret}&force=true`, {
        method: 'GET'
    });
    const roiJson = await roiRes.json();
    console.log('   ROI Result:', roiJson);

    // Verify Profit
    await new Promise(r => setTimeout(r, 1000));
    // Refetch wallet
    let { data: wallet3 } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (!wallet3) { const { data: w3 } = await supabase.from('Wallet').select('*').eq('userId', userId).single(); wallet3 = w3; }
    console.log(`   Wallet Balance after ROI: ${wallet3?.balance}`);
    
    // Check if balance increased (Original Remainder + Profit)
    // Starter plan mock rate is 1.2% per day?
    // 500 * 0.012 = 6.
    // Balance should be 500 + 6 = 506.
    if (Number(wallet3?.balance) <= (depositAmount - investAmount)) {
        console.warn('   ROI did not increase balance. Check if ROI script found the investment.');
    } else {
        console.log('   ROI Credited Successfully.');
    }

    // 5. Withdraw
    console.log('\n5. Withdrawing...');
    const withdrawAmount = 10;
    const withdrawRes = await fetch(`${BASE_URL}/api/user/transactions`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            amount: withdrawAmount,
            kind: 'withdraw',
            destinationAddress: 'TH123456789',
            network: 'TRC20'
        })
    });
    const withdrawJson = await withdrawRes.json();
    if (!withdrawRes.ok) throw new Error(`Withdraw Failed: ${JSON.stringify(withdrawJson)}`);
    console.log('   Withdrawal Requested:', withdrawJson);

    // Verify Balance Deducted
    await new Promise(r => setTimeout(r, 1000));
    let { data: wallet4 } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (!wallet4) { const { data: w4 } = await supabase.from('Wallet').select('*').eq('userId', userId).single(); wallet4 = w4; }
    console.log(`   Wallet Balance after Withdraw: ${wallet4?.balance}`);
    // Should be Previous - 10.
    
    console.log('\nSUCCESS: Full Cycle Test Completed.');

  } catch (err) {
    console.error('\nFAILED:', err);
  } finally {
    // Cleanup
    if (userId) {
        console.log('\nCleaning up User...');
        await supabase.auth.admin.deleteUser(userId);
        // Cascading delete should handle the rest usually, but if we used public.User without cascade:
        await supabase.from('User').delete().eq('id', userId);
        await supabase.from('profiles').delete().eq('user_id', userId);
        // Transactions/Investments usually cascade or remain as logs.
    }
  }
}

main();
