
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try dotenv first
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
} catch (e) {
  console.log('dotenv not found, falling back to manual parsing');
  // Read .env.local manually
  function getEnv() {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, ''); // Remove quotes
        if (key && val) env[key] = val;
      }
    });
    return env;
  }
  const manualEnv = getEnv();
  Object.assign(process.env, manualEnv);
}

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL found:', !!url);
console.log('Key found:', !!key);

if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, key);

const plans = [
  {
    id: 'starter',
    name: 'Starter Plan',
    minAmount: 100,
    maxAmount: 500,
    duration: 7,
    returnPercentage: 5.0,
    payoutFrequency: 'WEEKLY',
    active: true
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    minAmount: 501,
    maxAmount: 2000,
    duration: 14,
    returnPercentage: 10.0,
    payoutFrequency: 'WEEKLY',
    active: true
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    minAmount: 2001,
    maxAmount: 10000,
    duration: 30,
    returnPercentage: 20.0,
    payoutFrequency: 'WEEKLY',
    active: true
  }
];

async function seed() {
  console.log('Seeding plans...');
  
  for (const plan of plans) {
    const payload = {
        ...plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Try PascalCase
    let { error } = await supabase.from('InvestmentPlan').upsert(payload);
    
    if (error) {
        console.log(`First attempt (InvestmentPlan) failed:`, error.message);
    }

    if (error && (error.message.includes('relation') || error.code === '42P01')) {
        console.log(`Fallback to snake_case for ${plan.id}`);
        // Fallback to snake_case
        const snakePlan = {
            id: plan.id,
            name: plan.name,
            min_amount: plan.minAmount,
            max_amount: plan.maxAmount,
            duration: plan.duration,
            return_percentage: plan.returnPercentage,
            payout_frequency: plan.payoutFrequency,
            active: plan.active
        };
        const { error: err2 } = await supabase.from('investment_plans').upsert(snakePlan);
        if (err2) console.error(`Error seeding ${plan.id}:`, err2);
        else console.log(`Seeded ${plan.id} (snake_case)`);
    } else if (error) {
        console.error(`Error seeding ${plan.id}:`, error);
    } else {
        console.log(`Seeded ${plan.id} (PascalCase)`);
    }
  }
  
  console.log('Done.');
}

seed();
