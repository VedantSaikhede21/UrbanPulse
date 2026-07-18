import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../lib/auth';

interface Props {
  allow: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<Props> = ({ allow, children }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: '2rem', color: '#9ca3af' }}>Loading…</div>;

  if (!user) {
    if (import.meta.env.DEV) {
      return <>{children}</>;
    }
    const target = allow.includes('citizen') ? '/auth/citizen-login' : '/auth/staff-login';
    return <Navigate to={target} state={{ from: location }} replace />;
  }

  if (!role || !allow.includes(role)) {
    return <Navigate to={homeForRole(role)} replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export function homeForRole(role: UserRole | null): string {
  switch (role) {
    case 'citizen':     return '/citizen';
    case 'officer':     return '/officer';
    case 'dept_head':   return '/dept';
    case 'admin':       return '/admin/city-analytics';
    case 'super_admin': return '/super-admin';
    default:            return '/';
  }
}