# HybridTradeAI

Production-ready fintech web app scaffolding built with Next.js, TypeScript, Tailwind CSS, and Supabase (Postgres). Modern neon/glassmorphic UI, modular backend, and API stubs for rapid iteration.

## Features
- Neon/glassmorphic landing page with ChatWidget
- Supabase Auth placeholders (register/login)
- Dashboard with multi-currency balances and weekly ROI
- Plans page (Starter, Pro, Elite) with realistic ROI (+4%)
- Plans page (Starter, Pro, Elite) aligned to allocations and ranges
- API stubs: deposit, withdraw, ai-chat, referral
- Backend profit engine for ROI and referral computations
- Modular components (Navbar, Sidebar, Cards, ChatWidget)
- Multi-language and multi-currency placeholders
- Smooth animations via Framer Motion

## Getting Started

1. Clone/paste this project into your `HybridTradeAI` folder.
2. Create `.env.local` from `.env.example` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Optional: payment keys, `OPENAI_API_KEY`, `JWT_SECRET`
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`.

## Structure
- `pages/` – Next.js routes (Landing, Auth, Dashboard, Plans, API)
- `components/` – UI components (Navbar, Sidebar, Cards, ChatWidget)
- `backend/` – Profit engine logic (ROI, referral, cron stub)
- `hooks/` – i18n and currency helpers
- `lib/` – Supabase client
- `styles/` – Tailwind global styles
- `types/` – Shared TypeScript types

## Supabase
- This scaffold uses `@supabase/supabase-js` client.
- Replace placeholders with your project credentials.
- Expand auth and data models in Supabase tables for investments and wallets.

### Suggested Database Schema (SQL)
Create these tables in Supabase to enable real balances, investments, and referrals:

```sql
create table if not exists wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  currency text check (currency in ('USD','EUR','NGN','BTC','ETH')) not null,
  amount numeric not null default 0
);

create table if not exists investments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text check (plan_id in ('starter','pro','elite')) not null,
  amount_usd numeric not null,
  status text check (status in ('active','completed','pending')) not null default 'active',
  created_at timestamp with time zone default now()
);

create table if not exists referrals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code text unique not null,
  total_earnings numeric not null default 0
);

create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text check (type in ('deposit','withdraw','profit','referral')) not null,
  amount_usd numeric not null,
  meta jsonb,
  created_at timestamp with time zone default now()
);
```

Set Row Level Security and policies to allow the authenticated user to read/write their own rows.

## Postgres Connection Usage

The project can use a direct Postgres connection string for tooling (e.g., Prisma migrations, psql scripting, or ETL tasks). Add `DATABASE_URL` to `.env.local`:

```
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/postgres
```

Examples:
- psql
  - `psql "$env:DATABASE_URL"` on Windows PowerShell
  - `psql "$DATABASE_URL"` on macOS/Linux
- Prisma (optional)
  - In `prisma/schema.prisma` set `datasource db { url = env("DATABASE_URL") }`
  - Run `npx prisma migrate dev` to manage schema migrations

Notes:
- This connection is independent of the Supabase client config and is useful for admin tasks, migrations, and scripts.
- Keep `DATABASE_URL` secure; do not expose it to the client. It is for server-side tooling only.

## Deposit and Withdrawal APIs

Server-side routes persist transactions and adjust wallets using the Supabase service role client.

- POST `/api/deposit`
  - Body: `{ userId, amount, currency, provider, planId }`
  - Effects:
    - Insert `transactions` row with `type = 'deposit'`
    - Insert `investments` with `status = 'active'` (principal locked)
    - Note: deposit does not credit `wallets`; profits and maturity credit wallets

- POST `/api/withdraw`
  - Body: `{ userId, amount, currency, cycleActive }`
  - Guards:
    - Reject if `cycleActive` is `true`
    - Reject if KYC not `approved`
    - Reject if wallet balance is insufficient
    - If amount exceeds `WITHDRAW_HOLD_THRESHOLD_USD`, create a `withdraw_request` and return `202`, pending admin approval
  - Effects:
    - Update `wallets` balance
    - Insert `transactions` row with `type = 'withdraw'`

Testing quickly with curl (replace placeholders):

```
curl -X POST http://localhost:3000/api/deposit \
  -H "Content-Type: application/json" \
  -d '{"userId":"<uuid>","amount":100,"currency":"USD","provider":"flutterwave","planId":"starter"}'

curl -X POST http://localhost:3000/api/withdraw \
  -H "Content-Type: application/json" \
  -d '{"userId":"<uuid>","amount":50,"currency":"USD","cycleActive":false}'
```

Ensure `.env.local` has:

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=...
```

