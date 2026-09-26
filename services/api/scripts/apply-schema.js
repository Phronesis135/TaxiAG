// Applies src/auth/schema.sql to DATABASE_URL (repo-root .env). Re-runnable.
const { configDotenv } = require('dotenv');
const { readFileSync } = require('fs');
const { join } = require('path');
const { Client } = require('pg');

configDotenv({ path: join(__dirname, '..', '..', '..', '.env') });

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(
    readFileSync(join(__dirname, '..', 'src', 'auth', 'schema.sql'), 'utf8'),
  );
  await client.end();
  console.log('schema-applied');
})().catch((err) => {
  console.error(`schema-failed: ${err.message}`);
  process.exit(1);
});
