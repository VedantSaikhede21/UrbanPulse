import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { homeForRole } from '../../components/layout/RoleGuard';

export default function PostLogin() {
  useDocumentTitle('Redirecting...');
  const { role, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/auth/citizen-login', { replace: true }); return; }
    navigate(homeForRole(role), { replace: true });
  }, [role, loading, user, navigate]);

  return <div style={{ padding: '2rem', color: '#9ca3af' }}>Signing you in…</div>;
}