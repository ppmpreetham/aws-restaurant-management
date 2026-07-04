import { useState } from 'react';
import type { RestaurantOrder } from '../types';
import { Button } from './Button';

interface Props {
  order: RestaurantOrder;
  onDecision: (orderId: number, status: 'accepted' | 'rejected', reason?: string) => void;
  onComplete: (orderId: number) => void;
  busy: boolean;
}

function formatItems(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return 'NO ITEM DETAILS SENT';
  return items
    .map((i) => {
      // Format from frontend mock
      if (i && typeof i === 'object' && 'menuItemId' in i && 'qty' in i) {
        return `[ ITEM_#${(i as any).menuItemId} ] × ${(i as any).qty}`;
      }
      // Format from ordering microservice
      if (i && typeof i === 'object' && 'name' in i && 'quantity' in i) {
        return `${(i as any).name} × ${(i as any).quantity}`;
      }
      return JSON.stringify(i);
    })
    .join('  //  ');
}

export function OrderTicket({ order, onDecision, onComplete, busy }: Props) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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
        
        <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-disabled)] mb-4">
          T: {new Date(order.created_at).toLocaleTimeString()}
        </div>

        {order.status === 'rejected' && order.reason && (
          <div className="mb-6 p-4 border border-[var(--error)] text-[var(--error)] bg-[var(--surface-raised)]">
            <div className="font-[var(--font-mono)] text-[var(--label)] uppercase tracking-widest mb-2">REASON FOR DECLINE:</div>
            <div className="font-[var(--font-body)] text-sm">{order.reason}</div>
          </div>
        )}

        {order.status === 'pending' && !isRejecting && (
          <div className="grid grid-cols-2 gap-4">
            <Button disabled={busy} variant="primary" onClick={() => onDecision(order.id, 'accepted')}>
              [ ACCEPT ]
            </Button>
            <Button disabled={busy} variant="danger" onClick={() => setIsRejecting(true)}>
              [ REJECT ]
            </Button>
          </div>
        )}

        {order.status === 'pending' && isRejecting && (
          <div className="space-y-4">
            <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--error)] uppercase tracking-widest">
              PROVIDE REASON FOR REJECTION:
            </div>
            <input
              type="text"
              className="w-full bg-transparent border border-[var(--border-visible)] p-3 font-[var(--font-mono)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--error)] transition-colors"
              placeholder="e.g. Out of stock, Kitchen busy..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-4">
              <Button disabled={busy} variant="outline" onClick={() => setIsRejecting(false)}>
                [ CANCEL ]
              </Button>
              <Button disabled={busy || !rejectReason.trim()} variant="danger" onClick={() => onDecision(order.id, 'rejected', rejectReason)}>
                [ CONFIRM DECLINE ]
              </Button>
            </div>
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
