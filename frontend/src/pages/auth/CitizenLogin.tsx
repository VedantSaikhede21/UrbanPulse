import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { signInWithGoogle } from '../../lib/auth';

export default function CitizenLogin() {
  useDocumentTitle('Citizen Login');
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
    <div className="min-h-screen bg-surface-base flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-surface-card border border-border-default rounded-xl py-2.5 px-5 mb-4">
            <span className="text-[1.4rem]">🏙️</span>
            <span className="text-text-primary font-bold text-[1.1rem] tracking-[-0.5px]">UrbanPulse AI</span>
          </div>
          <h1 className="text-text-primary text-2xl font-bold m-0 mb-1">Citizen Portal</h1>
          <p className="text-text-tertiary text-sm m-0">
            Sign in to report and track civic issues
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-border-default rounded-2xl px-8 py-10 text-center">
          {error && <p role="alert" className="text-red-400 text-sm mb-4">{error}</p>}
          
          <button
            id="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            aria-label="Sign in with Google"
            className="focus-ring w-full p-3.5 rounded-xl border border-border-strong bg-white disabled:bg-surface-elevated text-text-inverse disabled:text-text-tertiary font-semibold text-base cursor-pointer disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
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
        <p className="text-center text-text-tertiary text-sm mt-6">
          Municipal staff?{' '}
          <Link to="/auth/staff-login" className="text-brand-lime no-underline font-medium">
            Staff Login →
          </Link>
        </p>
      </div>
    </div>
  );
}
