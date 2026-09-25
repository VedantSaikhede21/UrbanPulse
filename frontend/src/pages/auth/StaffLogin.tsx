import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { signInWithPassword } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import { AuthAlert, AuthLayout, AuthLink, PasswordField, TextField } from '../../components/layout/AuthLayout';

export default function StaffLogin() {
  useDocumentTitle('Staff Login');
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

    if (error || !user) {
      setError(error ?? 'Login failed. Please verify credentials.');
      setLoading(false);
      return;
    }
    setLoading(false);
    navigate('/auth/post-login');
  }

  return (
    <AuthLayout
      variant="staff"
      eyebrow="Staff Operations"
      title="Sign in to your workspace"
      subtitle="Officers, department heads, city admins and super admins all start here."
      footer={
        <>
          New staff member? <AuthLink to="/auth/staff-register">Register</AuthLink>
          <span className="mx-2 text-text-quaternary" aria-hidden="true">·</span>
          <AuthLink to="/auth/citizen-login">Citizen Portal</AuthLink>
        </>
      }
    >
      <form onSubmit={handleLogin} noValidate={false}>
        <TextField
          id="staff-email"
          label="Work email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="officer@municipality.gov.in"
          autoComplete="email"
          required
        />

        <PasswordField
          id="staff-password"
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between gap-3 mb-5">
          <label className="flex items-center gap-2 text-caption text-text-tertiary cursor-pointer select-none">
            <input
              type="checkbox"
              name="remember"
              className="w-4 h-4 rounded border-border-default text-brand-lime focus:ring-brand-lime focus:ring-offset-0"
            />
            Keep me signed in
          </label>
          <AuthLink to="/auth/forgot-password">Forgot password?</AuthLink>
        </div>

        {error && (
          <div className="mb-4">
            <AuthAlert variant="error" message={error} />
          </div>
        )}

        <Button
          id="staff-login-btn"
          type="submit"
          disabled={loading}
          fullWidth
          size="lg"
          variant="primary"
          loading={loading}
        >
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
