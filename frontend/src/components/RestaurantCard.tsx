import { Link } from "react-router-dom";
import type { Restaurant } from "../types";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link 
      to={`/restaurant/${restaurant.id}`}
      className="group block bg-[var(--surface)] border border-[var(--border-visible)] p-6 hover:border-[var(--text-secondary)] transition-colors relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4">
        <span className="font-[var(--font-doto)] text-4xl text-[var(--text-display)]">
          {Number(restaurant.rating).toFixed(1)}
        </span>
      </div>
      
      <div className="mb-12">
        <h2 className="font-[var(--font-body)] text-2xl font-bold mb-2 pr-16">{restaurant.name}</h2>
        <div className="flex items-center gap-3 font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] tracking-widest uppercase">
          <span>{restaurant.cuisine_type}</span>
          <span>•</span>
          <span>{restaurant.price_range}</span>
        </div>
      </div>
      
      <div className="pt-6 border-t border-[var(--border)] flex justify-between items-end">
        <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase">
          [ {restaurant.is_open ? <span className="text-[var(--success)]">OPEN NOW</span> : <span className="text-[var(--text-disabled)]">CLOSED</span>} ]
        </div>
        <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-primary)] uppercase tracking-widest group-hover:text-[var(--interactive)] transition-colors">
          DETAILS -&gt;
        </div>
      </div>
    </Link>
  );
}
