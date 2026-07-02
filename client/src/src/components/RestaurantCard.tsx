import type { Restaurant } from '../types';

interface Props {
  restaurant: Restaurant;
  onSelect: (r: Restaurant) => void;
  selected: boolean;
}

export function RestaurantCard({ restaurant, onSelect, selected }: Props) {
  return (
    <button
      className={`restaurant-card ${selected ? 'restaurant-card--selected' : ''}`}
      onClick={() => onSelect(restaurant)}
    >
      <div
        className="restaurant-card__image"
        style={{ backgroundImage: `url(${restaurant.image_url ?? ''})` }}
      />
      <div className="restaurant-card__body">
        <div className="restaurant-card__top">
          <h3>{restaurant.name}</h3>
          <span className="pill">{restaurant.price_range}</span>
        </div>
        <p className="restaurant-card__meta">
          {restaurant.cuisine_type} · ★ {restaurant.rating}
        </p>
        <p className="restaurant-card__desc">{restaurant.description}</p>
        {!restaurant.is_open && <span className="badge badge--closed">Closed</span>}
      </div>
    </button>
  );
}
