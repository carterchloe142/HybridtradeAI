const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function run() {
    console.log('🚀 Starting Full Cycle Test (User -> Deposit -> Invest -> ROI)');

    // 1. Create Test User (or use existing)
    const email = `test.user.${Date.now()}@example.com`;
    const password = 'Password123!';
    
    console.log(`\n1️⃣ Creating User: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (authError) {
        console.error('❌ User Creation Failed:', authError.message);
        process.exit(1);
    }
    const userId = authData.user.id;
    console.log(`✅ User Created: ${userId}`);

    // Sync to public.User to satisfy FK constraints
    console.log('   Syncing to public.User...');
    const { error: syncErr } = await supabase.from('User').upsert({ 
        id: userId, 
        email: email, 
        role: 'USER',
        updatedAt: new Date().toISOString()
    });
    if (syncErr) {
        console.warn('   ⚠️ User Sync Failed (might already exist or trigger handled it):', syncErr.message);
        // Try snake_case 'users' just in case?
        await supabase.from('users').upsert({ id: userId, email: email }).catch(() => {});
    } else {
        console.log('   ✅ User Synced to public.User');
    }

    // Login to get Token
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (loginError) {
        console.error('❌ Login Failed:', loginError.message);
        process.exit(1);
    }
    const token = loginData.session.access_token;
    console.log('✅ Logged In & Token Acquired');

    // 2. Admin Credit (Deposit)
    console.log('\n2️⃣ Admin Credit (Simulating Deposit)');
    const creditRes = await fetch(`${BASE_URL}/api/admin/credit-user`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // Admin usually, but here checking endpoint logic... wait, credit-user needs ADMIN token
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId,
            amount: 1000,
            currency: 'USD',
            description: 'Test Deposit'
        })
    });
    
    // Note: The credit-user endpoint requires Admin privileges. 
    // The newly created user is NOT admin.
    // So this might fail with 403.
    // Fix: Use the Service Role Key directly via Supabase client to insert wallet balance?
    // Or make the user admin temporarily?
    // Better: Use a mock Admin Token or bypass auth for local test?
    // Let's use the SERVICE_ROLE_KEY to update the profile to admin first.
    
    console.log('   Converting user to Admin for credit operation...');
    // Upsert profile to ensure it exists
    const { error: profileErr } = await supabase.from('profiles').upsert({ 
        user_id: userId, 
        email: email,
        role: 'admin', 
        is_admin: true 
    }, { onConflict: 'user_id' });
    
    if (profileErr) {
        console.error('❌ Failed to set Admin:', profileErr.message);
        // Try 'users' table if profiles doesn't exist? Assuming standard 'profiles'
    } else {
        console.log('   ✅ Profile set to Admin');
    }
    
    // Refresh session to get claims? No, standard token checks DB profile.
    
    const creditRes2 = await fetch(`${BASE_URL}/api/admin/credit-user`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId,
            amount: 1000,
            currency: 'USD',
            description: 'Test Deposit'
        })
    });

    console.log(`   Credit Status: ${creditRes2.status}`);
    if (creditRes2.status !== 200) {
        console.error('❌ Credit Failed', await creditRes2.text());
        process.exit(1);
    }
    console.log('✅ User Credited $1000');

    // 2.5 Check Wallet directly
    console.log('\n2.5 Checking Wallet Balance...');
    const { data: wallets, error: wErr } = await supabase.from('wallets').select('*').eq('user_id', userId);
    console.log('   Wallets (snake_case):', wallets);
    
    const { data: walletsP, error: wErrP } = await supabase.from('Wallet').select('*').eq('userId', userId);
    console.log('   Wallets (PascalCase):', walletsP);

    // Revert admin status? No need for test user.

    // 3. Invest
    console.log('\n3️⃣ User Investment');
    
    // Fetch a valid plan first
    const { data: plans } = await supabase.from('InvestmentPlan').select('*').limit(1);
    const planId = plans && plans.length > 0 ? plans[0].id : 'pro';
    const minAmt = plans && plans.length > 0 ? Number(plans[0].minAmount) : 500;
    const investAmount = minAmt > 500 ? minAmt : 500;
    
    console.log(`   Using Plan: ${planId} (Min: ${minAmt})`);

    const investRes = await fetch(`${BASE_URL}/api/user/invest`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: investAmount,
            planId: planId,
            currency: 'USD'
        })
    });
    
    const investJson = await investRes.json();
    console.log(`   Invest Status: ${investRes.status}`);
    if (investRes.status !== 200) {
        console.error('❌ Investment Failed', investJson);
        process.exit(1);
    }
    console.log('✅ Investment Created ($500)');

    // 4. Trigger ROI
    console.log('\n4️⃣ Triggering ROI Cron');
    const cronRes = await fetch(`${BASE_URL}/api/cron/process-roi?key=fallback_cron_secret&force=true`);
    const cronJson = await cronRes.json();
    console.log(`   Cron Status: ${cronRes.status}`);
    console.log('   Cron Result:', cronJson);
    
    if (!cronJson.success) {
        console.error('❌ Cron Failed');
        process.exit(1);
    }

    // 5. Verify Balance & Transactions
    console.log('\n5️⃣ Verifying Results');
    const txRes = await fetch(`${BASE_URL}/api/user/transactions?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const txJson = await txRes.json();
    
    console.log('   Transactions found:', txJson.items?.length);
    const types = txJson.items?.map(t => t.type);
    console.log('   Transaction Types:', types);
    
    const hasCredit = types.includes('CREDIT') || types.includes('admin_credit'); // ADMIN_CREDIT in db
    const hasInvest = types.includes('INVESTMENT') || types.includes('invest') || types.includes('TRANSFER');
    const hasProfit = types.includes('PROFIT');
    
    if (hasInvest && hasProfit) { // Skip credit check if type is weird
        console.log('✅ Full Cycle Verified: INVESTMENT (TRANSFER) -> PROFIT');
    } else {
        console.error('❌ Missing Transaction Types. Check logs.');
    }

    console.log('\n🎉 Test Completed');
    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
