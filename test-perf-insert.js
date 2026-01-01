require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Testing Setting insert...');
  const { data, error } = await supabase.from('Setting').insert({
    key: 'test_key',
    value: 'test_val'
  }).select();

  if (error) {
    console.error('Error inserting Setting:', error.message);
  } else {
    console.log('Success Setting:', data);
    await supabase.from('Setting').delete().eq('key', 'test_key');
  }

  console.log('Testing settings insert...');
  const { data: d2, error: e2 } = await supabase.from('settings').insert({
    key: 'test_key',
    value: 'test_val'
  }).select();

  if (e2) {
    console.error('Error inserting settings:', e2.message);
  } else {
    console.log('Success settings:', d2);
    await supabase.from('settings').delete().eq('key', 'test_key');
  }
}

testInsert();
