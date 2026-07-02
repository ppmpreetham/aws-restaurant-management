import { useEffect, useState } from 'react';
import { api } from '../api/restaurantApi';
import type { MenuItem, Restaurant } from '../types';
import { RestaurantCard } from '../components/RestaurantCard';
import { MenuList } from '../components/MenuList';

export function Browse() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getRestaurants()
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.getMenu(selected.id).then(setMenu).catch((err) => setError(err.message));
  }, [selected]);

  if (loading) return <p className="empty-state">Loading restaurants…</p>;
  if (error) return <p className="empty-state empty-state--error">{error}</p>;

  return (
    <div className="browse-layout">
      <div className="restaurant-grid">
        {restaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
            selected={selected?.id === r.id}
            onSelect={setSelected}
          />
        ))}
      </div>

      <div className="menu-panel">
        {selected ? (
          <>
            <h2>{selected.name}</h2>
            <p className="menu-panel__subtitle">{selected.address}</p>
            <MenuList items={menu} />
          </>
        ) : (
          <p className="empty-state">Pick a restaurant to see its menu.</p>
        )}
      </div>
    </div>
  );
}
