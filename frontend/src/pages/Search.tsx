import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/restaurantApi';
import { RestaurantCard } from '../components/RestaurantCard';

export function Search() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: api.getRestaurants
  });

  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];
    return restaurants.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [restaurants, searchTerm]);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 md:mb-12 border-b border-[var(--border)] pb-6 md:pb-8 gap-6">
        <div>
          <h1 className="font-[var(--font-doto)] text-4xl md:text-[var(--display-lg)] text-[var(--text-display)] tracking-tighter leading-none mb-4">
            BROWSE
          </h1>
          <p className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest">
            {filteredRestaurants.length} RESTAURANTS FOUND
          </p>
        </div>

        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="[ SEARCH RESTAURANTS... ]"
            className="w-full bg-transparent border border-[var(--border-visible)] p-4 font-[var(--font-mono)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors placeholder:text-[var(--text-disabled)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">
          [ LOADING_DATA... ]
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRestaurants.map(restaurant => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}
