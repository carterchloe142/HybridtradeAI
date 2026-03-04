
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Supabase requires SSL
});

async function createTable() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected.');

    const query = `
      CREATE TABLE IF NOT EXISTS "Setting" (
        "key" TEXT PRIMARY KEY,
        "value" TEXT NOT NULL
      );
    `;
    
    await client.query(query);
    console.log('Setting table created successfully.');
    
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await client.end();
  }
}

createTable();
