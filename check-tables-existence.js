
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('CWD:', process.cwd());
const envLocalPath = path.resolve(process.cwd(), '.env.local');
console.log('.env.local path:', envLocalPath);
console.log('Exists:', fs.existsSync(envLocalPath));

// Try loading .env.local first, then .env
if (fs.existsSync(envLocalPath)) {
  const result = dotenv.config({ path: envLocalPath });
  if (result.error) {
    console.log('Error loading .env.local:', result.error);
  }
} else {
  dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env or .env.local');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_KEY (masked):', supabaseKey ? '********' : 'undefined');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('*').limit(1);
  if (error) {
    if (error.code === '42P01' || error.message.includes('does not exist')) {
      return 'MISSING';
    }
    return `ERROR: ${error.message}`;
  }
  return 'EXISTS';
}

async function run() {
  const tables = [
    'Setting', 'settings',
    'Performance', 'performance',
    'Investment', 'investments',
    'InvestmentPlan', 'investment_plans',
    'Transaction', 'transactions',
    'User', 'users'
  ];

  console.log('Checking tables...');
  for (const t of tables) {
    const status = await checkTable(t);
    console.log(`${t}: ${status}`);
  }
}

run();
