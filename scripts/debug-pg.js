const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  console.log('Testing Postgres connection...');
  console.log('URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')); // Hide password
  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

test();
