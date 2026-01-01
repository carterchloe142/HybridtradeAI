
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTx() {
  console.log('Checking Transaction table columns...');
  
  const { data, error } = await supabase.from('Transaction').select('*').limit(1);

  if (error) {
    console.error('Error selecting Transaction:', error.message);
  } else {
    if (data.length > 0) {
      const cols = Object.keys(data[0]);
      console.log('Columns found:', cols);
      console.log('Has currency?', cols.includes('currency'));
      console.log('Has provider?', cols.includes('provider'));
    } else {
      console.log('No rows found in Transaction table. Trying to select specific columns...');
      const { error: cErr } = await supabase.from('Transaction').select('currency, provider').limit(1);
      if (cErr) {
          console.log('Select currency/provider error:', cErr.message);
      } else {
          console.log('Select currency/provider success (columns likely exist)');
      }
    }
  }
}

checkTx();
