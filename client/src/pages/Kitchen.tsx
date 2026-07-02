import { useEffect, useState } from 'react';
import { api } from '../api/restaurantApi';
import type { InventoryStatus, Restaurant, RestaurantOrder } from '../types';
import { OrderTicket } from '../components/OrderTicket';

export function Kitchen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getRestaurants().then((data) => {
      setRestaurants(data);
      if (data.length > 0) setRestaurantId(data[0].id);
    });
  }, []);

  const refresh = (id: number) => {
    api.getOrders(id).then(setOrders).catch((e) => setError(e.message));
    api.getInventory(id).then(setInventory).catch((e) => setError(e.message));
  };

  useEffect(() => {
    if (restaurantId !== null) refresh(restaurantId);
  }, [restaurantId]);

  // Poll every 5s so new incoming orders show up without a manual refresh -
  // stands in for the real-time push you'd normally get from SNS/websockets.
  useEffect(() => {
    if (restaurantId === null) return;
    const interval = setInterval(() => refresh(restaurantId), 5000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const handleDecision = async (orderId: number, status: 'accepted' | 'rejected') => {
    if (restaurantId === null) return;
    setBusyId(orderId);
    try {
      await api.updateOrderStatus(restaurantId, orderId, status);
      refresh(restaurantId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const handleComplete = async (orderId: number) => {
    if (restaurantId === null) return;
    setBusyId(orderId);
    try {
      await api.updateOrderStatus(restaurantId, orderId, 'completed');
      refresh(restaurantId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="kitchen-layout">
      <div className="kitchen-header">
        <label>
          Restaurant
          <select
            value={restaurantId ?? ''}
            onChange={(e) => setRestaurantId(Number(e.target.value))}
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        {inventory && (
          <div className="capacity-meter">
            <span>
              {inventory.activeOrders} / {inventory.maxConcurrentOrders} active
            </span>
            <span className={`badge ${inventory.canAcceptOrders ? 'badge--accepted' : 'badge--rejected'}`}>
              {inventory.canAcceptOrders ? 'Accepting orders' : 'At capacity'}
            </span>
          </div>
        )}
      </div>

      {error && <p className="empty-state empty-state--error">{error}</p>}

      <div className="ticket-board">
        {orders.length === 0 && <p className="empty-state">No orders yet.</p>}
        {orders.map((order) => (
          <OrderTicket
            key={order.id}
            order={order}
            onDecision={handleDecision}
            onComplete={handleComplete}
            busy={busyId === order.id}
          />
        ))}
      </div>
    </div>
  );
}
