const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('--- START ---');
  const { error } = await supabase
    .from('Investment')
    .select('this_column_does_not_exist')
    .limit(1);

  if (error) {
    console.log('Error message:', error.message);
    console.log('Hint:', error.hint);
  } else {
    console.log('No error returned.');
  }
  console.log('--- END ---');
}

main();
