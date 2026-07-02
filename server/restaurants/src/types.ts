export interface Restaurant {
  id: number;
  name: string;
  description: string | null;
  cuisine_type: string | null;
  rating: number;
  price_range: string | null;
  address: string | null;
  image_url: string | null;
  is_open: boolean;
  max_concurrent_orders: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}

export type RestaurantOrderStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface RestaurantOrder {
  id: number;
  external_order_id: string;
  restaurant_id: number;
  items_snapshot: unknown;
  status: RestaurantOrderStatus;
  created_at: string;
  updated_at: string;
}

export interface InventoryStatus {
  restaurantId: number;
  isOpen: boolean;
  maxConcurrentOrders: number;
  activeOrders: number;
  canAcceptOrders: boolean;
}
