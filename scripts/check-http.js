const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking connection to:', supabaseUrl);
  const start = Date.now();
  const { data, error } = await supabase.from('User').select('count', { count: 'exact', head: true });
  const end = Date.now();
  
  if (error) {
    console.error('Error:', error.message);
    if (error.code === 'PGRST204') {
        console.log('Success! Connected, but table "User" might not exist (PGRST204).');
    }
  } else {
    console.log('Success! Connection took', end - start, 'ms');
  }
}

check();
