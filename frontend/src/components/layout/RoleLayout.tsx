import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { homeForRole } from './RoleGuard';
import { apiFetch, apiUrl } from '../../lib/api';
import {
  Menu, X, User, FileText, Map, AlertTriangle, BarChart2, CheckSquare, Settings, Play,
  HelpCircle, Home, Activity, Database, Users, Layers, ShieldCheck, LogOut
} from 'lucide-react';

export type UserRole = 'citizen' | 'officer' | 'dept' | 'admin' | 'superadmin' | 'public' | 'auth';

interface RoleLayoutProps {
  children: React.ReactNode;
}

export const RoleLayout: React.FC<RoleLayoutProps> = ({ children }) => {
  const { user, role, signOut } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [uhsScore, setUhsScore] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'degraded' | 'offline'>('checking');
  const location = useLocation();
  const navigate = useNavigate();

  // Real readiness probe. The header used to print a hardcoded
  // "SYSTEM STATUS: ONLINE", which claimed the backend was healthy even when it
  // was not. /api/health/ready is the same endpoint the readiness probe uses, so
  // the badge now reflects the API the page actually depends on.
  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      // AbortController gives the probe a deadline; without it a hung request
      // leaves the badge stuck on the previous value indefinitely.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        // apiUrl(), not a raw '/api/...' path: on Vercel the frontend and the
        // API live on different origins, so a same-origin path would 404 and
        // pin the badge to OFFLINE.
        const res = await fetch(apiUrl('/api/health/ready'), { cache: 'no-store', signal: controller.signal });
        if (cancelled) return;
        if (!res.ok) {
          setApiStatus(res.status >= 500 ? 'degraded' : 'offline');
          return;
        }
        const body = await res.json().catch(() => ({}));
        const ready = body?.ready ?? body?.status === 'ready';
        setApiStatus(ready ? 'online' : 'degraded');
      } catch {
        if (!cancelled) setApiStatus('offline');
      } finally {
        clearTimeout(timer);
      }
    };
    probe();
    const id = setInterval(probe, 60000);
    const onVisible = () => { if (document.visibilityState === 'visible') probe(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { cancelled = true; clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  const currentRole: UserRole = !user || !role ? 'public'
    : role === 'officer' ? 'officer'
    : role === 'dept_head' ? 'dept'
    : role === 'admin' ? 'admin'
    : role === 'super_admin' ? 'superadmin'
    : 'citizen';

  // Role-aware home so the brand mark always returns the user to the surface
  // they actually own, instead of bouncing anonymous users to a login wall.
  const roleHome = homeForRole(role);
  const roleLabel: Record<UserRole, string> = {
    public: 'Public', auth: 'Auth', citizen: 'Citizen', officer: 'Field Officer',
    dept: 'Dept Head', admin: 'City Admin', superadmin: 'Super Admin',
  };
  const accountLabel = user?.email || user?.phone || 'Guest session';
  const initials = (user?.email || user?.phone || 'U').slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      toast({ type: 'success', title: 'Signed out', message: 'Your session has ended securely.' });
      navigate('/auth/citizen-login', { replace: true });
    } catch {
      toast({ type: 'error', title: 'Sign out failed', message: 'Please try again.' });
    } finally {
      setSigningOut(false);
    }
  };

  // Live UHS ticker: fetch ward avg every 60s
  useEffect(() => {
    const fetchUhs = async () => {
      try {
        const res = await apiFetch('/api/analytics/wards');
        if (!res.ok) return;
        const wards = await res.json();
        if (wards.length > 0) {
          const avg = wards.reduce((s: number, w: { uhs_score: number }) => s + w.uhs_score, 0) / wards.length;
          setUhsScore(Math.round(avg * 10) / 10);
        }
      } catch {
        // silent fail — keep last known value
      }
    };
    fetchUhs();
    const interval = setInterval(fetchUhs, 60000);
    return () => clearInterval(interval);
  }, []);

  // Mobile drawer: close on Escape and stop the page behind it from scrolling.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  const navItemsByRole: Record<UserRole, Array<{ label: string; path: string; icon: React.ReactNode }>> = {
    public: [
      { label: 'Landing Page', path: '/', icon: <Home size={18} /> },
      { label: 'About System', path: '/about', icon: <HelpCircle size={18} /> },
      { label: 'Ward Health Map', path: '/public-map', icon: <Map size={18} /> },
    ],
    auth: [],
    citizen: [
      { label: 'My Reports', path: '/citizen', icon: <FileText size={18} /> },
      { label: 'Report Issue', path: '/citizen/report', icon: <AlertTriangle size={18} /> },
      { label: 'Ward Health View', path: '/citizen/ward-health', icon: <Activity size={18} /> },
      { label: 'Profile & Reputation', path: '/citizen/profile', icon: <User size={18} /> },
      { label: 'Notifications', path: '/citizen/notifications', icon: <HelpCircle size={18} /> },
    ],
    officer: [
      { label: 'Queue Dashboard', path: '/officer', icon: <CheckSquare size={18} /> },
      { label: 'Profile', path: '/officer/profile', icon: <User size={18} /> },
    ],
    dept: [
      { label: 'Department Overview', path: '/dept', icon: <Layers size={18} /> },
      { label: 'Dept Analytics', path: '/dept/analytics', icon: <BarChart2 size={18} /> },
      { label: 'Officer Workload', path: '/dept/officers', icon: <Users size={18} /> },
    ],
    admin: [
      { label: 'City Analytics', path: '/admin/city-analytics', icon: <BarChart2 size={18} /> },
      { label: 'Incident Map', path: '/admin/incident-map', icon: <Map size={18} /> },
      { label: 'Escalation Monitor', path: '/admin/escalation', icon: <AlertTriangle size={18} /> },
    ],
    superadmin: [
      { label: 'Admin Dashboard', path: '/super-admin', icon: <ShieldCheck size={18} /> },
      { label: 'User Management', path: '/super-admin/users', icon: <Users size={18} /> },
      { label: 'Routing Rules', path: '/super-admin/routing', icon: <Settings size={18} /> },
      { label: 'Audit Log', path: '/super-admin/audit', icon: <Database size={18} /> },
      { label: 'AI Console', path: '/super-admin/monitoring', icon: <Activity size={18} /> },
    ]
  };

  const sharedNavItems = [
    { label: 'Live Agent Trace', path: '/trace', icon: <Play size={18} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={18} /> },
    { label: 'Help / Support', path: '/support', icon: <HelpCircle size={18} /> },
  ];

  const currentNavItems = navItemsByRole[currentRole];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Skip-to-content: keyboard users bypass 20+ nav links on every page */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand-lime focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-background"
      >
        Skip to content
      </a>
      {/* Sidebar for Desktop */}
      <aside aria-label="Main navigation" className="hidden md:flex flex-col w-64 bg-panel-bg border-r border-panel-border shrink-0">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-panel-border flex flex-col space-y-2">
          <Link
            to={roleHome}
            className="group flex items-center space-x-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-panel-bg"
            aria-label={`UrbanPulse AI home for ${roleLabel[currentRole]}`}
          >
            <div className="w-8 h-8 rounded-lg bg-brand-lime flex items-center justify-center text-background font-bold text-base group-hover:bg-brand-lime-hover transition-colors">
              U
            </div>
            <span className="font-serif italic font-bold text-lg tracking-tight">
              UrbanPulse <span className="text-brand-lime">AI</span>
            </span>
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500 ml-0.5">
            Civic Triage Infrastructure
          </span>
        </div>

        {/* Sidebar Menu Items */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 scrollbar-thin">
          <div className="mb-4">
            <span className="px-2 text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-2">
              Navigation
            </span>
            <nav className="space-y-1">
              {currentNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center space-x-3 px-3 py-2 text-sm rounded transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-soft text-brand-lime border border-brand-lime/20 border-l-2 border-l-brand-lime font-medium'
                        : 'text-gray-400 hover:text-foreground hover:bg-panel-card border border-transparent'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
            
          <div className="pt-4 border-t border-panel-border">
            <span className="px-2 text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-2">
              Shared Tools
            </span>
            <nav className="space-y-1">
              {sharedNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center space-x-3 px-3 py-2 text-sm rounded transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-soft text-brand-lime border border-brand-lime/20 border-l-2 border-l-brand-lime font-medium'
                        : 'text-gray-400 hover:text-foreground hover:bg-panel-card border border-transparent'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-panel-border flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <Link
              to="/settings"
              className="flex items-center gap-2 min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
              aria-label="Open account settings"
            >
              <div className="w-6 h-6 shrink-0 rounded-full bg-gray-800 flex items-center justify-center text-[10px] text-gray-400 uppercase font-mono">
                {currentRole.slice(0, 2)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-foreground font-medium">{roleLabel[currentRole]}</span>
                {user ? (
                  <span className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">
                    {accountLabel}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500 font-mono">Guest Mode</span>
                )}
              </div>
            </Link>
            {user && (
              <button
                onClick={handleSignOut}
                title="Sign Out"
                aria-label="Sign out"
                aria-busy={signingOut}
                disabled={signingOut}
                className="p-2 -mr-1 rounded-md text-gray-500 hover:text-status-escalated hover:bg-panel-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-shortcuts-help'))}
            className="text-[10px] text-text-quaternary hover:text-text-tertiary transition-colors px-3 py-1 text-left"
            aria-label="Show keyboard shortcuts"
          >
            Press <kbd className="px-1 py-0.5 rounded bg-surface-raised border border-border-default text-[10px]">?</kbd> for shortcuts
          </button>
        </div>
      </aside>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Top Navbar — sticky so identity + logout are always reachable */}
        <header className="sticky top-0 z-30 h-16 bg-panel-bg/95 backdrop-blur-sm border-b border-panel-border flex items-center justify-between gap-3 px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden -ml-1 p-2 rounded-md text-gray-400 hover:text-foreground hover:bg-panel-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Brand mark doubles as the role home link on mobile, where the
                sidebar is hidden. Wordmark text drops below sm so the email
                and logout always keep their space. */}
            <Link
              to={roleHome}
              className="md:hidden flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
              aria-label={`UrbanPulse AI home for ${roleLabel[currentRole]}`}
            >
              <div className="w-7 h-7 shrink-0 rounded-md bg-brand-lime flex items-center justify-center text-background font-bold text-sm">
                U
              </div>
              <span className="hidden sm:inline font-serif italic font-bold text-sm">UrbanPulse</span>
            </Link>

            <div className="hidden md:block font-mono text-xs uppercase tracking-widest text-gray-500">
              SYSTEM STATUS:{' '}
              <span
                role="status"
                aria-live="polite"
                className={`font-bold ${
                  apiStatus === 'online' ? 'text-brand-lime'
                  : apiStatus === 'degraded' ? 'text-status-progress'
                  : apiStatus === 'offline' ? 'text-status-escalated'
                  : 'text-text-quaternary'
                }`}
              >
                {apiStatus === 'online' ? 'ONLINE'
                  : apiStatus === 'degraded' ? 'DEGRADED'
                  : apiStatus === 'offline' ? 'OFFLINE'
                  : 'CHECKING'}
              </span>
            </div>
            <div className="hidden lg:block font-mono text-[10px] uppercase tracking-widest text-text-quaternary">
              {roleLabel[currentRole]} workspace
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Live UHS ticker — secondary signal, dropped on narrow screens */}
            <div className="hidden lg:flex items-center space-x-2 bg-brand-soft border border-brand-lime/10 px-3 py-1 rounded shrink-0">
              <Activity size={12} className="text-brand-lime animate-pulse shrink-0" />
              <span className="font-mono text-xs text-brand-lime whitespace-nowrap">
                CITY UHS: <span className="font-bold">{uhsScore !== null ? uhsScore.toFixed(1) : '…'}</span>
              </span>
            </div>

            {user && (
              <>
                {/* Always-visible account identity (WCAG 2.4.1 wayfinding) */}
                <div className="flex items-center gap-2 bg-panel-card border border-panel-border rounded pl-1.5 pr-2 py-1 min-w-0">
                  <div
                    className="w-6 h-6 shrink-0 rounded-full bg-brand-soft border border-brand-lime/20 flex items-center justify-center text-[10px] font-mono text-brand-lime"
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex flex-col leading-tight">
                    <span className="text-[11px] text-foreground font-medium truncate max-w-[8.5rem] sm:max-w-[12rem]">
                      {accountLabel}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-quaternary truncate">
                      {roleLabel[currentRole]}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  aria-label="Sign out"
                  title="Sign Out"
                  aria-busy={signingOut}
                  data-testid="header-signout-btn"
                  disabled={signingOut}
                  className="flex items-center gap-2 bg-panel-card border border-panel-border hover:border-red-500/40 hover:text-red-400 text-gray-300 px-2.5 sm:px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
                >
                  <LogOut size={14} />
                  <span className="text-xs font-medium hidden sm:inline">Sign Out</span>
                </button>
              </>
            )}
          </div>
        </header>


        {/* Page Content */}
        <main id="main-content" aria-label="Page content" className="flex-1 overflow-y-auto bg-background scrollbar-thin">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside aria-label="Main navigation" className="relative flex flex-col w-64 bg-panel-bg border-r border-panel-border h-full">
            <div className="p-6 border-b border-panel-border flex items-center justify-between">
              <Link
                to={roleHome}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
                aria-label={`UrbanPulse AI home for ${roleLabel[currentRole]}`}
              >
                <div className="w-8 h-8 rounded bg-brand-lime flex items-center justify-center text-background font-bold text-lg">
                  U
                </div>
                <span className="font-serif italic font-bold text-lg">UrbanPulse AI</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation menu"
                className="-mr-2 p-2 rounded-md text-gray-400 hover:text-foreground hover:bg-panel-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime transition-colors"
              >
                <X size={20} />
              </button>
            </div>


            {/* Mobile Menu */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <nav className="space-y-1">
                {currentNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center space-x-3 px-3 py-2 text-sm rounded ${
                        isActive
                          ? 'bg-brand-soft text-brand-lime border border-brand-lime/20 border-l-2 border-l-brand-lime font-medium'
                          : 'text-gray-400 hover:text-foreground hover:bg-panel-card'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="pt-4 mt-4 border-t border-panel-border">
                <nav className="space-y-1">
                  {sharedNavItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center space-x-3 px-3 py-2 text-sm rounded ${
                          isActive
                            ? 'bg-brand-soft text-brand-lime border border-brand-lime/20 border-l-2 border-l-brand-lime font-medium'
                            : 'text-gray-400 hover:text-foreground hover:bg-panel-card'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Mobile drawer footer — identity + logout must not be sidebar-only */}
            {user && (
              <div className="p-4 border-t border-panel-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-brand-soft border border-brand-lime/20 flex items-center justify-center text-[10px] font-mono text-brand-lime">
                    {initials}
                  </div>
                  <div className="min-w-0 flex flex-col leading-tight">
                    <span className="text-xs text-foreground font-medium truncate max-w-[150px]">
                      {accountLabel}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-quaternary">
                      {roleLabel[currentRole]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  aria-busy={signingOut}
                  className="flex items-center gap-2 bg-panel-card border border-panel-border hover:border-status-escalated/30 hover:text-status-escalated text-gray-300 px-3 py-2 rounded-md transition-colors disabled:opacity-50 text-xs font-medium shrink-0"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};
