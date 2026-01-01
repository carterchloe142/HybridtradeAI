const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Odogwuokaka15@db.wdlcttgfwoejqynlylpv.supabase.co:5432/postgres?sslmode=require',
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to DB');

    // Check Transaction metadata
    console.log('Checking Transaction columns...');
    const txRes = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Transaction'`);
    const txCols = txRes.rows.map(r => r.column_name);
    console.log('Transaction columns:', txCols);

    if (!txCols.includes('metadata')) {
      console.log('Adding metadata column to Transaction...');
      await client.query(`ALTER TABLE "Transaction" ADD COLUMN "metadata" JSONB`);
      console.log('Added metadata column.');
    } else {
      console.log('Transaction already has metadata column.');
    }

    // Check WalletTransaction note
    console.log('\nChecking WalletTransaction columns...');
    const wtRes = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'WalletTransaction'`);
    const wtCols = wtRes.rows.map(r => r.column_name);
    console.log('WalletTransaction columns:', wtCols);

    if (!wtCols.includes('note')) {
      console.log('Adding note column to WalletTransaction...');
      await client.query(`ALTER TABLE "WalletTransaction" ADD COLUMN "note" TEXT`);
      console.log('Added note column.');
    } else {
      console.log('WalletTransaction already has note column.');
    }

    // Check WalletTransaction reference
    if (!wtCols.includes('reference')) {
      console.log('Adding reference column to WalletTransaction...');
      await client.query(`ALTER TABLE "WalletTransaction" ADD COLUMN "reference" TEXT`);
      console.log('Added reference column.');
    }

    // Check WalletTransaction source
    if (!wtCols.includes('source')) {
      console.log('Adding source column to WalletTransaction...');
      await client.query(`ALTER TABLE "WalletTransaction" ADD COLUMN "source" TEXT`);
      console.log('Added source column.');
    }
    
    // Check Notification type
    console.log('\nChecking Notification columns...');
    const notifRes = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Notification'`);
    const notifCols = notifRes.rows.map(r => r.column_name);
    console.log('Notification columns:', notifCols);
    
    // If 'type' is missing, add it
    if (!notifCols.includes('type')) {
        console.log('Adding type column to Notification...');
        await client.query(`ALTER TABLE "Notification" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'general'`);
        console.log('Added type column.');
    }

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}

main();
