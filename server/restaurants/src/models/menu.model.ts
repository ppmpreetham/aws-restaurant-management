import { pool } from '../db';
import { MenuItem } from '../types';

export async function getMenuByRestaurant(restaurantId: number): Promise<MenuItem[]> {
  const result = await pool.query<MenuItem>(
    `SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY category, name`,
    [restaurantId]
  );
  return result.rows;
}

export interface CreateMenuItemInput {
  restaurantId: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
}

export async function addMenuItem(input: CreateMenuItemInput): Promise<MenuItem> {
  const result = await pool.query<MenuItem>(
    `INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.restaurantId,
      input.name,
      input.description ?? null,
      input.price,
      input.category ?? null,
      input.imageUrl ?? null,
    ]
  );
  return result.rows[0];
}

export async function updateMenuItem(
  id: number,
  updates: Partial<Pick<MenuItem, 'name' | 'description' | 'price' | 'category' | 'is_available'>>
): Promise<MenuItem | null> {
  const fields = Object.keys(updates);
  if (fields.length === 0) {
    const existing = await pool.query<MenuItem>(`SELECT * FROM menu_items WHERE id = $1`, [id]);
    return existing.rows[0] ?? null;
  }

  const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');
  const values = fields.map((field) => (updates as Record<string, unknown>)[field]);

  const result = await pool.query<MenuItem>(
    `UPDATE menu_items SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return result.rows[0] ?? null;
}
