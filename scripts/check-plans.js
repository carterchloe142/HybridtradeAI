
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPlans() {
  console.log('Checking InvestmentPlan table...');
  const { data: plans, error } = await supabase.from('InvestmentPlan').select('*');
  
  if (error) {
    console.error('Error fetching InvestmentPlan:', error);
  } else {
    console.log('Plans found:', plans.map(p => ({ id: p.id, name: p.name })));
  }

  console.log('\nChecking investment_plans table...');
  const { data: plans2, error: error2 } = await supabase.from('investment_plans').select('*');
  
  if (error2) {
    console.error('Error fetching investment_plans:', error2);
  } else {
    console.log('Plans found (snake_case):', plans2.map(p => ({ id: p.id, name: p.name })));
  }
}

checkPlans();
