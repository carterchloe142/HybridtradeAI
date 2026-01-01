# Deployment Checklist

Before deploying to production, ensure the following steps are completed to prevent errors like "Could not find the table ... in the schema cache".

## Database Migration
- [ ] **Verify SupportTicket Schema**: Ensure `SupportTicket` and `Reply` tables exist.
  - Run the SQL script: `prisma/migrations/20240101_init_support_tickets.sql` via Supabase SQL Editor or CLI.
  - This script creates the tables and the lowercase views (`support_tickets`, `replies`) for compatibility.
  - It also runs `NOTIFY pgrst, 'reload schema';` to refresh the PostgREST schema cache.
- [ ] **Verify Profit Engine Schema**: Ensure `Plan` and `Investment` tables exist.
  - These are critical for the profit distribution system.
  - The pre-flight script will verify their accessibility.

## Environment Variables
- [ ] **Supabase URL & Key**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly in the production environment.
- [ ] **Site URL**: Ensure `NEXT_PUBLIC_SITE_URL` matches the production domain.
- [ ] **OpenAI API Key** (Optional): Set `OPENAI_API_KEY` to enable AI Chat features.
  - If missing, the chat widget will fall back to rule-based responses.

## Pre-flight Check
- [ ] **Run Pre-flight Script**:
  ```bash
  npm run deploy:check
  ```
  This script verifies:
  - Environment variables
  - Supabase connection
  - Existence of critical tables (`User`, `Wallet`, `SupportTicket`, `Reply`, `Plan`, `Investment`)
  - Domain configuration

## Application Configuration
- [ ] **Admin Role**: Ensure at least one user has the `ADMIN` role to access the support dashboard.

## Troubleshooting
- **"Could not find the table 'public.SupportTicket' in the schema cache"**:
  1. This error occurs when PostgREST's schema cache is out of sync with the database.
  2. **Automatic Fix**: The application API now includes a robust fallback mechanism that automatically retries requests using manual joins if the relation cache fails.
  3. **Manual Fix**: If persistent, run `NOTIFY pgrst, 'reload schema';` in the Supabase SQL Editor.
  4. **Verification**: Run `npm run deploy:check` to confirm table accessibility.
  5. **Migration**: If tables are missing, run the SQL script `prisma/migrations/20240101_init_support_tickets.sql`.
