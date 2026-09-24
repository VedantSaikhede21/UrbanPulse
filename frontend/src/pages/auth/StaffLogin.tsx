import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { signInWithPassword, sendPasswordResetEmail } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function StaffLogin() {
  useDocumentTitle('Staff Login');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { user, error } = await signInWithPassword(email, password);

    if (error || !user) {
      setError(error ?? 'Login failed. Please verify credentials.');
      setLoading(false);
      return;
    }
    setLoading(false);
    navigate('/auth/post-login');
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-[420px]">

        {/* Back to Home link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-quaternary hover:text-brand-lime transition-colors mb-6 focus-ring"
          aria-label="Back to home page"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-surface-card border border-border-default rounded-xl px-5 py-2.5 mb-4">
            <span className="text-2xl">🛡️</span>
            <span className="text-text-primary font-bold text-lg tracking-[-0.5px]">UrbanPulse Staff</span>
          </div>
          <h1 className="text-text-primary text-2xl font-bold mb-1">Staff Portal</h1>
          <p className="text-text-tertiary text-sm m-0">
            Log in to manage tickets and city operations
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-border-default rounded-2xl p-8">
          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label htmlFor="staff-email" className="block text-text-secondary text-sm mb-2 font-medium">
                Work Email Address
              </label>
              <input
                id="staff-email"
                type="email"
                placeholder="officer@municipality.gov.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="focus-ring w-full bg-surface-raised border border-border-default rounded-lg px-4 py-3 text-text-primary text-[0.95rem] placeholder:text-text-quaternary"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="staff-password" className="block text-text-secondary text-sm mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="focus-ring w-full bg-surface-raised border border-border-default rounded-lg px-4 py-3 text-text-primary text-[0.95rem] placeholder:text-text-quaternary pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-quaternary hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border-default text-brand-lime focus:ring-brand-lime" />
                <span className="text-sm text-text-tertiary">Remember me</span>
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-brand-lime hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {error && <p role="alert" className="text-status-escalated text-sm mb-4">{error}</p>}

            <Button
              id="staff-login-btn"
              type="submit"
              disabled={loading}
              fullWidth
              size="lg"
              variant="primary"
              loading={loading}
            >
              Sign In →
            </Button>
          </form>
        </div>
        <p className="text-center text-text-tertiary text-sm mt-4">
          New staff member?{' '}
          <Link to="/auth/staff-register" className="text-brand-lime font-medium hover:underline">
            Register →
          </Link>
        </p>
        {/* Citizen link */}
        <p className="text-center text-text-tertiary text-sm mt-6">
          Are you a citizen?{' '}
          <Link to="/auth/citizen-login" className="text-brand-lime no-underline font-medium hover:underline">
            Citizen Portal →
          </Link>
        </p>
      </div>
    </div>
  );
}