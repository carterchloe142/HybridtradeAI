-- Create SupportTicket table
CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- Create Reply table
CREATE TABLE IF NOT EXISTS "Reply" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SupportTicket_userId_fkey') THEN
        ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Reply_ticketId_fkey') THEN
        ALTER TABLE "Reply" ADD CONSTRAINT "Reply_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE "SupportTicket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reply" ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT ALL ON TABLE "SupportTicket" TO postgres, service_role;
GRANT ALL ON TABLE "SupportTicket" TO authenticated;
GRANT ALL ON TABLE "Reply" TO postgres, service_role;
GRANT ALL ON TABLE "Reply" TO authenticated;

-- Policies
-- SupportTicket
DROP POLICY IF EXISTS "Enable all for authenticated" ON "SupportTicket";
CREATE POLICY "Enable all for authenticated" ON "SupportTicket" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Reply
DROP POLICY IF EXISTS "Enable all for authenticated" ON "Reply";
CREATE POLICY "Enable all for authenticated" ON "Reply" FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- Create lowercase views for compatibility
CREATE OR REPLACE VIEW support_tickets AS SELECT 
    id, 
    "userId" as user_id, 
    subject, 
    status, 
    "createdAt" as created_at, 
    "updatedAt" as updated_at 
FROM "SupportTicket";

CREATE OR REPLACE VIEW replies AS SELECT 
    id, 
    "ticketId" as ticket_id, 
    body, 
    "isAdmin" as is_admin, 
    "createdAt" as created_at, 
    "updatedAt" as updated_at 
FROM "Reply";

-- Grant on views
GRANT ALL ON support_tickets TO postgres, service_role, authenticated;
GRANT ALL ON replies TO postgres, service_role, authenticated;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
