
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserTable() {
  const { data, error } = await supabase.from('User').select('*').limit(1);
  if (error) console.log(error);
  else console.log('User columns:', data && data.length > 0 ? Object.keys(data[0]) : 'Empty table');
}

checkUserTable();
