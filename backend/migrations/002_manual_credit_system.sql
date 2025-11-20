-- Manual Credit System migration for Supabase (apply in SQL editor)
-- Creates enums and tables used by Prisma models: WalletTransaction, AdminAction.

-- Enums
DO $$ BEGIN
  CREATE TYPE "WalletChangeType" AS ENUM ('CREDIT', 'DEBIT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "AdminActionType" AS ENUM ('MANUAL_CREDIT', 'APPROVE_CREDIT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "AdminActionStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- WalletTransaction table
CREATE TABLE IF NOT EXISTS "WalletTransaction" (
  "id" TEXT PRIMARY KEY,
  "walletId" TEXT NOT NULL,
  "amount" DECIMAL(24,8) NOT NULL,
  "type" "WalletChangeType" NOT NULL,
  "source" TEXT NOT NULL,
  "reference" TEXT,
  "note" TEXT,
  "performedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Foreign key for WalletTransaction.walletId → Wallet.id
DO $$ BEGIN
  ALTER TABLE "WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_walletId_fkey"
    FOREIGN KEY ("walletId") REFERENCES "Wallet"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Index on walletId
CREATE INDEX IF NOT EXISTS "WalletTransaction_walletId_idx" ON "WalletTransaction"("walletId");

-- AdminAction table
CREATE TABLE IF NOT EXISTS "AdminAction" (
  "id" TEXT PRIMARY KEY,
  "adminId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" DECIMAL(24,8) NOT NULL,
  "action" "AdminActionType" NOT NULL,
  "note" TEXT,
  "status" "AdminActionStatus" NOT NULL DEFAULT 'COMPLETED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3)
);

-- No foreign keys for AdminAction to users (IDs may be from auth provider); add if desired.

-- End of migration
