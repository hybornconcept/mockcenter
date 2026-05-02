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
    console.log('Fetching exams...');
    const { rows: allExams } = await client.query('SELECT id, name FROM exams');
    
    const groups = {};
    allExams.forEach(e => {
      const lower = e.name.toLowerCase().trim();
      if (!groups[lower]) groups[lower] = [];
      groups[lower].push(e);
    });

    for (const [lower, exams] of Object.entries(groups)) {
      if (exams.length > 1) {
        console.log(`Found duplicates for "${lower}":`, exams.map(e => e.name));
        
        // Pick the one with the most uppercase letters or just the first one
        const master = exams.sort((a, b) => b.name.length - a.name.length || b.name.localeCompare(a.name))[0];
        const duplicates = exams.filter(e => e.id !== master.id);
        
        for (const dup of duplicates) {
          console.log(`Merging "${dup.name}" (${dup.id}) into "${master.name}" (${master.id})...`);
          
          // Update questions
          await client.query('UPDATE questions SET exam_id = $1 WHERE exam_id = $2', [master.id, dup.id]);
          
          // Update subjects
          await client.query('UPDATE subjects SET exam_id = $1 WHERE exam_id = $2', [master.id, dup.id]);
          
          // Delete duplicate exam
          await client.query('DELETE FROM exams WHERE id = $1', [dup.id]);
        }
      }
    }
    console.log('Cleanup complete!');
  } finally {
    client.release();
    await pool.end();
  }
}

fix().catch(console.error);
