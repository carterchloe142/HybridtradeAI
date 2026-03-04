
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSettingTable() {
  console.log('Checking Setting table...');
  
  // Try to insert a dummy value
  const testKey = 'TEST_KEY_' + Date.now();
  const { data, error } = await supabase
    .from('Setting')
    .insert({ key: testKey, value: 'test_value' })
    .select()
    .single();

  if (error) {
    console.error('Error inserting into Setting table:', error);
    // Try lowercase 'settings' or 'setting' just in case
    console.log('Trying lowercase "setting"...');
    const { error: err2 } = await supabase.from('setting').select('*').limit(1);
    console.log('Error accessing "setting":', err2 ? err2.message : 'None');
  } else {
    console.log('Successfully inserted into Setting table:', data);
    
    // Clean up
    await supabase.from('Setting').delete().eq('key', testKey);
    console.log('Cleaned up test key.');
  }
}

checkSettingTable();
