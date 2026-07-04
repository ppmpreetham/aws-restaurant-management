import { useEffect, useState } from "react"
import { api } from "../api/restaurantApi"
import type { InventoryStatus, Restaurant, RestaurantOrder } from "../types"
import { OrderTicket } from "../components/OrderTicket"
import { Dropdown } from "../components/Dropdown"

export function Kitchen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [restaurantId, setRestaurantId] = useState<number | null>(null)
  const [orders, setOrders] = useState<RestaurantOrder[]>([])
  const [inventory, setInventory] = useState<InventoryStatus | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getRestaurants().then((data) => {
      setRestaurants(data)
      if (data.length > 0) setRestaurantId(data[0].id)
    })
  }, [])

  const refresh = (id: number) => {
    api
      .getOrders(id)
      .then(setOrders)
      .catch((e) => setError(e.message))
    api
      .getInventory(id)
      .then(setInventory)
      .catch((e) => setError(e.message))
  }

  useEffect(() => {
    if (restaurantId !== null) refresh(restaurantId)
  }, [restaurantId])

  useEffect(() => {
    if (restaurantId === null) return
    const interval = setInterval(() => refresh(restaurantId), 5000)
    return () => clearInterval(interval)
  }, [restaurantId])

  const handleDecision = async (orderId: number, status: 'accepted' | 'rejected', reason?: string) => {
    if (restaurantId === null) return;
    setBusyId(orderId);
    try {
      await api.updateOrderStatus(restaurantId, orderId, status, reason);
      refresh(restaurantId);
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  const handleComplete = async (orderId: number) => {
    if (restaurantId === null) return
    setBusyId(orderId)
    try {
      await api.updateOrderStatus(restaurantId, orderId, "completed")
      refresh(restaurantId)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="animate-in fade-in duration-300">
      <header className="mb-8 md:mb-12 border-b border-[var(--border)] pb-6 md:pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="font-[var(--font-doto)] text-4xl md:text-[var(--display-lg)] leading-none mb-4 tracking-tighter text-[var(--accent)]">
            KITCHEN
          </h1>
          <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <span className="text-[var(--text-primary)]">LOCATION:</span>
            <div className="w-full md:w-64">
              <Dropdown
                value={restaurantId?.toString() ?? ''}
                onChange={(val) => setRestaurantId(Number(val))}
                options={restaurants.map(r => ({ label: r.name, value: r.id.toString() }))}
              />
            </div>
          </div>
        </div>

        {inventory && (
          <div className="md:text-right bg-[var(--surface-raised)] p-4 border border-[var(--border-visible)] md:bg-transparent md:p-0 md:border-none">
            <div className="font-[var(--font-doto)] text-4xl mb-2 tracking-tighter">
              {inventory.activeOrders}
              <span className="text-2xl text-[var(--text-secondary)]">
                /{inventory.maxConcurrentOrders}
              </span>
            </div>
            <div
              className={`font-[var(--font-mono)] text-[var(--label)] uppercase tracking-widest ${inventory.canAcceptOrders ? "text-[var(--success)]" : "text-[var(--accent)]"}`}
            >
              [{inventory.canAcceptOrders ? "ACCEPTING ORDERS" : "AT CAPACITY"}]
            </div>
          </div>
        )}
      </header>

      {error && (
        <div className="border border-[var(--accent)] text-[var(--accent)] p-4 mb-8 font-[var(--font-mono)] text-sm uppercase">
          [ERROR] {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 && (
          <div className="font-[var(--font-mono)] text-[var(--text-secondary)] uppercase tracking-widest">
            [ NO ORDERS YET ]
          </div>
        )}
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
  )
}
