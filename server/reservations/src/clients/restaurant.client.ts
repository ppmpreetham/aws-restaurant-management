import { HttpError, errorMessage } from '../errors';

interface RestaurantResponse {
  id: number;
  name?: string;
  is_open?: boolean;
}

export interface RestaurantCheck {
  restaurantId: number;
  name?: string;
  isOpen: boolean;
  source: 'restaurant-service' | 'not-configured' | 'unreachable';
}

function serviceBaseUrl(): string | null {
  const url = process.env.RESTAURANT_SERVICE_URL?.trim();
  return url ? url.replace(/\/$/, '') : null;
}

export async function checkRestaurantForReservation(
  restaurantId: number
): Promise<RestaurantCheck> {
  const baseUrl = serviceBaseUrl();

  if (!baseUrl) {
    return {
      restaurantId,
      isOpen: true,
      source: 'not-configured',
    };
  }

  try {
    const response = await fetch(`${baseUrl}/api/restaurants/${restaurantId}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 404) {
      throw new HttpError(404, 'Restaurant not found');
    }

    if (!response.ok) {
      throw new HttpError(503, 'Restaurant service is temporarily unavailable');
    }

    const restaurant = (await response.json()) as RestaurantResponse;
    const isOpen = restaurant.is_open !== false;

    if (!isOpen) {
      throw new HttpError(409, 'Restaurant is closed for reservations');
    }

    return {
      restaurantId: restaurant.id,
      name: restaurant.name,
      isOpen,
      source: 'restaurant-service',
    };
  } catch (error) {
    if (error instanceof HttpError) throw error;

    if (process.env.REQUIRE_RESTAURANT_SERVICE === 'true') {
      throw new HttpError(503, 'Restaurant service is unreachable', errorMessage(error));
    }

    console.warn('Restaurant service check skipped:', errorMessage(error));
    return {
      restaurantId,
      isOpen: true,
      source: 'unreachable',
    };
  }
}
