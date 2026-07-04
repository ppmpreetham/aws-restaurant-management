import { Outlet, Link, useLocation } from "react-router-dom";
import { User, LogOut } from "lucide-react";

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--black)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--text-primary)] text-[var(--black)] font-[var(--font-mono)] flex items-center justify-center text-xl font-bold leading-none">
              T
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight">TABLE & TRAY</h1>
              <p className="text-[var(--text-secondary)] text-[var(--label)] uppercase tracking-widest mt-1">
                Management System
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex ml-12 gap-6 font-[var(--font-mono)] text-[var(--label)] tracking-widest uppercase">
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
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-[var(--text-secondary)] font-[var(--font-mono)] text-[var(--label)]">
            <User size={14} />
            <span>ADMIN_USER</span>
          </div>
          <Link to="/login" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
            <LogOut size={16} />
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-[var(--black)] w-full max-w-[1400px] mx-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