RLS & Policies:
- APIs use `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS for writes.
- For client reads, create policies allowing users to read their own `wallets`, `investments`, `transactions`, and `referrals`.

## Cycle Processing (Admin)

Use POST `/api/admin/run-cycle` to enforce cycle rules:

- Day 7: Credit weekly ROI to `wallets` (USD) net of service fee.
  - Inserts a `transactions` row with `type = 'roi'` and meta `{ investment_id, applied_weekly_roi, service_fee_pct }`.
- Day 14: Release principal to `wallets` (USD) and mark investment `completed`.
  - Inserts a `transactions` row with `type = 'principal_release'`.

Configuration:
- `SERVICE_FEE_PCT` in `.env.local` (default 5).
- `WITHDRAW_HOLD_THRESHOLD_USD` to enable large-withdrawal hold and manual review.
- `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` for API rate limiting.
- `PLATFORM_FEE_PERCENT` for stream-based distribution (default 7). Applies to net profit in `/api/admin/distribute-profits`.
- Weekly ROI uses plan baselines from `backend/profit-engine.ts`. You can update these weekly or extend admin UI to input the exact `Applied ROI this week`.


## Profit Distribution Runner (Streams)

Use POST `/api/admin/distribute-profits` to credit profits based on admin-input performance streams:

- Pulls the latest `performance` row (`week_ending`, `stream_rois` JSON) and all `investments` with `status = 'active'`.
- Determines plan allocations from `plans.allocations` JSON if present; otherwise falls back to defaults in the runner.
- Computes weighted ROI: sum of `(allocation_pct / 100) * stream_roi_pct` and applies to `investment.amount_usd`.
- Applies `PLATFORM_FEE_PERCENT` to derive net profit.
- Credits the user's `wallets` (USD) and records a `transactions` row with `type = 'roi'`.
- Inserts a `profit_logs` row per `investment_id` and `week_ending` to prevent double-credit.
- If `profiles.referrer_id` exists, credits the referrer’s USD wallet with plan-tier rate (Starter 5%, Pro 7%, Elite 10%).

Parameters:
- `dryRun=true` (query or body) to simulate computation without any writes.

Schema expectations:
- `performance`: `{ id, week_ending: date, stream_rois: jsonb }` where keys are normalized as one of `trading`, `copy_trading`, `staking_yield`, `ads_tasks`, `ai` (legacy keys like `hft`, `staking`, `ads` are auto-normalized).
- `profit_logs`: `{ id, user_id, plan_id, investment_id, week_ending, weighted_pct, gross_profit, fee, net_profit, stream_rois }`

## Admin Performance Input

- Page: `/admin/performance` – enter weekly stream ROI percentages for `Trading`, `Copy-Trading`, `Staking/Yield`, `Ads & Tasks`, and `AI`.
- API: `POST /api/admin/performance` – upserts `{ week_ending, stream_rois }` into `performance`.
- Use this first, then execute `POST /api/admin/distribute-profits` (optionally `?dryRun=true`) to credit profits.

Recommended DB constraints:
- `profit_logs` unique index on `(investment_id, week_ending)` to prevent duplicate credits.
- `performance` unique on `week_ending` to enable upserts.

### Admin Auth & Usage
- All `/api/admin/*` endpoints now require an `Authorization: Bearer <access_token>` header.
- The admin page `/admin/performance` automatically includes the current user’s token when calling the API.
- To test via curl, obtain a Supabase user access token and include it:

```
curl -X POST http://localhost:3000/api/admin/performance \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"weekEnding":"2025-11-07","streamRois":{"trading":1.2,"copy_trading":0.8,"staking_yield":1.0,"ads_tasks":0.4,"ai":0.9}}'

curl -X POST "http://localhost:3000/api/admin/distribute-profits?dryRun=true" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Admin requirement:
- The user must have `profiles.role = 'admin'` or `profiles.is_admin = true`.
- Unauthorized requests return `401` and a message.


## Notes
- Payment integrations (Flutterwave, Paystack, Crypto) are stubbed.
- Withdrawals enforce a simple waiting-period rule while cycles are active.
- Tailwind configured with neon/glass theme; dark mode is supported via `class`.
- Ready for future HFT trading and ad-revenue modules.

## Transparency
- Page: `/proof-of-reserves` shows verified pool balances and an Emergency Fund section.
- API: `/api/transparency` provides reserves and emergency fund data (uses Supabase tables if present, otherwise returns demo values).

## Vercel Deployment
Add `vercel.json` to configure basic settings and environment variables. Example:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SITE_URL": "https://your-deployment-url.vercel.app"
  }
}
```

## Production
- Add proper error handling, logging, and monitoring.
- Secure API routes and validate inputs with `zod`.
- Run migrations in `backend/migrations/001_performance_profit_logs.sql` to create required tables.
- Configure Vercel/hosting and environment secrets.
