import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Starting verification...');

  // 1. Create/Get User
  const email = `test_${Date.now()}@example.com`;
  const { data: user, error: userErr } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true
  });
  
  if (userErr) {
      console.error('User creation failed:', userErr);
      // Try to continue if user already exists (unlikely with timestamp)
  }
  const userId = user?.user?.id;
  if (!userId) return;
  console.log('User created:', userId);

  // 2. Create Plan (if not exists)
  let planId;
  const { data: existingPlan } = await supabase.from('InvestmentPlan').select('id').eq('name', 'Starter Plan').maybeSingle();
  if (existingPlan) {
    planId = existingPlan.id;
    console.log('Using existing plan:', planId);
  } else {
    // Generate UUID for plan ID if needed, or let DB handle it? 
    // Schema usually expects string CUID or UUID.
    const newId = crypto.randomUUID();
    const { data: newPlan, error: planErr } = await supabase.from('InvestmentPlan').insert({
       id: newId,
       name: 'Starter Plan',
       minAmount: 100,
       maxAmount: 500,
       duration: 7,
       returnPercentage: 10, // 10% ROI
       payoutFrequency: 'WEEKLY'
    }).select().single();
    
    if (planErr) {
        console.error('Plan creation failed:', planErr);
        // Fallback: maybe table is different?
        return;
    }
    planId = newPlan.id;
    console.log('Created new plan:', planId);
  }

  // 3. Create Investment
  // Note: Using 'id' (UUID) for investment.
  const invId = crypto.randomUUID();
  const { data: inv, error: invErr } = await supabase.from('Investment').insert({
    id: invId,
    userId,
    planId,
    amount: 1000,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago
  }).select().single();

  if (invErr) {
      console.error('Investment creation failed:', invErr);
      return;
  }
  console.log('Investment created:', inv.id);

  // 4. Run Cycle Logic (Simulated)
  console.log('Testing relation query...');
  const { data: investments, error: fetchErr } = await supabase
    .from('Investment')
    .select(`
        id, userId, planId, amount, status, createdAt,
        plan:InvestmentPlan ( returnPercentage )
    `)
    .eq('status', 'ACTIVE')
    .eq('id', inv.id);

  if (fetchErr) {
      console.error('Fetch failed:', fetchErr);
  } else {
      console.log('Fetched investment:', JSON.stringify(investments, null, 2));
      
      const i = investments[0];
      // Check if plan is loaded
      if (i.plan) {
          const planData = Array.isArray(i.plan) ? i.plan[0] : i.plan;
          console.log('Plan data:', planData);
          console.log('Verified Return Percentage:', planData.returnPercentage);
      } else {
          console.error('Plan relation returned null');
      }
  }

  // Cleanup
  console.log('Cleaning up...');
  await supabase.from('Investment').delete().eq('id', inv.id);
  await supabase.auth.admin.deleteUser(userId);
  console.log('Done.');
}

main().catch(console.error);
