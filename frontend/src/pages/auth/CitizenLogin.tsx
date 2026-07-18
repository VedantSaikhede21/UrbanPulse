import { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithGoogle } from '../../lib/auth';

export default function CitizenLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) {
      setError(error);
    }
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
            <span style={{ fontSize: '1.4rem' }}>🏙️</span>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>UrbanPulse AI</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Citizen Portal</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
            Sign in to report and track civic issues
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '2.5rem 2rem', backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
          
          <button
            id="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)',
              background: loading ? '#374151' : 'white',
              color: loading ? 'white' : '#1f2937', fontWeight: 600, fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
            }}
          >
            {!loading && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>
        </div>

        {/* Staff link */}
        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '0.85rem', marginTop: '1.5rem' }}>
          Municipal staff?{' '}
          <Link to="/auth/staff-login" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>
            Staff Login →
          </Link>
        </p>
      </div>
    </div>
  );
}
