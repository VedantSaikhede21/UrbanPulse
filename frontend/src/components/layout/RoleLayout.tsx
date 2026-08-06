import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import {
  Menu, X, Shield, User, FileText, Map, AlertTriangle, BarChart2, CheckSquare, Settings, Play,
  HelpCircle, Home, LogIn, Activity, Database, Users, Layers, ShieldCheck, LogOut
} from 'lucide-react';

export type UserRole = 'citizen' | 'officer' | 'dept' | 'admin' | 'superadmin' | 'public' | 'auth';

interface RoleLayoutProps {
  children: React.ReactNode;
}

export const RoleLayout: React.FC<RoleLayoutProps> = ({ children }) => {
  const { user, role, loading, signOut } = useAuth();
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uhsScore, setUhsScore] = useState<number | null>(null);
  const location = useLocation();

  // Sync currentRole with actual auth session when it loads/changes
  useEffect(() => {
    if (!loading) {
      if (user && role) {
        let layoutRole: UserRole = 'citizen';
        if (role === 'officer') layoutRole = 'officer';
        else if (role === 'dept_head') layoutRole = 'dept';
        else if (role === 'admin') layoutRole = 'admin';
        else if (role === 'super_admin') layoutRole = 'superadmin';
        setCurrentRole(layoutRole);
      } else {
        // If not logged in and not on landing pages, show auth nav items
        if (location.pathname.startsWith('/auth')) {
          setCurrentRole('auth');
        } else if (location.pathname === '/' || location.pathname === '/about' || location.pathname === '/public-map') {
          setCurrentRole('public');
        } else {
          setCurrentRole('public');
        }
      }
    }
  }, [user, role, loading, location.pathname]);

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

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
  };

  const navItemsByRole: Record<UserRole, Array<{ label: string; path: string; icon: React.ReactNode }>> = {
    public: [
      { label: 'Landing Page', path: '/', icon: <Home size={18} /> },
      { label: 'About System', path: '/about', icon: <HelpCircle size={18} /> },
      { label: 'Ward Health Map', path: '/public-map', icon: <Map size={18} /> },
    ],
    auth: [
      { label: 'Citizen Login (OTP)', path: '/auth/login', icon: <LogIn size={18} /> },
      { label: 'Citizen Register', path: '/auth/register', icon: <User size={18} /> },
      { label: 'Staff Login', path: '/auth/admin-login', icon: <Shield size={18} /> },
    ],
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
      { label: 'Kanban Dashboard', path: '/dept', icon: <Layers size={18} /> },
      { label: 'Dept Analytics', path: '/dept/analytics', icon: <BarChart2 size={18} /> },
      { label: 'Officer Workload', path: '/dept/officers', icon: <Users size={18} /> },
    ],
    admin: [
      { label: 'City Analytics', path: '/admin/city-analytics', icon: <BarChart2 size={18} /> },
      { label: 'Incident Map', path: '/admin/heatmap', icon: <Map size={18} /> },
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
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Sidebar for Desktop */}
      <aside aria-label="Main navigation" className="hidden md:flex flex-col w-64 bg-panel-bg border-r border-panel-border shrink-0">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-panel-border flex flex-col space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-lime flex items-center justify-center text-background font-bold text-base shadow-sm shadow-brand-lime/20">
              U
            </div>
            <span className="font-serif italic font-bold text-lg tracking-tight">
              UrbanPulse <span className="text-brand-lime">AI</span>
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-gray-500 ml-0.5">
            Civic Triage Infrastructure
          </span>
        </div>

        {/* Demo Role Switcher */}
        <div className="p-4 mx-4 my-3 bg-panel-card border border-panel-border rounded">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">
            Demo Context Role:
          </label>
          <select
            aria-label="Demo context role"
            value={currentRole}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            className="w-full bg-background border border-panel-border text-foreground rounded py-1 px-2 text-xs font-mono focus:outline-none focus:border-brand-lime"
          >
            <option value="public">Public (Guest)</option>
            <option value="auth">Authentication</option>
            <option value="citizen">Citizen Role</option>
            <option value="officer">Field Officer</option>
            <option value="dept">Dept Head</option>
            <option value="admin">City Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>

        {/* Sidebar Menu Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
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
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] text-gray-400 uppercase font-mono">
                {currentRole.slice(0, 2)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-foreground font-medium capitalize">{currentRole}</span>
                {user ? (
                  <span className="text-[9px] text-gray-500 font-mono truncate max-w-[120px]">
                    {user.phone || user.email}
                  </span>
                ) : (
                  <span className="text-[9px] text-gray-500 font-mono">Guest Mode</span>
                )}
              </div>
            </div>
            {user && (
              <button
                onClick={signOut}
                title="Sign Out"
                aria-label="Sign out"
                className="text-gray-500 hover:text-red-400 transition-colors p-1"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-shortcuts-help'))}
            className="text-[10px] text-text-quaternary hover:text-text-tertiary transition-colors px-3 py-1"
            aria-label="Show keyboard shortcuts"
          >
            Press <kbd className="px-1 py-0.5 rounded bg-surface-raised border border-border-default text-[9px]">?</kbd> for shortcuts
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-panel-bg border-b border-panel-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center space-x-4 md:space-x-0">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden text-gray-400 hover:text-foreground focus:outline-none"
            >
              <Menu size={20} />
            </button>
            <div className="font-mono text-xs uppercase tracking-widest text-gray-500 hidden sm:block">
              SYSTEM STATUS: <span className="text-brand-lime font-bold">ONLINE</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live UHS Ticker placeholder */}
            <div className="flex items-center space-x-2 bg-brand-soft border border-brand-lime/10 px-3 py-1 rounded">
              <Activity size={12} className="text-brand-lime animate-pulse" />
              <span className="font-mono text-xs text-brand-lime">
                CITY UHS: <span className="font-bold">{uhsScore !== null ? uhsScore.toFixed(1) : '…'}</span>
              </span>
            </div>

            {/* Always-visible Sign Out button */}
            {user && (
              <button
                onClick={signOut}
                aria-label="Sign out"
                data-testid="header-signout-btn"
                className="flex items-center space-x-2 bg-panel-card border border-panel-border hover:border-red-500/40 hover:text-red-400 text-gray-300 px-3 py-1.5 rounded transition-colors"
              >
                <LogOut size={14} />
                <span className="text-xs font-medium hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main aria-label="Page content" className="flex-1 overflow-y-auto bg-background">
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-brand-lime flex items-center justify-center text-background font-bold text-lg">
                  U
                </div>
                <span className="font-serif italic font-bold text-lg">UrbanPulse AI</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation menu"
                className="text-gray-400 hover:text-foreground focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Switcher */}
            <div className="p-4 bg-panel-card border-b border-panel-border">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">
                Demo Role:
              </label>
              <select
                aria-label="Demo context role"
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full bg-background border border-panel-border text-foreground rounded py-1 px-2 text-xs font-mono"
              >
                <option value="public">Public</option>
                <option value="auth">Auth</option>
                <option value="citizen">Citizen</option>
                <option value="officer">Officer</option>
                <option value="dept">Dept Head</option>
                <option value="admin">City Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
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
          </aside>
        </div>
      )}
    </div>
  );
};
