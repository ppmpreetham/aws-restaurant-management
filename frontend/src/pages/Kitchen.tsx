import { useEffect, useState } from "react"
import { api } from "../api/restaurantApi"
import type { InventoryStatus, Restaurant, RestaurantOrder } from "../types"
import { OrderTicket } from "../components/OrderTicket"

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

  const handleDecision = async (orderId: number, status: "accepted" | "rejected") => {
    if (restaurantId === null) return
    setBusyId(orderId)
    try {
      await api.updateOrderStatus(restaurantId, orderId, status)
      refresh(restaurantId)
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
      <header className="mb-12 border-b border-[var(--border)] pb-8 flex justify-between items-end">
        <div>
          <h1 className="font-[var(--font-doto)] text-[var(--display-lg)] leading-none mb-4 tracking-tighter text-[var(--accent)]">
            KITCHEN
          </h1>
          <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest gap-2 flex flex-col w-75">
            <label className="mr-4 text-[var(--text-primary)]">LOCATION:</label>
            <select
              value={restaurantId ?? ""}
              onChange={(e) => setRestaurantId(Number(e.target.value))}
              className="w-full bg-transparent border border-[var(--border-visible)] p-2 focus:outline-none focus:border-[var(--text-primary)] transition-colors text-[var(--text-primary)]"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id} className="bg-[var(--black)]">
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {inventory && (
          <div className="text-right">
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
