import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendOTP, verifyOTP } from '../../lib/auth';

type Step = 'phone' | 'otp';

export default function CitizenLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formatted = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
    const { error } = await sendOTP(formatted);
    setLoading(false);
    if (error) { setError(error); return; }
    setPhone(formatted);
    setStep('otp');
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { user, error } = await verifyOTP(phone, otp);
    setLoading(false);
    if (error || !user) { setError(error ?? 'Verification failed'); return; }
    navigate('/citizen/dashboard');
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
          <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Citizen Login</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
            {step === 'phone' ? 'Enter your mobile number to continue' : `OTP sent to ${phone}`}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '2rem', backdropFilter: 'blur(10px)'
        }}>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP}>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                Mobile Number
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '0.75rem 1rem', color: '#9ca3af', fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'
                }}>🇮🇳 +91</div>
                <input
                  id="citizen-phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={phone.replace('+91', '')}
                  onChange={e => setPhone(e.target.value)}
                  required
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '0.75rem 1rem', color: 'white', fontSize: '0.95rem',
                    outline: 'none', width: '100%'
                  }}
                />
              </div>
              {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
              <button
                id="send-otp-btn"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none',
                  background: loading ? '#374151' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white', fontWeight: 600, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', letterSpacing: '0.025em'
                }}
              >
                {loading ? 'Sending OTP...' : 'Send OTP →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                Enter 6-digit OTP
              </label>
              <input
                id="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="● ● ● ● ● ●"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '0.85rem 1rem', color: 'white', fontSize: '1.4rem',
                  outline: 'none', textAlign: 'center', letterSpacing: '0.5rem', marginBottom: '1.25rem',
                  boxSizing: 'border-box'
                }}
              />
              {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
              <button
                id="verify-otp-btn"
                type="submit"
                disabled={loading || otp.length < 6}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none',
                  background: (loading || otp.length < 6) ? '#374151' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white', fontWeight: 600, fontSize: '0.95rem',
                  cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Login →'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError(null); }}
                style={{
                  width: '100%', padding: '0.6rem', marginTop: '0.75rem', background: 'transparent',
                  border: 'none', color: '#6b7280', fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                ← Change number
              </button>
            </form>
          )}
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
