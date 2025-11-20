## Quick context for AI agents

This repo is a Next.js + TypeScript fintech scaffold using Supabase for auth and data, Prisma (optional) for migrations, and a modular backend for profit calculation and admin flows.

Keep responses short and actionable. When editing code, provide a two-line contract (inputs/outputs) and 2–3 tests or examples to validate behavior.

## Big picture (files to read first)
- `README.md` — onboarding, env vars, DB notes (use this for `DATABASE_URL` and Supabase keys).
- `backend/profit-engine.ts` and `backend/profit-distribution.ts` — core ROI and distribution logic. Changes here affect money flow; be conservative and add unit tests.
- `app/api/admin/*` and `pages/api/*` — server routes: admin flows live under both `app/api/admin` and `pages/api/admin` (read both when editing admin behavior).
- `lib/supabase.ts` and `src/lib/prisma.ts` — database & client helpers. Use the service role key pattern for server-side writes.

## Developer workflows & commands (explicit)
- Install: `npm install`
- Dev server: `npm run dev` (Next.js on http://localhost:3000)
- Build: `npm run build` and `npm run start` for production
- Tests: `npm run test` (Jest)
- Prisma migrations (optional):
  - Ensure `DATABASE_URL` in `.env.local`
  - `npx prisma migrate dev` to apply migrations
- Direct Postgres access (PowerShell): `psql "$env:DATABASE_URL"`

## Important environment variables
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client-side Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — server-side writes (used by APIs to bypass RLS). Never expose to client.
- `DATABASE_URL` — optional server-side DB for migrations/tools
- `OPENAI_API_KEY`, `JWT_SECRET`, `PLATFORM_FEE_PERCENT`, `SERVICE_FEE_PCT`, `WITHDRAW_HOLD_THRESHOLD_USD`

## Project-specific conventions & patterns
- Wallets vs investments vs transactions:
  - `wallets` holds user balances (USD primary). Mutations to wallets happen in admin/cron or after profit calculation.
  - `investments` holds locked principal and plan details (see `backend/*`).
  - `transactions` is the ledger: deposit, withdraw, profit, referral, principal_release.
- Admin flow safety:
  - Admin endpoints require `Authorization: Bearer <token>` and `profiles.role = 'admin'` or `profiles.is_admin = true`.
  - Distribution is two-step: create/POST `performance` (week_ending + stream_rois) then run `POST /api/admin/distribute-profits` (supports `?dryRun=true`).
- Idempotency guards:
  - `profit_logs` should be unique on `(investment_id, week_ending)` to prevent double-crediting. When modifying distribution logic, update/inspect `backend/migrations/*.sql`.
- Rate limiting: uses `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` in env — follow `src/lib/rate-limit` and `lib/rateLimit.ts` if touching API endpoints.

## Integration points & external dependencies
- Supabase: auth, RLS, and service-role writes. Server code uses `SUPABASE_SERVICE_ROLE_KEY` for inserts/updates that bypass RLS.
- Optional: Prisma (`prisma/schema.prisma`) and direct `DATABASE_URL` for migrations and admin tooling.
- Payment stubs: Flutterwave/Paystack/crypto are placeholders. Changes to payment flows should reflect in `pages/api/*` and UI components under `components/`.

## Concrete examples agents can use
- Simulate profit distribution (dry run): call `POST /api/admin/performance` with `{weekEnding, streamRois}` then
  `POST /api/admin/distribute-profits?dryRun=true` with an admin bearer token — this should produce the same calculation path but no writes.
- Deposit API example (dev/testing):
  - `POST /api/deposit` body `{ userId, amount, currency, provider, planId }` — this inserts `transactions` and `investments` (principal locked).
- Withdraw guard: `POST /api/withdraw` rejects if `cycleActive === true` or KYC not `approved`.

## When you modify money logic
- Add unit tests in `tests/` (look at `tests/profit.spec.ts`, `tests/notifications.spec.ts`) and a `dryRun` integration check.
- Run `npm run test` locally. For DB-dependent tests, mock Supabase or provide a local `DATABASE_URL` and a test DB.

## Files you will likely edit for feature work
- UI: `components/*`, `app/*`, `pages/*`
- Server: `app/api/*`, `pages/api/*`, `backend/*` (profit logic)
- DB: `prisma/schema.prisma`, `backend/migrations/*`, `lib/supabase.ts`

## Safety and verification checklist (must do before PR)
1. Run unit tests (`npm run test`).
2. If touching profit distribution, run `distribute-profits?dryRun=true` and confirm logs.
3. Ensure `profit_logs` or DB constraints prevent duplicate credits.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` out of client bundles.

If anything in these notes is unclear or missing, tell me which area you want expanded (e.g., sample tests for `backend/profit-engine.ts`, DB migration steps, or admin API examples) and I will iterate.
