import dotenv from 'dotenv';
dotenv.config();

import { pool } from './db';

const demoTables = [
  { restaurantId: 1, tableNumber: 'R1-T2A', capacity: 2 },
  { restaurantId: 1, tableNumber: 'R1-T2B', capacity: 2 },
  { restaurantId: 1, tableNumber: 'R1-T4A', capacity: 4 },
  { restaurantId: 1, tableNumber: 'R1-T4B', capacity: 4 },
  { restaurantId: 1, tableNumber: 'R1-T6A', capacity: 6 },
  { restaurantId: 2, tableNumber: 'R2-T2A', capacity: 2 },
  { restaurantId: 2, tableNumber: 'R2-T4A', capacity: 4 },
  { restaurantId: 2, tableNumber: 'R2-T6A', capacity: 6 },
  { restaurantId: 3, tableNumber: 'R3-T2A', capacity: 2 },
  { restaurantId: 3, tableNumber: 'R3-T4A', capacity: 4 },
  { restaurantId: 3, tableNumber: 'R3-T4B', capacity: 4 },
];

async function seed() {
  console.log('Seeding reservation tables...');

  for (const table of demoTables) {
    await pool.query(
      `INSERT INTO reservation_tables (restaurant_id, table_number, capacity)
       VALUES ($1, $2, $3)
       ON CONFLICT (restaurant_id, table_number) DO NOTHING`,
      [table.restaurantId, table.tableNumber, table.capacity]
    );
  }

  console.log(`Done. ${demoTables.length} demo table definitions are available.`);
  await pool.end();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
