
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Fetching InvestmentPlan sample...');
    const planRes = await supabase.from('InvestmentPlan').select('*').limit(1);
    if (planRes.data && planRes.data.length > 0) {
        console.log('InvestmentPlan sample:', JSON.stringify(planRes.data[0], null, 2));
    } else {
        console.log('InvestmentPlan table is empty.');
    }

    console.log('\nFetching referrals sample...');
    const refRes = await supabase.from('referrals').select('*').limit(1);
    if (refRes.data && refRes.data.length > 0) {
        console.log('referrals sample:', JSON.stringify(refRes.data[0], null, 2));
    } else {
        console.log('referrals table is empty.');
    }

  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

main();
