require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking tables...');

  const tables = ['User', 'users', 'Wallet', 'wallets', 'Investment', 'investments', 'Transaction', 'transactions', 'InvestmentPlan'];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${table}': Error - ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': Exists (Rows: ${data.length})`);
      if (data.length > 0) console.log(data[0]);
    }
  }
}

checkTables();
