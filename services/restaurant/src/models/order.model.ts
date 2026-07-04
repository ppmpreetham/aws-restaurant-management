import { pool } from '../db';
import { RestaurantOrder, RestaurantOrderStatus } from '../types';

export interface ExtendedRestaurantOrder extends RestaurantOrder {
  reason?: string | null;
}

export interface CreateIncomingOrderInput {
  restaurantId: number;
  externalOrderId: string;
  itemsSnapshot: unknown;
}

export async function createIncomingOrder(
  input: CreateIncomingOrderInput
): Promise<RestaurantOrder> {
  const result = await pool.query<RestaurantOrder>(
    `INSERT INTO restaurant_orders (restaurant_id, external_order_id, items_snapshot, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING *`,
    [input.restaurantId, input.externalOrderId, JSON.stringify(input.itemsSnapshot ?? null)]
  );
  return result.rows[0];
}

export async function getOrdersForRestaurant(restaurantId: number): Promise<RestaurantOrder[]> {
  const result = await pool.query<RestaurantOrder>(
    `SELECT * FROM restaurant_orders WHERE restaurant_id = $1 ORDER BY created_at DESC`,
    [restaurantId]
  );
  return result.rows;
}

export async function getOrderById(
  restaurantId: number,
  orderId: number
): Promise<RestaurantOrder | null> {
  const result = await pool.query<RestaurantOrder>(
    `SELECT * FROM restaurant_orders WHERE id = $1 AND restaurant_id = $2`,
    [orderId, restaurantId]
  );
  return result.rows[0] ?? null;
}

export async function updateOrderStatus(
  restaurantId: number,
  orderId: number,
  status: RestaurantOrderStatus,
  reason?: string
): Promise<RestaurantOrder | null> {
  const result = await pool.query<RestaurantOrder>(
    `UPDATE restaurant_orders
     SET status = $3, reason = $4, updated_at = NOW()
     WHERE id = $1 AND restaurant_id = $2
     RETURNING *`,
    [orderId, restaurantId, status, reason ?? null]
  );
  return result.rows[0] ?? null;
}
