import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function StaffRegister() {
  useDocumentTitle('Staff Registration');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'officer', department: 'Roads' }
      }
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate('/auth/post-login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base p-4 font-sans">
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

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-surface-card border border-border-default rounded-xl px-5 py-2.5 mb-4">
            <span className="text-2xl">🛡️</span>
            <span className="text-text-primary font-bold text-lg tracking-[-0.5px]">UrbanPulse Staff</span>
          </div>
          <h1 className="text-text-primary text-2xl font-bold mb-1">Staff Registration</h1>
          <p className="text-text-tertiary text-sm m-0">
            Create your officer account
          </p>
        </div>

        <form onSubmit={handleRegister} className="bg-surface-card border border-border-default rounded-2xl p-8">
          <label htmlFor="reg-email" className="block text-text-secondary text-sm mb-2 font-medium">Work Email</label>
          <input id="reg-email" type="email" placeholder="officer@municipality.gov.in" required value={email}
            onChange={e=>setEmail(e.target.value)} aria-label="Work email"
            className="focus-ring w-full px-4 py-3 mb-5 rounded-lg border border-border-default bg-surface-raised text-text-primary placeholder:text-text-quaternary" />
          <label htmlFor="reg-password" className="block text-text-secondary text-sm mb-2 font-medium">Password</label>
          <input id="reg-password" type="password" placeholder="Min 6 characters" required minLength={6} value={password}
            onChange={e=>setPassword(e.target.value)} aria-label="Password"
            className="focus-ring w-full px-4 py-3 mb-5 rounded-lg border border-border-default bg-surface-raised text-text-primary placeholder:text-text-quaternary" />
          {error && <p role="alert" className="text-status-escalated text-sm mb-4">{error}</p>}
          <Button type="submit" disabled={loading} fullWidth size="lg" variant="primary" loading={loading}>
            Create Staff Account
          </Button>
        </form>
        <p className="text-center text-text-tertiary text-sm mt-6">
          Already have an account?{' '}
          <Link to="/auth/staff-login" className="text-brand-lime font-medium hover:underline">
            Staff Login →
          </Link>
        </p>
      </div>
    </div>
  );
}