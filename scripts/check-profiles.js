
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) console.log(error);
  else console.log('Profiles columns:', data && data.length > 0 ? Object.keys(data[0]) : 'Empty table');
}

checkProfiles();
