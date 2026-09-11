require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[ERROR] DATABASE_URL is not set in .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('[1/3] Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('[2/3] Reading supabase_schema.sql...');
    const sqlPath = path.join(__dirname, 'supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('[3/3] Executing schema SQL script...');
    const res = await client.query(sql);

    console.log('---------------------------------------------------------');
    console.log(' SUCCESS! All Supabase tables have been created!');
    console.log('---------------------------------------------------------');
  } catch (err) {
    console.error('[ERROR] Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
