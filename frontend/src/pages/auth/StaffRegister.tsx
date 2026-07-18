import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function StaffRegister() {
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
    navigate('/auth/post-login');   // trigger has already stamped role
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
                  background:'linear-gradient(135deg,#0d0d0d,#111827)', padding:'1rem', fontFamily:'Inter,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <h1 style={{ color:'white', textAlign:'center', marginBottom:'1.5rem' }}>Staff Registration</h1>
        <form onSubmit={handleRegister} style={{ background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'2rem' }}>
          <input type="email" placeholder="Work email" required value={email}
            onChange={e=>setEmail(e.target.value)}
            style={{ width:'100%', padding:'0.75rem 1rem', marginBottom:'1rem',
                     borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)',
                     background:'rgba(255,255,255,0.06)', color:'white', boxSizing:'border-box' }} />
          <input type="password" placeholder="Password (min 6 chars)" required minLength={6} value={password}
            onChange={e=>setPassword(e.target.value)}
            style={{ width:'100%', padding:'0.75rem 1rem', marginBottom:'1.25rem',
                     borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)',
                     background:'rgba(255,255,255,0.06)', color:'white', boxSizing:'border-box' }} />
          {error && <p style={{ color:'#f87171', fontSize:'0.85rem', marginBottom:'1rem' }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'0.85rem', borderRadius:'10px', border:'none', color:'white',
                     background: loading ? '#374151' : 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                     cursor: loading ? 'not-allowed':'pointer', fontWeight:600 }}>
            {loading ? 'Creating account…' : 'Create Staff Account'}
          </button>
        </form>
        <p style={{ textAlign:'center', color:'#4b5563', fontSize:'0.85rem', marginTop:'1.5rem' }}>
          Already have an account?{' '}
          <Link to="/auth/staff-login" style={{ color:'#60a5fa' }}>Staff Login →</Link>
        </p>
      </div>
    </div>
  );
}