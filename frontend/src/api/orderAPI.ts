import { useStore } from "../useStore";

const BASE_URL = import.meta.env.VITE_ORDER_API_URL ?? "/api/orders";

function getHeaders() {
  const token = useStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  customerName: string;
  restaurantId: number;
  items: OrderItem[];
}

export interface OrderResponse {
  id: number;
  customer_name: string;
  restaurant_id: number;
  status: string;
  total: number;
  created_at: string;
}

export async function placeOrder(
  order: CreateOrderRequest
): Promise<OrderResponse> {
  const response = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to place order");
  }

  return response.json();
}

export async function getOrders() {
  const response = await fetch(`${BASE_URL}`, { headers: getHeaders() });

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
}

export async function getOrder(id: number) {
  const response = await fetch(`${BASE_URL}/${id}`, { headers: getHeaders() });

  if (!response.ok) {
    throw new Error("Failed to fetch order");
  }

  return response.json();
}

export async function cancelOrder(id: number) {
  const response = await fetch(`${BASE_URL}/${id}/cancel`, {
    method: "PATCH",
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error("Failed to cancel order");
  }

  return response.json();
}