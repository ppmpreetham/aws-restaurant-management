import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { User, LogOut, Wallet } from "lucide-react";
import { useStore } from "../useStore";

export function Layout() {
  const location = useLocation();
  const { credits, setCredits, user, token, logout } = useStore();

  useEffect(() => {
    if (user && token) {
      fetch(`/api/users/${user.id}/credits`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.credits !== undefined) {
            setCredits(data.credits);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user, token, setCredits]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--black)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--text-primary)] text-[var(--black)] font-[var(--font-mono)] flex items-center justify-center text-xl font-bold leading-none">
              T
            </div>
            <div>
              <h1 className="font-bold text-sm md:text-lg leading-none tracking-tight">TABLE & TRAY</h1>
              <p className="text-[var(--text-secondary)] text-[var(--label)] uppercase tracking-widest mt-1">
                Management System
              </p>
            </div>
          </Link>

          <nav className="flex ml-4 md:ml-12 gap-4 md:gap-6 font-[var(--font-mono)] text-[var(--label)] tracking-widest uppercase text-xs md:text-sm">
            <Link 
              to="/search" 
              className={`hover:text-[var(--text-primary)] transition-colors ${location.pathname.startsWith('/search') || location.pathname.startsWith('/restaurant') ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
            >
              [ BROWSE ]
            </Link>
            <Link 
              to="/kitchen" 
              className={`hover:text-[var(--text-primary)] transition-colors ${location.pathname.startsWith('/kitchen') ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
            >
              [ KITCHEN ]
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`hover:text-[var(--text-primary)] transition-colors ${location.pathname.startsWith('/admin') ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
              >
                [ ADMIN ]
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 border border-[var(--border-visible)] text-[var(--success)] font-[var(--font-mono)] text-[var(--label)]">
            <Wallet size={14} />
            <span>${credits !== null ? credits.toFixed(2) : '---'} CREDITS</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[var(--text-secondary)] font-[var(--font-mono)] text-[var(--label)] ml-2">
            <User size={14} />
            <span>{user ? user.username.toUpperCase() : 'GUEST'}</span>
          </div>
          {user ? (
            <button onClick={logout} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer">
              <LogOut size={16} />
            </button>
          ) : (
            <Link to="/login" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
              <LogOut size={16} />
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 bg-[var(--black)] w-full max-w-[1400px] mx-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
