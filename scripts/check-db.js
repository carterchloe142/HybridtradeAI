
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('Checking tables...');
  
  // Check 'referrals'
  const { data: referrals, error: refError } = await supabase.from('referrals').select('*').limit(1);
  if (refError) {
      console.log('Error accessing referrals table:', refError.message);
      // Try 'Referral' (PascalCase)
      const { data: Referral, error: refError2 } = await supabase.from('Referral').select('*').limit(1);
      if (refError2) {
          console.log('Error accessing Referral table:', refError2.message);
      } else {
          console.log('Referral table exists (PascalCase).');
      }
  } else {
      console.log('referrals table exists (snake_case).');
  }

  // Check 'User' columns
  const { data: user, error: userError } = await supabase.from('User').select('id, referrerId').limit(1);
  if (userError) {
      console.log('Error accessing User table or referrerId:', userError.message);
       // Try 'users' or 'profiles'
      const { data: profile, error: profError } = await supabase.from('profiles').select('user_id').limit(1);
       if (profError) {
           console.log('Error accessing profiles:', profError.message);
       } else {
           console.log('profiles table exists.');
       }
  } else {
      console.log('User table exists and likely has referrerId (if no error on select).');
  }
}

checkTables();
