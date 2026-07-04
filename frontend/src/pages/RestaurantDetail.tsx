import { useQuery } from "@tanstack/react-query"
import { useParams, Link } from "react-router-dom"
import { api } from "../api/restaurantApi"
import { Button } from "../components/Button"

export function RestaurantDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => api.getRestaurant(Number(id)),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">
        [ LOADING_RESTAURANT... ]
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--error)] uppercase tracking-widest">
        [ ERROR: RESTAURANT NOT FOUND ]
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="mb-12 border border-[var(--border-visible)] p-2">
        <div className="aspect-[21/9] bg-[var(--surface-raised)] relative overflow-hidden flex items-center justify-center">
          {/* Fallback pattern if no image */}
          <div className="absolute inset-0 dot-grid-subtle opacity-50"></div>
          {restaurant.image_url && (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--black)] to-transparent opacity-80"></div>

          <h1 className="relative font-[var(--font-doto)] text-4xl md:text-6xl lg:text-[var(--display-xl)] text-[var(--text-display)] tracking-tighter mt-auto mb-4 md:mb-8 text-center px-4">
            {restaurant.name.toUpperCase()}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <p className="font-[var(--font-body)] text-xl leading-relaxed text-[var(--text-primary)] mb-8">
            {restaurant.description}
          </p>

          <div className="grid grid-cols-2 gap-8 border-t border-[var(--border)] pt-8">
            <div>
              <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] mb-2 uppercase tracking-widest">
                CUISINE
              </div>
              <div className="font-[var(--font-body)] text-lg">{restaurant.cuisine_type}</div>
            </div>
            <div>
              <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] mb-2 uppercase tracking-widest">
                ADDRESS
              </div>
              <div className="font-[var(--font-body)] text-lg">{restaurant.address}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:border-l border-[var(--border)] md:pl-12">
          <div className="mb-4">
            <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] mb-2 uppercase tracking-widest">
              RATING
            </div>
            <div className="font-[var(--font-doto)] text-5xl text-[var(--text-display)] tracking-tighter">
              {Number(restaurant.rating).toFixed(1)}
            </div>
          </div>

          <Link to={`/restaurant/${id}/reserve`} className="block w-full">
            <Button variant="primary" className="w-full">
              [ RESERVE TABLE ]
            </Button>
          </Link>

          <Link to={`/restaurant/${id}/order`} className="block w-full">
            <Button variant="outline" className="w-full">
              [ ORDER ONLINE ]
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
