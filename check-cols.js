const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('Checking Transaction columns...');
    const { data: tx, error: txErr } = await supabase
        .from('Transaction')
        .select('*')
        .limit(1);
    
    if (txErr) {
        console.error('Error fetching Transaction:', txErr.message);
    } else if (tx && tx.length > 0) {
        console.log('Transaction columns:', Object.keys(tx[0]));
    } else {
        console.log('Transaction table empty, checking specific columns...');
        const { error: metaErr } = await supabase.from('Transaction').select('metadata').limit(1);
        console.log('Has metadata column?', !metaErr);
        const { error: descErr } = await supabase.from('Transaction').select('description').limit(1);
        console.log('Has description column?', !descErr);
        const { error: invIdErr } = await supabase.from('Transaction').select('investmentId').limit(1);
        console.log('Has investmentId column?', !invIdErr);
        const { error: curErr } = await supabase.from('Transaction').select('currency').limit(1);
        console.log('Has currency column?', !curErr);
        const { error: provErr } = await supabase.from('Transaction').select('provider').limit(1);
        console.log('Has provider column?', !provErr);
    }

    console.log('\nChecking WalletTransaction columns...');
    const { data: wtx, error: wtxErr } = await supabase
        .from('WalletTransaction')
        .select('*')
        .limit(1);

    if (wtxErr) {
        console.error('Error fetching WalletTransaction:', wtxErr.message);
    } else if (wtx && wtx.length > 0) {
        console.log('WalletTransaction columns:', Object.keys(wtx[0]));
    } else {
        console.log('WalletTransaction table empty, checking specific columns...');
        const { error: noteErr } = await supabase.from('WalletTransaction').select('note').limit(1);
        console.log('Has note column?', !noteErr);
        const { error: descErr } = await supabase.from('WalletTransaction').select('description').limit(1);
        console.log('Has description column?', !descErr);
    }
}

checkColumns();
