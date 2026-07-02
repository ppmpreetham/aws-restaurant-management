import { pool } from '../db';
import { Restaurant } from '../types';

export async function getAllRestaurants(): Promise<Restaurant[]> {
  const result = await pool.query<Restaurant>(
    `SELECT * FROM restaurants ORDER BY rating DESC, id ASC`
  );
  return result.rows;
}

export async function getRestaurantById(id: number): Promise<Restaurant | null> {
  const result = await pool.query<Restaurant>(
    `SELECT * FROM restaurants WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export interface CreateRestaurantInput {
  name: string;
  description?: string;
  cuisineType?: string;
  priceRange?: string;
  address?: string;
  imageUrl?: string;
  maxConcurrentOrders?: number;
}

export async function createRestaurant(input: CreateRestaurantInput): Promise<Restaurant> {
  const result = await pool.query<Restaurant>(
    `INSERT INTO restaurants
      (name, description, cuisine_type, price_range, address, image_url, max_concurrent_orders)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 10))
     RETURNING *`,
    [
      input.name,
      input.description ?? null,
      input.cuisineType ?? null,
      input.priceRange ?? null,
      input.address ?? null,
      input.imageUrl ?? null,
      input.maxConcurrentOrders ?? null,
    ]
  );
  return result.rows[0];
}

export async function countActiveOrders(restaurantId: number): Promise<number> {
  // "Active" = accepted but not yet completed — i.e. currently occupying kitchen capacity.
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM restaurant_orders WHERE restaurant_id = $1 AND status = 'accepted'`,
    [restaurantId]
  );
  return parseInt(result.rows[0].count, 10);
}
