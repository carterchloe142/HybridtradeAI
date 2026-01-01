const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  // Fallback to the one seen in fix-db-schema.js if env is missing, though we should prefer env
  connectionString = 'postgresql://postgres:Odogwuokaka15@db.wdlcttgfwoejqynlylpv.supabase.co:5432/postgres?sslmode=require';
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Checking InvestmentPlan columns...');
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'InvestmentPlan' OR table_name = 'investment_plan' OR table_name = 'Investment_Plan'
      ORDER BY column_name;
    `);
    
    if (res.rows.length === 0) {
        console.log("Table 'InvestmentPlan' (case insensitive) not found.");
        // Try listing all tables to see what's there
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log("Tables found:", tables.rows.map(r => r.table_name));
    } else {
        console.log('Columns found:', res.rows);
    }

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}

main();
