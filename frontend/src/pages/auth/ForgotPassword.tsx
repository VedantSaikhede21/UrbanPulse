import React, { useState } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { sendPasswordResetEmail } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import { AuthAlert, AuthLayout, AuthLink, AuthSuccess, TextField } from '../../components/layout/AuthLayout';

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
    <AuthLayout
      variant="staff"
      eyebrow="Account Recovery"
      title={success ? 'Check your email' : 'Reset your password'}
      subtitle={
        success
          ? 'The reset link is on its way.'
          : 'Enter your work email and we will send a one-time reset link.'
      }
      footer={
        success ? (
          <AuthLink to="/auth/staff-login">Back to Staff Login</AuthLink>
        ) : (
          <>
            Remember your password? <AuthLink to="/auth/staff-login">Staff Login</AuthLink>
            <span className="mx-2 text-text-quaternary" aria-hidden="true">·</span>
            <AuthLink to="/auth/citizen-login">Citizen Portal</AuthLink>
          </>
        )
      }
    >
      {success ? (
        <AuthSuccess title="Reset link sent">
          <p>
            Check <strong className="text-text-primary">{email}</strong> for the reset link. It expires in
            60 minutes — request a new one if it lapses.
          </p>
        </AuthSuccess>
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            id="reset-email"
            label="Work email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="officer@municipality.gov.in"
            autoComplete="email"
            required
          />

          {error && (
            <div className="mb-4">
              <AuthAlert variant="error" message={error} />
            </div>
          )}

          <Button
            id="reset-btn"
            type="submit"
            disabled={loading}
            fullWidth
            size="lg"
            variant="primary"
            loading={loading}
          >
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
