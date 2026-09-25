import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { AuthAlert, AuthLayout, AuthLink, AuthSuccess, PasswordField, TextField } from '../../components/layout/AuthLayout';

export default function StaffRegister() {
  useDocumentTitle('Staff Registration');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'officer', department: 'Roads' }
      }
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if (data.session) {
      navigate('/auth/post-login');
      return;
    }
    setSuccess(true);
  }

  return (
    <AuthLayout
      variant="staff"
      eyebrow="Staff Operations"
      title={success ? 'Account created' : 'Create your staff account'}
      subtitle={
        success
          ? 'One last step before you can start working tickets.'
          : 'Registers you as a field officer. A super admin activates your access.'
      }
      footer={
        success ? (
          <AuthLink to="/auth/staff-login">Back to Staff Login</AuthLink>
        ) : (
          <>
            Already have an account? <AuthLink to="/auth/staff-login">Staff Login</AuthLink>
            <span className="mx-2 text-text-quaternary" aria-hidden="true">·</span>
            <AuthLink to="/auth/citizen-login">Citizen Portal</AuthLink>
          </>
        )
      }
    >
      {success ? (
        <AuthSuccess title="Confirm your email">
          <p>
            We sent a confirmation link to <strong className="text-text-primary">{email}</strong>. Confirm it,
            then ask a super admin to activate your officer access.
          </p>
        </AuthSuccess>
      ) : (
        <form onSubmit={handleRegister}>
          <TextField
            id="reg-email"
            label="Work email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="officer@municipality.gov.in"
            autoComplete="email"
            required
          />
          <PasswordField
            id="reg-password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
            minLength={6}
            hint="Minimum 6 characters. Use a password you do not reuse elsewhere."
            required
          />

          {error && (
            <div className="mb-4">
              <AuthAlert variant="error" message={error} />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            size="lg"
            variant="primary"
            loading={loading}
          >
            Create staff account
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
