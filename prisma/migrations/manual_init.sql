-- Create Setting table
CREATE TABLE IF NOT EXISTS "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- Update Performance table if needed
-- (Assuming Performance exists but checking just in case)
CREATE TABLE IF NOT EXISTS "Performance" (
    "id" TEXT NOT NULL,
    "weekEnding" TIMESTAMP(3) NOT NULL,
    "streamRois" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- Add unique index on weekEnding if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "Performance_weekEnding_key" ON "Performance"("weekEnding");
