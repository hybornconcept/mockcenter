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
    const { rows: subjects } = await client.query('SELECT id, name, exam_id FROM subjects WHERE name ILIKE \'%Biology%\'');
    console.log('Biology subjects:', subjects);
    
    const examIds = subjects.map(s => s.exam_id);
    const { rows: exams } = await client.query('SELECT id, name FROM exams WHERE id = ANY($1)', [examIds]);
    console.log('Exams for these subjects:', exams);
  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
