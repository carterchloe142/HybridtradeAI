# Setup Guide - HybridTradeAI

## 1. Supabase Setup (REQUIRED for Login/Auth)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Sign up/Login
3. Click "New Project"
4. Fill in:
   - Project Name: `hybridtradeai` (or your choice)
   - Database Password: (save this!)
   - Region: Choose closest to you
5. Wait for project to be created (~2 minutes)

### Step 2: Get API Keys
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...` - keep this secret!)

### Step 3: Add to .env.local
Open `.env.local` and replace:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 4: Create Database Tables
In Supabase dashboard, go to **SQL Editor** and run:

```sql
-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT CHECK (currency IN ('USD','EUR','NGN','BTC','ETH')) NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, currency)
);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT CHECK (plan_id IN ('starter','pro','elite')) NOT NULL,
  amount_usd NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('active','completed','pending')) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('DEPOSIT','WITHDRAW','PROFIT','REFERRAL')) NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('PENDING','CONFIRMED','FAILED','CANCELLED')) NOT NULL DEFAULT 'PENDING',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (for KYC)
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  kyc_status TEXT CHECK (kyc_status IN ('pending','approved','rejected')),
  kyc_level INTEGER,
  kyc_submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read/write their own data
CREATE POLICY "Users can view own wallets" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallets" ON wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallets" ON wallets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own investments" ON investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investments" ON investments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
```

### Step 5: Restart Dev Server
After adding Supabase keys, restart:
```bash
npm run dev
```

## 2. NOWPayments Setup

### Already Configured:
- ✅ API Key: `JBFCWMF-ZEEM3A1-P3WTFW6-X4B67JE`
- ✅ IPN Secret: `T6pxdyaiu7wcnvbcjHBDbZoaMEzPNriq`
- ✅ Webhook URL: `http://localhost:3000/api/webhooks/nowpayments`

### In NOWPayments Dashboard:
1. Go to https://nowpayments.io/dashboard
2. Navigate to **Settings** → **IPN Settings**
3. Set IPN URL to: `http://localhost:3000/api/webhooks/nowpayments` (for local testing)
4. For production: `https://yourdomain.com/api/webhooks/nowpayments`
5. Set IPN Secret to: `T6pxdyaiu7wcnvbcjHBDbZoaMEzPNriq`

### Test Flow:
1. Login/Register at `/auth/login` or `/auth/register`
2. Complete KYC at `/kyc` (get approved by admin)
3. Go to `/deposit`
4. Select: Plan → Crypto → USDT/BTC/ETH → Amount
5. Submit → Redirected to NOWPayments
6. Complete payment → Webhook credits wallet automatically

## 3. Troubleshooting

### "Supabase not configured" error:
- Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after adding keys
- Verify keys are correct (no extra spaces)

### NOWPayments not working:
- Check API key is correct in `.env.local`
- Verify webhook URL is set in NOWPayments dashboard
- Check browser console and server logs for errors
- Ensure transaction is created in Supabase `transactions` table

### Login issues:
- Make sure Supabase tables are created (see SQL above)
- Check RLS policies are enabled
- Verify email confirmation is disabled in Supabase Auth settings (for testing)


