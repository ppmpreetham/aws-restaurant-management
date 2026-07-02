import type { RestaurantOrder } from '../types';

interface Props {
  order: RestaurantOrder;
  onDecision: (orderId: number, status: 'accepted' | 'rejected') => void;
  onComplete: (orderId: number) => void;
  busy: boolean;
}

function formatItems(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return 'No item details sent';
  return items
    .map((i) => {
      if (i && typeof i === 'object' && 'menuItemId' in i && 'qty' in i) {
        return `#${(i as { menuItemId: number }).menuItemId} × ${(i as { qty: number }).qty}`;
      }
      return JSON.stringify(i);
    })
    .join(', ');
}

export function OrderTicket({ order, onDecision, onComplete, busy }: Props) {
  return (
    <div className={`ticket ticket--${order.status}`}>
      <div className="ticket__header">
        <span className="ticket__id">{order.external_order_id}</span>
        <span className={`badge badge--${order.status}`}>{order.status}</span>
      </div>
      <p className="ticket__items">{formatItems(order.items_snapshot)}</p>
      <p className="ticket__time">{new Date(order.created_at).toLocaleTimeString()}</p>

      {order.status === 'pending' && (
        <div className="ticket__actions">
          <button disabled={busy} className="btn btn--accept" onClick={() => onDecision(order.id, 'accepted')}>
            Accept
          </button>
          <button disabled={busy} className="btn btn--reject" onClick={() => onDecision(order.id, 'rejected')}>
            Reject
          </button>
        </div>
      )}
      {order.status === 'accepted' && (
        <div className="ticket__actions">
          <button disabled={busy} className="btn btn--complete" onClick={() => onComplete(order.id)}>
            Mark completed
          </button>
        </div>
      )}
    </div>
  );
}
