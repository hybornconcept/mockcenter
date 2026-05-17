import pg from "pg";
import { config } from "dotenv";
config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // 1. Drop the old default
    await client.query(`ALTER TABLE credit_packages ALTER COLUMN is_active DROP DEFAULT;`);
    // 2. Cast the column type
    await client.query(`ALTER TABLE credit_packages ALTER COLUMN is_active TYPE boolean USING CASE is_active WHEN 'true' THEN true ELSE false END;`);
    // 3. Re-add the default as boolean
    await client.query(`ALTER TABLE credit_packages ALTER COLUMN is_active SET DEFAULT true;`);
    await client.query("COMMIT");
    console.log("✅ credit_packages.is_active cast to boolean successfully");
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("❌ Failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
