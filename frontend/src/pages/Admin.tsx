import { useEffect, useState } from 'react';
import { useStore } from '../useStore';

interface UserData {
  id: number;
  name: string;
  username: string;
  role: string;
  credits: string;
  created_at: string;
}

interface OrderData {
  id: number;
  customer_name: string;
  status: string;
  total: string;
  created_at: string;
}

export function Admin() {
  const { token } = useStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (usersRes.ok) setUsers(await usersRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">
          [ LOADING SYSTEM DATA... ]
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-24">
      <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
        <div>
          <h1 className="font-[var(--font-body)] text-[var(--text-display)] text-5xl md:text-7xl font-bold leading-none tracking-tight">
            SYSTEM
          </h1>
          <p className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest mt-4">
            GLOBAL ADMINISTRATION OVERVIEW
          </p>
        </div>
        <div className="hidden md:block font-[var(--font-mono)] text-4xl text-[var(--text-primary)]">
          {users.length.toString().padStart(3, '0')}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* USERS SECTION */}
        <section>
          <h2 className="font-[var(--font-mono)] text-xl font-bold uppercase tracking-widest text-[var(--text-primary)] mb-8">
            [ OPERATORS ]
          </h2>
          
          <div className="border border-[var(--border-visible)] bg-[var(--surface)] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-visible)] font-[var(--font-mono)] text-[var(--text-secondary)] text-xs uppercase tracking-widest">
                  <th className="p-4 font-normal">ID</th>
                  <th className="p-4 font-normal">USERNAME</th>
                  <th className="p-4 font-normal">ROLE</th>
                  <th className="p-4 font-normal text-right">CREDITS</th>
                </tr>
              </thead>
              <tbody className="font-[var(--font-mono)] text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--black)] transition-colors">
                    <td className="p-4 text-[var(--text-secondary)]">#{u.id.toString().padStart(3, '0')}</td>
                    <td className="p-4 text-[var(--text-primary)]">{u.username}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs border ${u.role === 'admin' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border-visible)] text-[var(--text-secondary)]'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[var(--text-primary)]">${parseFloat(u.credits).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ORDERS SECTION */}
        <section>
          <h2 className="font-[var(--font-mono)] text-xl font-bold uppercase tracking-widest text-[var(--text-primary)] mb-8">
            [ GLOBAL ORDERS ]
          </h2>
          
          <div className="border border-[var(--border-visible)] bg-[var(--surface)] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-visible)] font-[var(--font-mono)] text-[var(--text-secondary)] text-xs uppercase tracking-widest">
                  <th className="p-4 font-normal">ID</th>
                  <th className="p-4 font-normal">CUSTOMER</th>
                  <th className="p-4 font-normal">STATUS</th>
                  <th className="p-4 font-normal text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="font-[var(--font-mono)] text-sm">
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--black)] transition-colors">
                    <td className="p-4 text-[var(--text-secondary)]">#{o.id.toString().padStart(4, '0')}</td>
                    <td className="p-4 text-[var(--text-primary)]">{o.customer_name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs border ${
                        o.status === 'Pending' ? 'border-[var(--warning)] text-[var(--warning)]' :
                        o.status === 'Completed' ? 'border-[var(--success)] text-[var(--success)]' :
                        'border-[var(--accent)] text-[var(--accent)]'
                      }`}>
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[var(--text-primary)]">${parseFloat(o.total).toFixed(2)}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">
                      [ NO DATA RECORDED ]
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
