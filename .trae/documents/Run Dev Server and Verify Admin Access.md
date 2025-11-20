## Preflight
- Ensure Node version is `>=18.17.0` (repo engines). 
- Install dependencies: `npm install` in project root.
- Prepare environment:
  - Create `.env.local` with:
    - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - Optional: `SUPABASE_SERVICE_ROLE_KEY` for admin APIs (server-side) if available.
  - Supabase client falls back to a stub when keys are missing (`lib/supabase.ts`: c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\lib\supabase.ts:22-24). Without keys, admin pages show "Sign in required" due to `AdminGuard`.

## Start Dev Server
- Run: `npm run dev` (Next.js dev) (`package.json`: c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\package.json:7).
- Open `http://localhost:3000/`.

## Sign In & Admin Access
- Navigate to `http://localhost:3000/auth/login` and sign in (`pages/auth/login.tsx`: c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\pages\auth\login.tsx:28-33).
- Admin gate logic:
  - `AdminGuard` checks `profiles.is_admin` or `profiles.role==='admin'` (`components/AdminGuard.tsx`: c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\components\AdminGuard.tsx:18-25).
- Promote your user to admin (server-side API):
  - Endpoint: `POST /api/admin/users/promote` with `Authorization: Bearer <access_token>` and JSON `{ "userId": "<your-user-id>" }` (`pages/api/admin/users/promote.ts`: c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\pages\api\admin\users\promote.ts:8-25).
  - Server Supabase client uses `SUPABASE_SERVICE_ROLE_KEY` if set (`lib/supabaseServer.ts`: c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\lib\supabaseServer.ts:3-6).

## Check Logs Page
- Visit `http://localhost:3000/admin/logs`.
- Current rendering: placeholder under `AdminGuard` (c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\pages\admin\logs.tsx:1-12). 
- After implementation (next step), the page will show a filterable/paginated table sourced from `profit_logs` and optionally `transactions`.

## Next Step (Optional, after server is running)
- Implement `/api/admin/logs` + UI table to replace the placeholder, following the approved plan:
  - Columns: Time, Type, User, Details, Amount, Status; Filters: date range, type, user/email, status, amount range.
  - Use Supabase queries and admin API auth pattern (`pages/api/admin/performance.ts`: c:\Users\user\Documents\trae_projects\HYBRID TRADE AI\pages\api\admin\performance.ts:12-46).
