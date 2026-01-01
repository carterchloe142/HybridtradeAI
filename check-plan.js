
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlan() {
  console.log('Checking InvestmentPlan table...');
  const { data, error } = await supabase.from('InvestmentPlan').select('*').limit(1);
  if (error) {
    console.error('Error selecting InvestmentPlan:', error.message);
  } else {
    console.log('InvestmentPlan row:', data[0]);
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
    }
  }

  console.log('\nChecking plans table...');
  const { data: plansData, error: plansError } = await supabase.from('plans').select('*').limit(1);
  if (plansError) {
    console.error('Error selecting plans:', plansError.message);
  } else {
    console.log('plans row:', plansData[0]);
    if (plansData && plansData.length > 0) {
      console.log('Columns:', Object.keys(plansData[0]));
    }
  }
}

checkPlan();
