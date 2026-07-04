import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/restaurantApi';
import { Button } from '../components/Button';

export function Reserve() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [partySize, setPartySize] = useState<number>(2);

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => api.getRestaurant(Number(id)),
    enabled: !!id
  });

  if (isLoading || !restaurant) {
    return <div className="animate-pulse font-[var(--font-mono)] text-[var(--text-secondary)]">[ LOADING... ]</div>;
  }

  // Dummy dates for the calendar
  const today = new Date().getDate();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(today + i);
    return {
      day: d.getDate(),
      month: d.toLocaleString('default', { month: 'short' }),
      available: i % 3 !== 0, // randomly grey out some dates
    };
  });

  const handlePay = () => {
    navigate('/payment', { state: { type: 'RESERVE', amount: 50, restaurantName: restaurant.name } });
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-5xl mx-auto">
      <header className="mb-12 border-b border-[var(--border)] pb-8">
        <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] tracking-widest uppercase mb-4">
          RESERVATION / {restaurant.name}
        </div>
        <h1 className="font-[var(--font-doto)] text-[var(--display-lg)] text-[var(--text-display)] tracking-tighter leading-none">
          BOOK TABLE
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          
          {/* Calendar Section */}
          <section>
            <h2 className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest mb-6">
              01. SELECT DATE
            </h2>
            <div className="grid grid-cols-5 md:grid-cols-7 gap-3">
              {dates.map((d, i) => (
                <button
                  key={i}
                  disabled={!d.available}
                  onClick={() => setSelectedDate(i)}
                  className={`
                    p-4 border font-[var(--font-mono)] flex flex-col items-center justify-center transition-colors
                    ${!d.available 
                      ? 'border-[var(--border)] text-[var(--text-disabled)] bg-transparent cursor-not-allowed opacity-50' 
                      : selectedDate === i
                        ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--black)]'
                        : 'border-[var(--border-visible)] text-[var(--text-primary)] hover:border-[var(--text-secondary)]'
                    }
                  `}
                >
                  <span className="text-[var(--label)] mb-1 uppercase">{d.month}</span>
                  <span className="text-2xl font-bold">{d.day}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Party Size Section */}
          <section>
            <h2 className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest mb-6">
              02. PARTY SIZE
            </h2>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5, 6].map(size => (
                <button
                  key={size}
                  onClick={() => setPartySize(size)}
                  className={`
                    w-16 h-16 border font-[var(--font-mono)] text-xl transition-colors
                    ${partySize === size
                      ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--black)]'
                      : 'border-[var(--border-visible)] text-[var(--text-primary)] hover:border-[var(--text-secondary)]'
                    }
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Invoice Sidebar */}
        <div>
          <div className="border border-[var(--border-visible)] p-8 bg-[var(--surface-raised)] sticky top-8">
            <h3 className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest mb-8 border-b border-[var(--border)] pb-4">
              SUMMARY
            </h3>
            
            <div className="space-y-4 font-[var(--font-body)] text-lg mb-8">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Table Reservation</span>
                <span>$40.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Taxes</span>
                <span>$10.00</span>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-[var(--border)] pt-6 mb-8">
              <span className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest">
                TOTAL
              </span>
              <span className="font-[var(--font-doto)] text-4xl text-[var(--text-display)]">
                $50.00
              </span>
            </div>

            <Button 
              variant="primary" 
              className="w-full" 
              disabled={selectedDate === null}
              onClick={handlePay}
            >
              [ PAY & CONFIRM ]
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
