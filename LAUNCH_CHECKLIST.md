# Launch Checklist (Final)

This checklist consolidates the required steps and exact commands for a production launch.

## 1) Database Migrations (Prisma)

- Ensure `DATABASE_URL` is set in your production environment.
- Deploy migrations:

```
npx prisma migrate deploy
```

- Optional verification:

```
npx prisma db push --accept-data-loss
npx prisma migrate status
```

## 2) Provision Managed Services

- Redis: Upstash/Redis Cloud. Set `REDIS_URL` (e.g., `rediss://:<password>@<host>:<port>`).
- Postgres: Supabase or Neon. Set `DATABASE_URL` and Supabase service keys.

Required envs:
- `DATABASE_URL`
- `REDIS_URL`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## 3) Core Environment Variables

- Auth: `NEXTAUTH_SECRET`
- Payments: `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET` (and any Flutterwave keys if used)
- Fees: `PLATFORM_FEE_PERCENT`, `SERVICE_FEE_PCT`
- Observability: `SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE`
- App: `NEXT_PUBLIC_SITE_URL`, `TIMEZONE`

## 4) Hosting Configuration

- Vercel or your platform: add all env vars as secrets.
- Enable cron jobs (if using Vercel Cron) for:
  - Weekly profit distribution (call `/api/admin/distribute-profits` or `/api/admin/run-cycle`).
  - Daily retention job (`/api/admin/retention?days=30`).
- Recommended concurrency/limits for worker:
  - `RUN_WORKERS=true` and run `node dist/workers/broadcastWorker.js` with a process manager.

## 5) Smoke Test Flow

Run through the end-to-end flow:
- Deposit → webhook → create investment → run distribution → user notification.

Suggested steps:
1. Create a test user and approve KYC in `profiles`.
2. Trigger `POST /api/deposit` with test payload.
3. Simulate payment webhook if needed (Paystack) at `/api/webhooks/paystack`.
4. Confirm an `investments` row exists with `status='ACTIVE'`.
5. Enter weekly performance at `/admin/performance`.
6. Dry-run profit: `POST /api/admin/distribute-profits?dryRun=true`.
7. Run live distribution: `POST /api/admin/distribute-profits`.
8. Confirm `wallets` and `transactions` updated.
9. Verify notifications: `/api/user/notifications` or UI notification center.

## 6) Admin & Ops Verification

- Invite first admin via `/api/admin/users/invite-admin` and promote if necessary.
- Verify KYC enforcement on withdrawals:
  - Attempt `/api/withdraw` with non-approved user → expect rejection.
  - Approve KYC and retry.
  - Test large withdrawal `WITHDRAW_HOLD_THRESHOLD_USD` behavior (hold → manual review).

## 7) Observability & Logs

- Confirm structured logs are emitted and Sentry is receiving events.
- Validate Redis job logs for broadcasts: `job_logs:broadcast:<jobId>`.
- Run retention: `POST /api/admin/retention` and confirm `NotificationDelivery` rows older than N days are purged.

## 8) Final Checks

- `npm run build` succeeds.
- `npm start` serves production build.
- Run unit tests: `npm test` and verify profit/notifications specs.

## Quick Commands

```
# Build & Start
npm run build && npm start

# Tests
npm test

# Prisma migrate deploy
npx prisma migrate deploy

# Retention job (ad-hoc)
curl -X POST "https://<your-host>/api/admin/retention?days=30" -H "Authorization: Bearer <ACCESS_TOKEN>"
```
