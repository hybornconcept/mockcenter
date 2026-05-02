const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function fix() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  const client = await pool.connect();
  try {
    console.log('Fetching subjects...');
    const { rows: allSubs } = await client.query('SELECT id, name, exam_id FROM subjects');
    
    const groups = {};
    allSubs.forEach(s => {
      const key = `${s.exam_id}-${s.name.toLowerCase().trim()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });

    for (const [key, subs] of Object.entries(groups)) {
      if (subs.length > 1) {
        console.log(`Found duplicates for "${key}":`, subs.map(s => s.name));
        const master = subs[0];
        const duplicates = subs.slice(1);
        
        for (const dup of duplicates) {
          console.log(`Merging subject "${dup.name}" (${dup.id}) into "${master.name}" (${master.id})...`);
          await client.query('UPDATE questions SET subject_id = $1 WHERE subject_id = $2', [master.id, dup.id]);
          await client.query('DELETE FROM subjects WHERE id = $1', [dup.id]);
        }
      }
    }
    console.log('Subject cleanup complete!');
  } finally {
    client.release();
    await pool.end();
  }
}

fix().catch(console.error);
