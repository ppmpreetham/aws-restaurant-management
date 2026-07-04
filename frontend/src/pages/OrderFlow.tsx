import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/restaurantApi';
import { placeOrder } from '../api/orderAPI';
import { Button } from '../components/Button';
import type { MenuItem } from '../types';

export function OrderFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => api.getRestaurant(Number(id)),
    enabled: !!id
  });

  const { data: menu, isLoading } = useQuery({
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
    const taxes = subtotal * 0.05;
    return { subtotal, taxes, total: subtotal + taxes };
  }, [cart]);

  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!restaurant) return;
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
    <div className="animate-in fade-in duration-300">
      <header className="mb-12 border-b border-[var(--border)] pb-8">
        <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] tracking-widest uppercase mb-4">
          ORDER / {restaurant.name}
        </div>
        <h1 className="font-[var(--font-doto)] text-[var(--display-lg)] text-[var(--text-display)] tracking-tighter leading-none">
          MENU
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Menu Grid */}
        <div className="lg:col-span-2">
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
        <div>
          <div className="border border-[var(--border-visible)] p-8 bg-[var(--surface-raised)] sticky top-8 dot-grid-subtle relative">
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
                variant="primary" 
                className="w-full" 
                disabled={cart.length === 0 || isPlacing}
                onClick={handlePay}
              >
                {isPlacing ? '[ PROCESSING... ]' : '[ CHECKOUT ]'}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
