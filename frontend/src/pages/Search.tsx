import { useQuery } from '@tanstack/react-query';
import { api } from '../api/restaurantApi';
import { RestaurantCard } from '../components/RestaurantCard';

export function Search() {
  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: api.getRestaurants
  });

  return (
    <div className="animate-in fade-in duration-300">
      <header className="mb-16">
        <h1 className="font-[var(--font-doto)] text-[var(--display-lg)] leading-none mb-4 tracking-tighter">
          SEARCH
        </h1>
        <p className="font-[var(--font-body)] text-[var(--text-secondary)] text-lg">
          Browse available restaurants.
        </p>
      </header>

      {isLoading && (
        <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">
          [ LOADING_DATA... ]
        </div>
      )}

      {error && (
        <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--error)] uppercase tracking-widest">
          [ ERROR: FAILED TO FETCH RESTAURANTS ]
        </div>
      )}

      {restaurants && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}
