## Overview
- Replace placeholder in `pages/admin/logs.tsx` with a real, admin‑protected logs UI.
- Show system activity based on existing data sources (profit distribution events and transactions), with filters, sorting, and pagination.

## Current State
- `pages/admin/logs.tsx` renders an AdminGuard wrapper and a placeholder string "Activity logs – coming soon." (c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\pages\admin\logs.tsx:1-12).
- Admin pages use Tailwind classes and `AdminGuard` for access control.

## Data Model & Sources
- Profit distribution events table: `backend/migrations/001_performance_profit_logs.sql` defines `profit_logs` and `performance` (c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\backend\migrations\001_performance_profit_logs.sql:3-8,11-23,26).
- Business logic that writes logs/transactions: `backend/profit-distribution.ts` handles inserts into `profit_logs` and `transactions` (c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\backend\profit-distribution.ts:95-104,150-175).
- Reference admin API patterns exist: `pages/api/admin/performance.ts`, `pages/api/admin/run-cycle.ts`, `pages/api/admin/distribute-profits.ts` (e.g., c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\pages\api\admin\performance.ts:12-46).

## API Endpoints
- Add `GET /api/admin/logs` to return paginated, filterable logs. Query supabase tables:
  - Primary: `profit_logs` joined with related info (e.g., performance period, user) when available.
  - Optional: add a toggle to view `transactions` using the same endpoint via `type=transactions`.
- Request params: `page`, `pageSize`, `start`, `end`, `type` (profit|transaction), `user`, `minAmount`, `maxAmount`, `status`.
- Response: `{ items, total, page, pageSize }` with normalized fields: `id`, `created_at`, `type`, `user`, `details/meta`, `amount`, `status`.

## UI Implementation
- Replace placeholder with a table and controls:
  - Header and filter bar: date range, type (Profit Logs vs Transactions), user/email, status/level, amount range.
  - Table columns: Time, Type, User, Details, Amount, Status.
  - Actions: pagination controls, optional CSV export.
- Reuse admin table pattern from `pages/admin/transactions.tsx` (c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\pages\admin\transactions.tsx:74-112) and Tailwind utilities.

## Data Fetching
- Use existing Supabase client (`lib/supabase.ts`) or fetch through the new API route.
- Client: call `/api/admin/logs` with current filters; update table state; show loading/error states.
- Sorting: default sort by `created_at` desc; allow clicking column headers to change.

## Security & Access Control
- Wrap page in `AdminGuard` as it is today.
- Server-side endpoint validates admin authorization (reuse pattern from admin APIs).

## Validation & Testing
- Seed or simulate events to verify pagination and filters.
- Verify performance under large datasets (range queries and indexes).
- Add basic unit tests for the API handler (filter → SQL builder) if test harness exists.

## Rollout Steps
1. Implement `/api/admin/logs` with Supabase queries, filters, and pagination.
2. Build logs table UI in `pages/admin/logs.tsx` and wire filters.
3. Add sorting and CSV export (optional).
4. Verify with sample data; ensure empty/blank states and error handling.
5. Ship after manual QA in admin environment.