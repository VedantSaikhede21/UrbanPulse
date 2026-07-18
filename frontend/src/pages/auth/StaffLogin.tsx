import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPassword, getRoleFromUser } from '../../lib/auth';

export default function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const { user, error } = await signInWithPassword(email, password);
    setLoading(true);
    
    if (error || !user) {
      setError(error ?? 'Login failed. Please verify credentials.');
      setLoading(false);
      return;
    }

    const role = getRoleFromUser(user);
    setLoading(false);
    
    // Route staff to their respective dashboards based on role
   navigate('/auth/post-login');
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0d0d0d 0%, #111827 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '12px',
            padding: '0.6rem 1.2rem', marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '1.4rem' }}>🛡️</span>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>UrbanPulse Staff</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Staff Portal</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
            Log in to manage tickets and city operations
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '2rem', backdropFilter: 'blur(10px)'
        }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                Work Email Address
              </label>
              <input
                id="staff-email"
                type="email"
                placeholder="officer@municipality.gov.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '0.75rem 1rem', color: 'white', fontSize: '0.95rem',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                Password
              </label>
              <input
                id="staff-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '0.75rem 1rem', color: 'white', fontSize: '0.95rem',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

            <button
              id="staff-login-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none',
                background: loading ? '#374151' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white', fontWeight: 600, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', letterSpacing: '0.025em'
              }}
            >
              {loading ? 'Logging in...' : 'Sign In →'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', color:'#4b5563', fontSize:'0.85rem', marginTop:'1rem' }}>
          New staff member?{' '}
          <Link to="/auth/staff-register" style={{ color:'#60a5fa', fontWeight:500 }}>
            Register →
          </Link>
        </p>
        {/* Citizen link */}
        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '0.85rem', marginTop: '1.5rem' }}>
          Are you a citizen?{' '}
          <Link to="/auth/citizen-login" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>
            Citizen Portal →
          </Link>
        </p>
      </div>
    </div>
  );
}
