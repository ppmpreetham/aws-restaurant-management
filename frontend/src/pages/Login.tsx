import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--black)] text-[var(--text-primary)] flex items-center justify-center p-6">
      <div className="max-w-md w-full border border-[var(--border-visible)] bg-[var(--surface)] p-12">
        <div className="mb-12">
          <div className="w-12 h-12 bg-[var(--text-primary)] text-[var(--black)] font-[var(--font-mono)] flex items-center justify-center text-2xl font-bold leading-none mb-8">
            T
          </div>
          <h1 className="font-[var(--font-body)] text-4xl font-bold leading-none tracking-tight mb-2">
            LOGIN
          </h1>
          <p className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest">
            AUTHENTICATE TO CONTINUE
          </p>
        </div>

        <div className="space-y-6 mb-12">
          <div>
            <label className="block font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest mb-2">
              USERNAME
            </label>
            <input 
              type="text" 
              className="w-full bg-transparent border border-[var(--border-visible)] p-4 font-[var(--font-mono)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
              placeholder="admin"
              defaultValue="admin"
            />
          </div>
          <div>
            <label className="block font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest mb-2">
              PASSWORD
            </label>
            <input 
              type="password" 
              className="w-full bg-transparent border border-[var(--border-visible)] p-4 font-[var(--font-mono)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
              placeholder="••••••••"
              defaultValue="password"
            />
          </div>
        </div>

        <Button 
          variant="primary" 
          className="w-full"
          onClick={() => navigate('/search')}
        >
          [ SIGN IN ]
        </Button>
      </div>
    </div>
  );
}
