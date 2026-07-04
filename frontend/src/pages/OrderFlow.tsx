import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/restaurantApi';
import { placeOrder } from '../api/orderAPI';
import { Button } from '../components/Button';
import { useStore } from '../useStore';
import type { MenuItem } from '../types';

export function OrderFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => api.getRestaurant(Number(id)),
    enabled: !!id
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory', id],
    queryFn: () => api.getInventory(Number(id)),
    enabled: !!id,
    refetchInterval: 5000 // Poll every 5s for live queue status
  });

  const { data: menu } = useQuery({
    queryKey: ['menu', id],
    queryFn: () => api.getMenu(Number(id)),
    enabled: !!id
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.item.id === item.id);
      if (existing) {
        return prev.map(p => p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(p => p.item.id !== itemId));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, curr) => acc + (Number(curr.item.price) * curr.quantity), 0);
    const taxes = subtotal * 0.08; // 8% tax
    return { subtotal, taxes, total: subtotal + taxes };
  }, [cart]);

  const credits = useStore((state) => state.credits);
  const hasEnoughCredits = credits >= totals.total;

  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!restaurant || !hasEnoughCredits) return;
    setIsPlacing(true);
    setError(null);
    try {
      await placeOrder({
        customerName: 'Guest', // Hardcoded for now
        restaurantId: restaurant.id,
        items: cart.map(c => ({
          name: c.item.name,
          quantity: c.quantity,
          price: Number(c.item.price)
        }))
      });
      navigate('/payment', { state: { type: 'ORDER', amount: totals.total, restaurantName: restaurant.name } });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsPlacing(false);
    }
  };

  if (isLoading || !restaurant) {
    return <div className="animate-pulse font-[var(--font-mono)] text-[var(--text-secondary)]">[ LOADING_MENU... ]</div>;
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-7xl mx-auto">
      <header className="mb-8 md:mb-12 border-b border-[var(--border)] pb-6 md:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] tracking-widest uppercase mb-4">
            ORDER / {restaurant.name}
          </div>
          <h1 className="font-[var(--font-doto)] text-4xl md:text-[var(--display-lg)] text-[var(--text-display)] tracking-tighter leading-none">
            MENU
          </h1>
        </div>
        {inventory && (
          <div className="font-[var(--font-mono)] text-[var(--label)] uppercase tracking-widest bg-[var(--surface-raised)] p-3 border border-[var(--border-visible)] self-start md:self-auto">
            <span className="text-[var(--text-secondary)]">QUEUE LENGTH: </span>
            <span className={inventory.canAcceptOrders ? 'text-[var(--text-primary)]' : 'text-[var(--accent)] font-bold'}>
              {inventory.activeOrders} ORDERS AHEAD
            </span>
          </div>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-8 md:gap-12 relative">
        <div className="flex-1">
          {menu && menu.length === 0 && (
            <div className="text-[var(--text-secondary)]">No menu items found.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menu?.map(item => (
              <div key={item.id} className="border border-[var(--border-visible)] p-6 bg-[var(--surface)] flex flex-col hover:border-[var(--text-secondary)] transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-[var(--font-body)] text-xl font-bold">{item.name}</h3>
                  <span className="font-[var(--font-mono)] text-lg">${Number(item.price).toFixed(2)}</span>
                </div>
                <p className="text-[var(--text-secondary)] mb-6 flex-1">
                  {item.description}
                </p>
                <Button variant="outline" className="w-full" onClick={() => addToCart(item)}>
                  [ ADD TO CART ]
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-full lg:w-96 shrink-0 order-first lg:order-last mb-8 lg:mb-0">
          <div className="sticky top-8 border border-[var(--border-visible)] p-8 bg-[var(--surface-raised)] relative">
            <div className="absolute inset-0 bg-[var(--surface-raised)] opacity-90"></div>
            <div className="relative">
              <h3 className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest mb-8 border-b border-[var(--border)] pb-4">
                ORDER TICKET
              </h3>
              
              <div className="space-y-6 mb-8 min-h-[200px]">
                {cart.length === 0 ? (
                  <div className="font-[var(--font-mono)] text-[var(--text-disabled)] text-sm text-center py-12">
                    [ CART IS EMPTY ]
                  </div>
                ) : (
                  cart.map(c => (
                    <div key={c.item.id} className="flex justify-between items-start font-[var(--font-mono)] text-sm">
                      <div className="flex-1">
                        <div className="flex gap-2">
                          <span className="text-[var(--text-secondary)]">{c.quantity}x</span>
                          <span className="text-[var(--text-primary)] uppercase">{c.item.name}</span>
                        </div>
                        <button 
                          onClick={() => removeFromCart(c.item.id)}
                          className="text-[var(--accent)] text-xs mt-1 hover:underline"
                        >
                          REMOVE
                        </button>
                      </div>
                      <span className="text-[var(--text-primary)]">
                        ${(Number(c.item.price) * c.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4 font-[var(--font-mono)] text-sm mb-8 border-t border-[var(--border)] pt-6">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>SUBTOTAL</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>TAX (5%)</span>
                  <span>${totals.taxes.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-[var(--border)] pt-6 mb-8">
                <span className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest">
                  TOTAL
                </span>
                <span className="font-[var(--font-doto)] text-4xl text-[var(--text-display)]">
                  ${totals.total.toFixed(2)}
                </span>
              </div>

              {error && (
                <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--error)] uppercase mb-4 text-center">
                  [ ERROR: {error} ]
                </div>
              )}

              <Button 
                variant={!hasEnoughCredits ? "danger" : "primary"}
                className="w-full" 
                disabled={cart.length === 0 || isPlacing || !hasEnoughCredits}
                onClick={handlePay}
              >
                {!hasEnoughCredits ? '[ INSUFFICIENT CREDITS ]' : isPlacing ? '[ PROCESSING... ]' : '[ CHECKOUT ]'}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
