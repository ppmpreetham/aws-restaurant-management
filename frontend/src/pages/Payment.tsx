import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useStore } from '../useStore';

type PaymentStatus = 'PROCESSING' | 'SUCCESS' | 'FAILED';

export function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('PROCESSING');
  const deductCredits = useStore((state) => state.deductCredits);

  const { type, amount, restaurantName } = location.state || { type: 'UNKNOWN', amount: 0, restaurantName: 'Unknown' };

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      // 90% chance of success
      const isSuccess = Math.random() > 0.1;
      setStatus(isSuccess ? 'SUCCESS' : 'FAILED');
      
      if (isSuccess) {
        deductCredits(amount);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [amount, deductCredits]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full border border-[var(--border-visible)] p-8 bg-[var(--surface)] text-center relative overflow-hidden">
        {status === 'PROCESSING' && (
          <div className="dot-grid absolute inset-0 opacity-20"></div>
        )}
        
        <div className="relative">
          <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest mb-2">
            PAYMENT TERMINAL
          </div>
          
          <div className="font-[var(--font-doto)] text-5xl mb-8 tracking-tighter">
            ${amount.toFixed(2)}
          </div>

          <div className="space-y-4 font-[var(--font-mono)] text-sm mb-12 text-left bg-[var(--surface-raised)] p-4 border border-[var(--border)]">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">MERCHANT</span>
              <span className="text-[var(--text-primary)] uppercase">{restaurantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">TYPE</span>
              <span className="text-[var(--text-primary)]">{type}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-4">
              <span className="text-[var(--text-secondary)]">STATUS</span>
              {status === 'PROCESSING' && <span className="text-[var(--warning)] animate-pulse">[ PROCESSING ]</span>}
              {status === 'SUCCESS' && <span className="text-[var(--success)]">[ APPROVED ]</span>}
              {status === 'FAILED' && <span className="text-[var(--error)]">[ DECLINED ]</span>}
            </div>
          </div>

          {status !== 'PROCESSING' && (
            <Button 
              variant={status === 'SUCCESS' ? 'primary' : 'outline'}
              className="w-full"
              onClick={() => navigate('/search')}
            >
              [ RETURN TO HOME ]
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
