const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  connectionString = 'postgresql://postgres:Odogwuokaka15@db.wdlcttgfwoejqynlylpv.supabase.co:5432/postgres?sslmode=require';
}
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Checking Transaction columns...');
    const txColsRes = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Transaction' AND table_schema = 'public';`);
    const txCols = txColsRes.rows || [];
    const txHasMetadata = txCols.some(c => c.column_name === 'metadata');
    if (!txHasMetadata) {
      console.log('Adding metadata column to Transaction...');
      await pool.query(`ALTER TABLE "Transaction" ADD COLUMN "metadata" JSONB;`);
      console.log('Added metadata column.');
    } else {
      console.log('Transaction already has metadata column.');
    }

    console.log('\nChecking WalletTransaction columns...');
    const wtColsRes = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'WalletTransaction' AND table_schema = 'public';`);
    const wtCols = wtColsRes.rows || [];
    const wtHasNote = wtCols.some(c => c.column_name === 'note');
    if (!wtHasNote) {
      console.log('Adding note column to WalletTransaction...');
      await pool.query(`ALTER TABLE "WalletTransaction" ADD COLUMN "note" TEXT;`);
      console.log('Added note column.');
    } else {
      console.log('WalletTransaction already has note column.');
    }

    console.log('\nChecking Notification columns...');
    const notifColsRes = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Notification' AND table_schema = 'public';`);
    const notifCols = notifColsRes.rows || [];
    console.log('Notification columns:', notifCols.map(c => c.column_name));
    const notifHasType = notifCols.some(c => c.column_name === 'type');
    if (!notifHasType) {
      console.log('Notification table is missing "type" column!');
      await pool.query(`ALTER TABLE "Notification" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'general';`);
      console.log('Added "type" column to Notification with default \'general\'.');
    }

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}

main();
