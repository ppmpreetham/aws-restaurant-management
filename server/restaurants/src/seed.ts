// Populates a few sample restaurants + menu items so the app isn't empty for the demo.
// Run with: npm run seed

import dotenv from 'dotenv';
dotenv.config();

import { pool } from './db';

async function seed() {
  console.log('Seeding restaurants...');

  const restaurants = [
    {
      name: 'Spice Route',
      description: 'North Indian classics, tandoor specialties.',
      cuisine_type: 'Indian',
      rating: 4.5,
      price_range: '$$',
      address: '12 MG Road',
      image_url: 'https://picsum.photos/seed/spice-route/400/300',
      max_concurrent_orders: 8,
    },
    {
      name: 'Bella Napoli',
      description: 'Wood-fired pizza and fresh pasta.',
      cuisine_type: 'Italian',
      rating: 4.2,
      price_range: '$$$',
      address: '45 Church Street',
      image_url: 'https://picsum.photos/seed/bella-napoli/400/300',
      max_concurrent_orders: 5,
    },
    {
      name: 'Dragon Wok',
      description: 'Fast, fresh Chinese takeout.',
      cuisine_type: 'Chinese',
      rating: 4.0,
      price_range: '$',
      address: '9 Brigade Road',
      image_url: 'https://picsum.photos/seed/dragon-wok/400/300',
      max_concurrent_orders: 12,
    },
  ];

  const menus: Record<string, { name: string; description: string; price: number; category: string }[]> = {
    'Spice Route': [
      { name: 'Butter Chicken', description: 'Tomato-based curry, tandoor chicken.', price: 320, category: 'Main' },
      { name: 'Paneer Tikka', description: 'Grilled cottage cheese skewers.', price: 260, category: 'Starter' },
      { name: 'Garlic Naan', description: 'Tandoor bread with garlic.', price: 70, category: 'Bread' },
    ],
    'Bella Napoli': [
      { name: 'Margherita Pizza', description: 'Tomato, mozzarella, basil.', price: 380, category: 'Pizza' },
      { name: 'Spaghetti Carbonara', description: 'Egg, pancetta, parmesan.', price: 420, category: 'Pasta' },
    ],
    'Dragon Wok': [
      { name: 'Veg Fried Rice', description: 'Wok-tossed rice, seasonal veg.', price: 180, category: 'Rice' },
      { name: 'Chilli Chicken', description: 'Indo-Chinese classic.', price: 240, category: 'Main' },
    ],
  };

  for (const r of restaurants) {
    const result = await pool.query(
      `INSERT INTO restaurants
        (name, description, cuisine_type, rating, price_range, address, image_url, max_concurrent_orders)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name`,
      [r.name, r.description, r.cuisine_type, r.rating, r.price_range, r.address, r.image_url, r.max_concurrent_orders]
    );
    const { id, name } = result.rows[0];
    console.log(`  created restaurant #${id} - ${name}`);

    for (const item of menus[r.name] ?? []) {
      await pool.query(
        `INSERT INTO menu_items (restaurant_id, name, description, price, category)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, item.name, item.description, item.price, item.category]
      );
    }
  }

  console.log('Done.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
