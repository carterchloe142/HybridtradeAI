const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Checking InvestmentPlan via Supabase Client...');
  
  // Try to select from 'InvestmentPlan'
  const { data: dataCamel, error: errorCamel } = await supabase
    .from('InvestmentPlan')
    .select('*')
    .limit(1);

  if (errorCamel) {
    console.log('Error selecting from "InvestmentPlan":', errorCamel.message);
  } else {
    console.log('Success selecting from "InvestmentPlan". Columns present in result (if any):', dataCamel.length > 0 ? Object.keys(dataCamel[0]) : 'No rows found, cannot inspect columns directly via SELECT');
  }

  // If no rows, try to insert to see errors about missing columns
  if (!errorCamel && (!dataCamel || dataCamel.length === 0)) {
     console.log('Attempting dry-run insert to discover columns...');
     // This is risky if we actually insert garbage, but we can try to fail
     const { error: insertError } = await supabase
        .from('InvestmentPlan')
        .insert({
            slug: 'temp-check-' + Date.now(),
            name: 'Temp Check',
            // intentionally omit others to see if it complains
        });
     if (insertError) {
         console.log('Insert error (might reveal schema):', insertError.message);
     }
  }

  // Try snake_case table name just in case
  const { data: dataSnake, error: errorSnake } = await supabase
    .from('investment_plans')
    .select('*')
    .limit(1);
    
  if (!errorSnake) {
      console.log('Found table "investment_plans" (snake_case)!');
  }

  // Also check User table
  console.log('\nChecking User table...');
  const { data: dataUser, error: errorUser } = await supabase
    .from('User')
    .select('*')
    .limit(1);
    
  if (errorUser) {
      console.log('Error selecting from "User":', errorUser.message);
  } else {
      console.log('Success selecting from "User".');
      if (dataUser.length > 0) {
          console.log('User columns:', Object.keys(dataUser[0]));
      }
  }
}

main();
