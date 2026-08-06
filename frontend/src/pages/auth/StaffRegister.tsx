import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { supabase } from '../../lib/supabase';

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
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate('/auth/post-login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base p-4 font-sans">
      <div className="w-full max-w-[420px]">
        <h1 className="text-text-primary text-center mb-6">Staff Registration</h1>
        <form onSubmit={handleRegister} className="bg-surface-card border border-border-default rounded-2xl p-8">
          <label htmlFor="reg-email" className="block text-text-secondary text-sm mb-2 font-medium">Work Email</label>
          <input id="reg-email" type="email" placeholder="officer@municipality.gov.in" required value={email}
            onChange={e=>setEmail(e.target.value)} aria-label="Work email"
            className="focus-ring w-full px-4 py-3 mb-5 rounded-xl border border-border-default bg-surface-raised text-text-primary placeholder:text-text-quaternary outline-none" />
          <label htmlFor="reg-password" className="block text-text-secondary text-sm mb-2 font-medium">Password</label>
          <input id="reg-password" type="password" placeholder="Min 6 characters" required minLength={6} value={password}
            onChange={e=>setPassword(e.target.value)} aria-label="Password"
            className="focus-ring w-full px-4 py-3 mb-5 rounded-xl border border-border-default bg-surface-raised text-text-primary placeholder:text-text-quaternary outline-none" />
          {error && <p role="alert" className="text-red-400 text-sm mb-4">{error}</p>}
          <button type="submit" disabled={loading} aria-label={loading ? 'Creating account' : 'Create staff account'}
            className={`focus-ring w-full p-3.5 rounded-xl border-0 font-semibold ${
              loading ? 'bg-surface-elevated text-text-tertiary cursor-not-allowed' : 'bg-brand-lime text-background cursor-pointer hover:bg-brand-lime-hover'
            }`}>
            {loading ? 'Creating account…' : 'Create Staff Account'}
          </button>
        </form>
        <p className="text-center text-text-tertiary text-sm mt-6">
          Already have an account?{' '}
          <Link to="/auth/staff-login" className="text-brand-lime">Staff Login →</Link>
        </p>
      </div>
    </div>
  );
}
