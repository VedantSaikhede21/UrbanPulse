import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { sendPasswordResetEmail } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  useDocumentTitle('Forgot Password');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await sendPasswordResetEmail(email);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }
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
            <span className="text-2xl">🔑</span>
            <span className="text-text-primary font-bold text-lg tracking-[-0.5px]">UrbanPulse Staff</span>
          </div>
          <h1 className="text-text-primary text-2xl font-bold mb-1">Forgot Password</h1>
          <p className="text-text-tertiary text-sm m-0">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-border-default rounded-2xl p-8">
          <form onSubmit={handleSubmit}>
            {!success && (
              <>
                <div className="mb-5">
                  <label htmlFor="reset-email" className="block text-text-secondary text-sm mb-2 font-medium">
                    Work Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="officer@municipality.gov.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="focus-ring w-full bg-surface-raised border border-border-default rounded-lg px-4 py-3 text-text-primary text-[0.95rem] placeholder:text-text-quaternary"
                  />
                </div>

                {error && <p role="alert" className="text-status-escalated text-sm mb-4">{error}</p>}

                <Button
                  id="reset-btn"
                  type="submit"
                  disabled={loading}
                  fullWidth
                  size="lg"
                  variant="primary"
                  loading={loading}
                >
                  Send Reset Link →
                </Button>
              </>
            )}

            {success && (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Check your email</h3>
                <p className="text-text-tertiary text-sm mb-6">
                  We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                </p>
                <Link
                  to="/auth/staff-login"
                  className="text-brand-lime font-medium hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            )}
          </form>
        </div>
        <p className="text-center text-text-tertiary text-sm mt-6">
          Remember your password?{' '}
          <Link to="/auth/staff-login" className="text-brand-lime no-underline font-medium hover:underline">
            Staff Login →
          </Link>
        </p>
      </div>
    </div>
  );
}