import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, Map, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { homeForRole } from '../../components/layout/RoleGuard';
import { fadeInUp } from '../../lib/motion';

const SUGGESTIONS = [
  { to: '/', label: 'Landing page', detail: 'What UrbanPulse AI does', icon: Home },
  { to: '/public-map', label: 'Ward Health Map', detail: 'Live civic issues across the city', icon: Map },
  { to: '/auth/citizen-login', label: 'Citizen Portal', detail: 'Report and track an issue', icon: Compass },
];

/**
 * Unknown routes used to silently redirect to `/`, which left a mistyped URL
 * looking like a dead page. This states what happened and offers the two or
 * three places the visitor most likely wanted.
 */
export default function NotFound() {
  useDocumentTitle('Page Not Found');
  const location = useLocation();
  const { user, role } = useAuth();
  const dashboardLabel = user ? 'Go to my dashboard' : 'Back to home';

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-6 font-sans">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="w-full max-w-lg text-center"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-quaternary">
          Error 404
        </p>
        <h1 className="mt-3 text-display-md font-bold text-text-primary tracking-tight">
          This page does not exist
        </h1>
        <p className="mt-2 text-body text-text-secondary break-all">
          <code className="font-mono text-caption text-text-tertiary">{location.pathname}</code>
        </p>

        <div className="mt-7">
          <Link
            to={user ? homeForRole(role) : '/'}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-brand-lime text-background hover:bg-brand-lime-hover active:scale-[0.98] font-semibold text-body-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
          >
            {dashboardLabel}
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-10 text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-quaternary mb-3">
            Were you looking for
          </p>
          <ul className="space-y-2">
            {SUGGESTIONS.map(({ to, label, detail, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex items-center gap-3 rounded-lg border border-panel-border bg-panel-card p-3.5 hover:bg-panel-hover hover:border-border-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
                >
                  <div className="w-8 h-8 shrink-0 rounded-md bg-panel-bg border border-panel-border flex items-center justify-center">
                    <Icon size={15} className="text-text-tertiary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium text-text-primary">{label}</p>
                    <p className="text-caption text-text-tertiary">{detail}</p>
                  </div>
                  <ArrowRight size={14} className="ml-auto shrink-0 text-text-quaternary" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
