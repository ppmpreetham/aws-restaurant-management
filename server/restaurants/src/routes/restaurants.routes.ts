import { Router, Request, Response } from 'express';
import * as RestaurantModel from '../models/restaurant.model';
import * as MenuModel from '../models/menu.model';
import * as OrderModel from '../models/order.model';
import { RestaurantOrderStatus } from '../types';

const router = Router();

function asId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ---- Restaurants -----------------------------------------------------

// GET /api/restaurants - list all restaurants (used by browse page + search service)
router.get('/restaurants', async (_req: Request, res: Response) => {
  const restaurants = await RestaurantModel.getAllRestaurants();
  res.json(restaurants);
});

// GET /api/restaurants/:id - single restaurant
router.get('/restaurants/:id', async (req: Request, res: Response) => {
  const id = asId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid restaurant id' });

  const restaurant = await RestaurantModel.getRestaurantById(id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

  res.json(restaurant);
});

// POST /api/restaurants - create a restaurant (admin/seed use)
router.post('/restaurants', async (req: Request, res: Response) => {
  const { name, description, cuisineType, priceRange, address, imageUrl, maxConcurrentOrders } =
    req.body ?? {};

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' });
  }

  const restaurant = await RestaurantModel.createRestaurant({
    name,
    description,
    cuisineType,
    priceRange,
    address,
    imageUrl,
    maxConcurrentOrders,
  });
  res.status(201).json(restaurant);
});

// ---- Menu --------------------------------------------------------------

// GET /api/restaurants/:id/menu
router.get('/restaurants/:id/menu', async (req: Request, res: Response) => {
  const id = asId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid restaurant id' });

  const restaurant = await RestaurantModel.getRestaurantById(id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

  const menu = await MenuModel.getMenuByRestaurant(id);
  res.json(menu);
});

// POST /api/restaurants/:id/menu - add a menu item (admin/seed use)
router.post('/restaurants/:id/menu', async (req: Request, res: Response) => {
  const id = asId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid restaurant id' });

  const { name, description, price, category, imageUrl } = req.body ?? {};
  if (!name || typeof price !== 'number') {
    return res.status(400).json({ error: 'name and numeric price are required' });
  }

  const item = await MenuModel.addMenuItem({
    restaurantId: id,
    name,
    description,
    price,
    category,
    imageUrl,
  });
  res.status(201).json(item);
});

// PATCH /api/restaurants/:id/menu/:itemId - update a menu item
router.patch('/restaurants/:id/menu/:itemId', async (req: Request, res: Response) => {
  const itemId = asId(req.params.itemId);
  if (!itemId) return res.status(400).json({ error: 'Invalid menu item id' });

  const updated = await MenuModel.updateMenuItem(itemId, req.body ?? {});
  if (!updated) return res.status(404).json({ error: 'Menu item not found' });

  res.json(updated);
});

// ---- Inventory -----------------------------------------------------------

// GET /api/restaurants/:id/inventory - capacity status used by the ordering flow
router.get('/restaurants/:id/inventory', async (req: Request, res: Response) => {
  const id = asId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid restaurant id' });

  const restaurant = await RestaurantModel.getRestaurantById(id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

  const activeOrders = await RestaurantModel.countActiveOrders(id);
  const canAcceptOrders = restaurant.is_open && activeOrders < restaurant.max_concurrent_orders;

  res.json({
    restaurantId: id,
    isOpen: restaurant.is_open,
    maxConcurrentOrders: restaurant.max_concurrent_orders,
    activeOrders,
    canAcceptOrders,
  });
});

// ---- Orders (restaurant's side of the ordering flow) ---------------------

// POST /api/restaurants/:id/orders
// Called by the Order service when a customer places an order.
// Fails fast (409) if the restaurant is closed or at capacity, so Order MS
// can tell the customer immediately instead of waiting on a human.
router.post('/restaurants/:id/orders', async (req: Request, res: Response) => {
  const id = asId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid restaurant id' });

  const { externalOrderId, items } = req.body ?? {};
  if (!externalOrderId) {
    return res.status(400).json({ error: 'externalOrderId is required' });
  }

  const restaurant = await RestaurantModel.getRestaurantById(id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

  const activeOrders = await RestaurantModel.countActiveOrders(id);
  const hasCapacity = restaurant.is_open && activeOrders < restaurant.max_concurrent_orders;

  if (!hasCapacity) {
    return res.status(409).json({
      error: 'Restaurant cannot accept this order right now',
      canAcceptOrders: false,
    });
  }

  const order = await OrderModel.createIncomingOrder({
    restaurantId: id,
    externalOrderId,
    itemsSnapshot: items,
  });

  res.status(201).json(order);
});

// GET /api/restaurants/:id/orders - restaurant owner's dashboard list
router.get('/restaurants/:id/orders', async (req: Request, res: Response) => {
  const id = asId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid restaurant id' });

  const orders = await OrderModel.getOrdersForRestaurant(id);
  res.json(orders);
});

// PATCH /api/restaurants/:id/orders/:orderId - restaurant accepts/rejects/completes
// Body: { "status": "accepted" | "rejected" | "completed" }
router.patch('/restaurants/:id/orders/:orderId', async (req: Request, res: Response) => {
  const id = asId(req.params.id);
  const orderId = asId(req.params.orderId);
  if (!id || !orderId) return res.status(400).json({ error: 'Invalid id' });

  const { status } = req.body ?? {};
  const validStatuses: RestaurantOrderStatus[] = ['accepted', 'rejected', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${validStatuses.join(', ')}` });
  }

  const existing = await OrderModel.getOrderById(id, orderId);
  if (!existing) return res.status(404).json({ error: 'Order not found for this restaurant' });

  const updated = await OrderModel.updateOrderStatus(id, orderId, status);
  res.json(updated);
});

// Same action as above, exposed as the query-param style from the original
// team diagram (POST /order?status=accept/reject) for compatibility.
router.post('/restaurants/:id/orders/:orderId', async (req: Request, res: Response) => {
  const id = asId(req.params.id);
  const orderId = asId(req.params.orderId);
  if (!id || !orderId) return res.status(400).json({ error: 'Invalid id' });

  const statusParam = String(req.query.status ?? '');
  const map: Record<string, RestaurantOrderStatus> = {
    accept: 'accepted',
    reject: 'rejected',
  };
  const status = map[statusParam];
  if (!status) return res.status(400).json({ error: 'status query param must be accept or reject' });

  const existing = await OrderModel.getOrderById(id, orderId);
  if (!existing) return res.status(404).json({ error: 'Order not found for this restaurant' });

  const updated = await OrderModel.updateOrderStatus(id, orderId, status);
  res.json(updated);
});

export default router;
