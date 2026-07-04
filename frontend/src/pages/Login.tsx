import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { useStore } from '../useStore';

export function Login() {
  const navigate = useNavigate();
  const { login } = useStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user);
      navigate('/search');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--black)] text-[var(--text-primary)] flex items-center justify-center p-6">
      <div className="max-w-md w-full border border-[var(--border-visible)] bg-[var(--surface)] p-12 relative">
        {error && (
          <div className="absolute top-0 left-0 w-full bg-[var(--accent)] text-[var(--black)] p-2 text-center font-[var(--font-mono)] text-[var(--label)] font-bold tracking-widest uppercase">
            [ERROR: {error}]
          </div>
        )}
        
        <div className="mb-12 mt-4">
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

        <div className="space-y-6 mb-8">
          <div>
            <label className="block font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] uppercase tracking-widest mb-2">
              USERNAME
            </label>
            <input 
              type="text" 
              className="w-full bg-transparent border border-[var(--border-visible)] p-4 font-[var(--font-mono)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
        </div>

        <Button 
          variant="primary" 
          className="w-full mb-4"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '[ AUTHENTICATING... ]' : '[ SIGN IN ]'}
        </Button>
        
        <div className="text-center">
          <Link to="/register" className="font-[var(--font-mono)] text-[var(--label)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase tracking-widest transition-colors">
            CREATE AN ACCOUNT
          </Link>
        </div>
      </div>
    </div>
  );
}
