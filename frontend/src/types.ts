export interface Restaurant {
  id: number;
  name: string;
  description: string | null;
  cuisine_type: string | null;
  rating: string;
  price_range: string | null;
  address: string | null;
  image_url: string | null;
  is_open: boolean;
  max_concurrent_orders: number;
}

export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  is_available: boolean;
}

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface RestaurantOrder {
  id: number;
  external_order_id: string;
  restaurant_id: number;
  items_snapshot: unknown;
  status: OrderStatus;
  reason?: string;
  created_at: string;
}

export interface InventoryStatus {
  restaurantId: number;
  isOpen: boolean;
  maxConcurrentOrders: number;
  activeOrders: number;
  canAcceptOrders: boolean;
}
