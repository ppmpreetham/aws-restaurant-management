import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { pool } from './db';

async function migrate() {
  const candidates = [
    path.join(__dirname, 'schema.sql'),
    path.join(__dirname, '..', 'src', 'schema.sql'),
  ];
  const schemaPath = candidates.find((candidate) => fs.existsSync(candidate));

  if (!schemaPath) {
    throw new Error('Could not find schema.sql');
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('Reservation schema migrated.');
  await pool.end();
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
