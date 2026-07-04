import type { InventoryStatus, MenuItem, Restaurant, RestaurantOrder, OrderStatus } from '../types';

// Set VITE_API_URL in a .env file at the frontend root, e.g.:
//   VITE_API_URL=http://localhost:8080/api           (local)
//   VITE_API_URL=http://<ec2-public-ip>:8080/api      (deployed)
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getRestaurants: () => request<Restaurant[]>('/restaurants'),
  getRestaurant: (id: number) => request<Restaurant>(`/restaurants/${id}`),
  getMenu: (restaurantId: number) => request<MenuItem[]>(`/restaurants/${restaurantId}/menu`),
  getInventory: (restaurantId: number) =>
    request<InventoryStatus>(`/restaurants/${restaurantId}/inventory`),
  getOrders: (restaurantId: number) =>
    request<RestaurantOrder[]>(`/restaurants/${restaurantId}/orders`),
  updateOrderStatus: (restaurantId: number, orderId: number, status: OrderStatus) =>
    request<RestaurantOrder>(`/restaurants/${restaurantId}/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
