
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const plans = [
  {
    id: 'starter', // Explicit ID for easier reference
    name: 'Starter Plan',
    minAmount: 100,
    maxAmount: 500,
    duration: 7, // Days
    returnPercentage: 15, // Avg of 10-20
    payoutFrequency: 'WEEKLY',
    active: true
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    minAmount: 501,
    maxAmount: 2000,
    duration: 14,
    returnPercentage: 35, // Avg of 25-45
    payoutFrequency: 'WEEKLY',
    active: true
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    minAmount: 2001,
    maxAmount: 10000,
    duration: 30, // Or 14? Frontend implies 30 for Elite in some places, 14 in others. planConfig doesn't say.
    // Dashboard line 251: inferredDays = planKey === 'starter' ? 7 : planKey === 'pro' ? 14 : planKey === 'elite' ? 30 : 14
    // Let's use 30.
    returnPercentage: 22.5, // Avg of 15-30
    payoutFrequency: 'WEEKLY',
    active: true
  },
  {
    id: 'bigtime',
    name: 'HYDRA Plan',
    minAmount: 50000,
    maxAmount: 200000,
    duration: 14, // Dashboard line 251 fallback is 14. Let's stick to 14 or 30?
    // User said "stick to its investment running days".
    // Frontend doesn't explicitly say days for Hydra, but implies cycle.
    // TERMS p2 says "Hybrid cycles run for 14 days."
    // Let's use 14.
    returnPercentage: 30, // Avg of 20-40
    payoutFrequency: 'WEEKLY',
    active: true
  }
];

async function seedPlans() {
  console.log('Seeding plans...');
  
  for (const p of plans) {
    // Try to find by ID
    let { data: existing } = await supabase.from('InvestmentPlan').select('id').eq('id', p.id).maybeSingle();
    
    // Check by name if ID fails (to catch old uuids)
    if (!existing) {
        let { data: existingByName } = await supabase.from('InvestmentPlan').select('id').eq('name', p.name).maybeSingle();
        if (existingByName) {
             console.log(`Plan ${p.name} exists with ID ${existingByName.id}, skipping insert (or update if needed)`);
             // Ideally we'd update it to use the new ID, but that breaks FKs.
             // Better to just ensure 'bigtime' exists.
        }
    }

    if (existing) {
        console.log(`Updating ${p.name}...`);
        const { error } = await supabase.from('InvestmentPlan').update({
            name: p.name,
            minAmount: p.minAmount,
            maxAmount: p.maxAmount,
            duration: p.duration,
            returnPercentage: p.returnPercentage,
            payoutFrequency: p.payoutFrequency,
            active: p.active
        }).eq('id', p.id);
        
        if (error) console.error(error);
    } else {
        // If not found by ID, insert it with the explicit ID
        console.log(`Creating ${p.name}...`);
        const { error } = await supabase.from('InvestmentPlan').insert({
            id: p.id,
            name: p.name,
            minAmount: p.minAmount,
            maxAmount: p.maxAmount,
            duration: p.duration,
            returnPercentage: p.returnPercentage,
            payoutFrequency: p.payoutFrequency,
            active: p.active,
            updatedAt: new Date().toISOString() // Explicitly set updatedAt
        });
        if (error) console.error(error);
    }
  }
  console.log('Done.');
}

seedPlans();
