const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function check() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT id, name, exam_id FROM subjects WHERE name ILIKE \'%Biology%\'');
    console.log('Biology subjects:', JSON.stringify(rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
