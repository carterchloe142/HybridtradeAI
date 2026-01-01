import { PrismaClient } from './lib/generated/prisma/client'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres:Odogwuokaka15@db.wdlcttgfwoejqynlylpv.supabase.co:5432/postgres?sslmode=require'
        }
    }
})

async function main() {
  try {
    console.log('Checking lowercase "transactions" table...')
    const existsRows: any[] = await prisma.$queryRawUnsafe(`SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'transactions'
    ) AS exists;`)
    const exists = Array.isArray(existsRows) && existsRows.length > 0 ? Boolean((existsRows[0] as any).exists) : false
    if (!exists) {
      console.log('Creating table public.transactions...')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.transactions (
          id uuid PRIMARY KEY,
          user_id uuid NOT NULL,
          type text NOT NULL,
          amount_usd numeric(24,8) NOT NULL,
          currency text NOT NULL,
          status text NOT NULL,
          to_address text,
          created_at timestamptz NOT NULL DEFAULT now()
        );
      `)
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON public.transactions (user_id, created_at);`)
      console.log('Created public.transactions table.')
    } else {
      console.log('public.transactions already exists.')
    }

    console.log('Checking Transaction columns...')
    const txCols: any[] = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Transaction';`
    // console.log('Transaction columns:', txCols)

    const txHasMetadata = txCols.some((c: any) => c.column_name === 'metadata')
    if (!txHasMetadata) {
      console.log('Adding metadata column to Transaction...')
      await prisma.$executeRawUnsafe('ALTER TABLE "Transaction" ADD COLUMN "metadata" JSONB;')
      console.log('Added metadata column.')
    } else {
      console.log('Transaction already has metadata column.')
    }

    console.log('\nChecking WalletTransaction columns...')
    const wtCols: any[] = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'WalletTransaction';`
    // console.log('WalletTransaction columns:', wtCols)

    const wtHasNote = wtCols.some((c: any) => c.column_name === 'note')
    if (!wtHasNote) {
      console.log('Adding note column to WalletTransaction...')
      await prisma.$executeRawUnsafe('ALTER TABLE "WalletTransaction" ADD COLUMN "note" TEXT;')
      console.log('Added note column.')
    } else {
      console.log('WalletTransaction already has note column.')
    }

    console.log('\nChecking Notification columns...')
    const notifCols: any[] = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Notification';`
    console.log('Notification columns:', notifCols.map(c => c.column_name))
    
    // Check if 'type' exists
    const notifHasType = notifCols.some((c: any) => c.column_name === 'type')
    if (!notifHasType) {
        console.log('Notification table is missing "type" column!')
        // Attempt to add it? Schema says it should be there.
        // await prisma.$executeRawUnsafe('ALTER TABLE "Notification" ADD COLUMN "type" TEXT NOT NULL DEFAULT \'general\';')
    }

  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
