
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function isMissingRelation(error) {
  const msg = String(error?.message || '')
  return msg.includes('relation') || msg.includes('does not exist') || String(error?.code || '') === '42P01'
}

function isMissingColumn(error) {
  const msg = String(error?.message || '')
  return msg.includes('column') && msg.includes('does not exist')
}

async function selectByUser(table, userId) {
  const res1 = await supabase.from(table).select('*').eq('userId', userId)
  if (!res1.error) return res1
  if (isMissingColumn(res1.error) || String(res1.error?.message || '').includes('userId')) {
    const res2 = await supabase.from(table).select('*').eq('user_id', userId)
    return res2
  }
  return res1
}

// The modified function
async function selectFirstExistingTable(tables, select) {
  let lastError = null
  for (const table of tables) {
    console.log(`Checking table: ${table}...`);
    const res = await select(table)
    if (!res.error) {
       if (Array.isArray(res.data) && res.data.length > 0) {
           console.log(`Found data in ${table}: ${res.data.length} rows`);
           return res
       }
       console.log(`Table ${table} exists but returned empty data.`);
       if (!lastError) lastError = res 
       continue; 
    }
    
    console.log(`Error in ${table}: ${res.error.message}`);
    if (!isMissingRelation(res.error)) return res
  }
  if (lastError && !lastError.error) return lastError
  return { data: null, error: lastError }
}

async function run() {
    const targetUserId = 'b49bb568-c561-4ed7-b1ae-e2e83bb06eb9'; // Use one of the user IDs from previous logs
    console.log(`Testing getUserWallets logic for ${targetUserId}`);

    const res = await selectFirstExistingTable(['Wallet', 'wallets', 'wallet'], (t) => selectByUser(t, targetUserId));
    console.log('Result:', JSON.stringify(res.data, null, 2));
}

run();
