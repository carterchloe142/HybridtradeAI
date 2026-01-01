
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in .env or .env.local');
    process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase in many environments
});

async function run() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected.');

    const sqlPath = path.resolve(process.cwd(), 'create_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL script...');
    // Split by semicolon to run statements individually if needed, 
    // but pg client can often handle multiple statements in one query() call.
    // We'll try one big call first.
    await client.query(sql);
    
    console.log('SQL script executed successfully.');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
