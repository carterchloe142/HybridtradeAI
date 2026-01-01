require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPerf() {
  console.log('Checking Performance table...');
  const { data, error } = await supabase.from('Performance').select('*').limit(1);
  if (error) {
    console.error('Error selecting Performance:', error.message);
  } else {
    console.log('Performance row:', data[0]);
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
    } else {
        console.log('Performance table empty.');
    }
  }

  console.log('\nChecking Settings table (PascalCase)...');
  const { data: s1, error: e1 } = await supabase.from('Settings').select('*').limit(1);
  if (e1) console.log('Settings error:', e1.message);
  else console.log('Settings row:', s1[0]);

  console.log('\nChecking SystemSetting table...');
  const { data: s2, error: e2 } = await supabase.from('SystemSetting').select('*').limit(1);
  if (e2) console.log('SystemSetting error:', e2.message);
  else console.log('SystemSetting row:', s2[0]);
  
  console.log('\nChecking Setting table (Singular, PascalCase)...');
  const { data: s4, error: e4 } = await supabase.from('Setting').select('*').limit(1);
  if (e4) console.log('Setting error:', e4.message);
  else console.log('Setting row:', s4[0]);

  console.log('\nChecking Transaction table columns...');
  const { data: t1, error: et1 } = await supabase.from('Transaction').select('*').limit(1);
  if (et1) console.log('Transaction error:', et1.message);
  else if (t1 && t1.length > 0) {
      console.log('Transaction columns:', Object.keys(t1[0]));
  } else {
      console.log('Transaction table empty, trying insert dry-run...');
      // Try to select specific columns to see if they exist
      const { error: colErr } = await supabase.from('Transaction').select('currency, provider').limit(1);
      if (colErr) console.log('Column check error:', colErr.message);
      else console.log('Columns currency and provider exist.');
  }
}

checkPerf();
