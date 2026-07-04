import type { RestaurantOrder } from '../types';
import { Button } from './Button';

interface Props {
  order: RestaurantOrder;
  onDecision: (orderId: number, status: 'accepted' | 'rejected') => void;
  onComplete: (orderId: number) => void;
  busy: boolean;
}

function formatItems(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return 'NO ITEM DETAILS SENT';
  return items
    .map((i) => {
      if (i && typeof i === 'object' && 'menuItemId' in i && 'qty' in i) {
        return `[ ITEM_#${(i as { menuItemId: number }).menuItemId} ] × ${(i as { qty: number }).qty}`;
      }
      return JSON.stringify(i);
    })
    .join('  //  ');
}

export function OrderTicket({ order, onDecision, onComplete, busy }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-[var(--warning)] border-[var(--warning)]';
      case 'accepted': return 'text-[var(--interactive)] border-[var(--interactive)]';
      case 'completed': return 'text-[var(--success)] border-[var(--success)]';
      case 'rejected': return 'text-[var(--error)] border-[var(--error)]';
      default: return 'text-[var(--text-secondary)] border-[var(--border)]';
    }
  };

  return (
    <div className={`border p-6 bg-[var(--surface)] transition-colors dot-grid-subtle relative ${order.status === 'pending' ? 'border-[var(--text-primary)]' : 'border-[var(--border-visible)]'}`}>
      <div className="absolute inset-0 bg-[var(--surface)] opacity-95"></div>
      
      <div className="relative">
        <div className="flex justify-between items-start mb-6 border-b border-[var(--border)] pb-4">
          <div>
            <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest mb-1">
              ORDER_ID
            </div>
            <div className="font-[var(--font-mono)] text-xl font-bold tracking-tight">
              #{order.external_order_id.split('-')[0]}
            </div>
          </div>
          <div className={`font-[var(--font-mono)] text-[var(--label)] uppercase tracking-widest px-2 py-1 border ${getStatusColor(order.status)}`}>
            [{order.status}]
          </div>
        </div>

        <div className="font-[var(--font-mono)] text-sm mb-6 text-[var(--text-primary)] leading-relaxed">
          {formatItems(order.items_snapshot)}
        </div>
        
        <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-disabled)] mb-8">
          T: {new Date(order.created_at).toLocaleTimeString()}
        </div>

        {order.status === 'pending' && (
          <div className="grid grid-cols-2 gap-4">
            <Button disabled={busy} variant="primary" onClick={() => onDecision(order.id, 'accepted')}>
              [ ACCEPT ]
            </Button>
            <Button disabled={busy} variant="danger" onClick={() => onDecision(order.id, 'rejected')}>
              [ REJECT ]
            </Button>
          </div>
        )}
        {order.status === 'accepted' && (
          <div className="w-full">
            <Button disabled={busy} variant="outline" className="w-full" onClick={() => onComplete(order.id)}>
              [ MARK COMPLETE ]
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
