const { Client } = require('pg');
const client = new Client('postgresql://postgres:legacy@127.0.0.1:5432/mockcenter');
client.connect()
  .then(() => client.query(`ALTER TABLE users ALTER COLUMN email_verified DROP DEFAULT`))
  .then(() => client.query(`ALTER TABLE users ALTER COLUMN email_verified TYPE boolean USING (email_verified IN ('true', '1', 't'))`))
  .then(() => client.query(`ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false`))
  .then(() => {
    console.log("Migration fixed successfully.");
    return client.end();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
