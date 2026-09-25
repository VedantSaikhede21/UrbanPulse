import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { AuthAlert, AuthLayout, AuthLink, PasswordField } from '../../components/layout/AuthLayout';

export default function ResetPassword() {
  useDocumentTitle('Reset Password');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true);
        setError(null);
        setChecking(false);
      }
    });

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) {
        setError('This password reset link is invalid or has expired.');
      } else if (data.session) {
        setReady(true);
      } else {
        setError('This password reset link is invalid or has expired.');
      }
      setChecking(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Use at least 6 characters for your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    toast({ type: 'success', title: 'Password updated', message: 'You can now sign in with your new password.' });
    navigate('/auth/staff-login', { replace: true });
  }

  const expired = !checking && !ready;

  return (
    <AuthLayout
      variant="staff"
      eyebrow="Account Recovery"
      title={expired ? 'This link has expired' : 'Create a new password'}
      subtitle={
        expired
          ? 'Reset links are single-use and time-limited.'
          : 'Pick something you have not used on another service.'
      }
      footer={
        <AuthLink to={expired ? '/auth/forgot-password' : '/auth/staff-login'}>
          {expired ? 'Request a new link' : 'Back to Staff Login'}
        </AuthLink>
      }
    >
      {checking ? (
        <div
          className="flex items-center justify-center gap-3 py-10 text-sm text-text-secondary"
          role="status"
          aria-busy="true"
        >
          <span className="w-5 h-5 rounded-full border-2 border-brand-lime/30 border-t-brand-lime animate-spin" aria-hidden="true" />
          Checking your reset link…
        </div>
      ) : expired ? (
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-status-escalated/10 border border-status-escalated/30 flex items-center justify-center">
            <KeyRound size={26} className="text-status-escalated" aria-hidden="true" />
          </div>
          <h2 className="text-heading font-semibold text-text-primary">Link expired</h2>
          <p className="mt-2 text-body-sm text-text-secondary">{error}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <PasswordField
            id="new-password"
            label="New password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={6}
            hint="Minimum 6 characters."
            required
          />
          <PasswordField
            id="confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            minLength={6}
            required
          />

          {error && (
            <div className="mb-4">
              <AuthAlert variant="error" message={error} />
            </div>
          )}

          <Button type="submit" disabled={loading} fullWidth size="lg" variant="primary" loading={loading}>
            Update password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
