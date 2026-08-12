import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { RoleLayout } from './components/layout/RoleLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { RoleGuard } from './components/layout/RoleGuard';
import { pageTransition } from './lib/motion';
import { KeyboardShortcutsHelp } from './components/ui/KeyboardShortcutsHelp';

const Landing = lazy(() => import('./pages/public/Landing').then(m => ({ default: m.Landing })));
const About = lazy(() => import('./pages/public/About').then(m => ({ default: m.About })));
const PublicMap = lazy(() => import('./pages/public/PublicMap').then(m => ({ default: m.PublicMap })));
const CitizenLogin = lazy(() => import('./pages/auth/CitizenLogin'));
const StaffLogin = lazy(() => import('./pages/auth/StaffLogin'));
const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard').then(m => ({ default: m.CitizenDashboard })));
const ReportIssue = lazy(() => import('./pages/citizen/ReportIssue').then(m => ({ default: m.ReportIssue })));
const ReportDetail = lazy(() => import('./pages/citizen/ReportDetail').then(m => ({ default: m.ReportDetail })));
const ProcessingPage = lazy(() => import('./pages/citizen/ProcessingPage').then(m => ({ default: m.ProcessingPage })));
const WardHealth = lazy(() => import('./pages/citizen/WardHealth').then(m => ({ default: m.WardHealth })));
const Profile = lazy(() => import('./pages/citizen/Profile').then(m => ({ default: m.Profile })));
const Notifications = lazy(() => import('./pages/citizen/Notifications').then(m => ({ default: m.Notifications })));
const OfficerQueue = lazy(() => import('./pages/officer/OfficerQueue').then(m => ({ default: m.OfficerQueue })));
const OfficerProfile = lazy(() => import('./pages/officer/OfficerProfile').then(m => ({ default: m.OfficerProfile })));
const DepartmentDashboard = lazy(() => import('./pages/dept/DepartmentDashboard').then(m => ({ default: m.DepartmentDashboard })));
const DepartmentAnalytics = lazy(() => import('./pages/dept/DepartmentAnalytics').then(m => ({ default: m.DepartmentAnalytics })));
const OfficerManagement = lazy(() => import('./pages/dept/OfficerManagement').then(m => ({ default: m.OfficerManagement })));
const CityAnalytics = lazy(() => import('./pages/admin/CityAnalytics').then(m => ({ default: m.CityAnalytics })));
const IncidentMap = lazy(() => import('./pages/admin/IncidentMap').then(m => ({ default: m.IncidentMap })));
const EscalationMonitor = lazy(() => import('./pages/admin/EscalationMonitor').then(m => ({ default: m.EscalationMonitor })));

const AdminDashboard = lazy(() => import('./pages/super-admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UserManagement = lazy(() => import('./pages/super-admin/UserManagement').then(m => ({ default: m.UserManagement })));
const RoutingConfig = lazy(() => import('./pages/super-admin/RoutingConfig').then(m => ({ default: m.RoutingConfig })));
const AuditLog = lazy(() => import('./pages/super-admin/AuditLog').then(m => ({ default: m.AuditLog })));
const AgentMonitoring = lazy(() => import('./pages/super-admin/AgentMonitoring').then(m => ({ default: m.AgentMonitoring })));
const LiveAgentTrace = lazy(() => import('./pages/shared/LiveAgentTrace').then(m => ({ default: m.LiveAgentTrace })));
const StaffRegister = lazy(() => import('./pages/auth/StaffRegister'));
const PostLogin = lazy(() => import('./pages/auth/PostLogin'));
const Settings = lazy(() => import('./pages/shared/Settings').then(m => ({ default: m.Settings })));
const Support = lazy(() => import('./pages/shared/Support').then(m => ({ default: m.Support })));

const fallback = (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-8 h-8 rounded-full border-2 border-brand-lime/30 border-t-brand-lime animate-spin" />
    <p className="text-xs text-gray-500 font-mono animate-pulse">Loading...</p>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:p-4 focus:bg-[#161616] focus:text-brand-lime focus:text-sm focus:font-semibold focus:outline-none">
            Skip to main content
          </a>
          <KeyboardShortcutsHelp />
          <ErrorBoundary>
            <Suspense fallback={fallback}>
              <PublicRoutes />
            </Suspense>
          </ErrorBoundary>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

function PublicRoutes() {
  const location = useLocation();
  const isPublicRoute = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/public-map'
    || location.pathname.startsWith('/auth/') || location.pathname === '/support' || location.pathname === '/settings'
    || location.pathname.startsWith('/trace') || location.pathname.startsWith('/citizen/processing/');

  if (isPublicRoute) {
    return (
      <AnimatePresence mode="wait">
        <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" key={location.pathname}>
          <PublicLayout>
            <div id="main-content">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Landing />} />
                <Route path="/about" element={<About />} />
                <Route path="/public-map" element={<PublicMap />} />
                <Route path="/auth/citizen-login" element={<CitizenLogin />} />
                <Route path="/auth/staff-login" element={<StaffLogin />} />
                <Route path="/auth/staff-register" element={<StaffRegister />} />
                <Route path="/auth/login" element={<Navigate to="/auth/citizen-login" replace />} />
                <Route path="/auth/register" element={<Navigate to="/auth/citizen-login" replace />} />
                <Route path="/auth/admin-login" element={<Navigate to="/auth/staff-login" replace />} />
                <Route path="/auth/post-login" element={<PostLogin />} />
                <Route path="/citizen/processing/:ticketId" element={<ProcessingPage />} />
                <Route path="/trace" element={<LiveAgentTrace />} />
                <Route path="/trace/:ticketId" element={<LiveAgentTrace />} />
                <Route path="/shared/trace/:ticketId" element={<LiveAgentTrace />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/support" element={<Support />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </PublicLayout>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <RoleLayout>
      <AnimatePresence mode="wait">
        <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" key={location.pathname}>
          <div id="main-content">
            <Suspense fallback={fallback}>
              <Routes location={location} key={location.pathname}>
                <Route path="/citizen" element={<RoleGuard allow={['citizen']}><CitizenDashboard /></RoleGuard>} />
                <Route path="/citizen/dashboard" element={<RoleGuard allow={['citizen']}><CitizenDashboard /></RoleGuard>} />
                <Route path="/citizen/report" element={<RoleGuard allow={['citizen']}><ReportIssue /></RoleGuard>} />
                <Route path="/citizen/report/:id" element={<RoleGuard allow={['citizen']}><ReportDetail /></RoleGuard>} />
                <Route path="/citizen/ward-health" element={<RoleGuard allow={['citizen']}><WardHealth /></RoleGuard>} />
                <Route path="/citizen/profile" element={<RoleGuard allow={['citizen']}><Profile /></RoleGuard>} />
                <Route path="/citizen/notifications" element={<RoleGuard allow={['citizen']}><Notifications /></RoleGuard>} />
                <Route path="/officer" element={<RoleGuard allow={['officer','dept_head','admin','super_admin']}><OfficerQueue /></RoleGuard>} />
                <Route path="/officer/queue" element={<RoleGuard allow={['officer','dept_head','admin','super_admin']}><OfficerQueue /></RoleGuard>} />
                <Route path="/officer/profile" element={<RoleGuard allow={['officer','dept_head','admin','super_admin']}><OfficerProfile /></RoleGuard>} />
                <Route path="/dept" element={<RoleGuard allow={['dept_head','admin','super_admin']}><DepartmentDashboard /></RoleGuard>} />
                <Route path="/dept/inbox" element={<RoleGuard allow={['dept_head','admin','super_admin']}><DepartmentDashboard /></RoleGuard>} />
                <Route path="/dept/analytics" element={<RoleGuard allow={['dept_head','admin','super_admin']}><DepartmentAnalytics /></RoleGuard>} />
                <Route path="/dept/officers" element={<RoleGuard allow={['dept_head','admin','super_admin']}><OfficerManagement /></RoleGuard>} />
                <Route path="/admin/city-analytics" element={<RoleGuard allow={['admin','super_admin']}><CityAnalytics /></RoleGuard>} />
                <Route path="/admin/dashboard" element={<RoleGuard allow={['admin','super_admin']}><CityAnalytics /></RoleGuard>} />
                <Route path="/admin/heatmap" element={<Navigate to="/admin/incident-map" replace />} />
                <Route path="/admin/escalation" element={<RoleGuard allow={['admin','super_admin']}><EscalationMonitor /></RoleGuard>} />
                <Route path="/super-admin" element={<RoleGuard allow={['super_admin']}><AdminDashboard /></RoleGuard>} />
                <Route path="/super-admin/dashboard" element={<RoleGuard allow={['super_admin']}><AdminDashboard /></RoleGuard>} />
                <Route path="/super-admin/users" element={<RoleGuard allow={['super_admin']}><UserManagement /></RoleGuard>} />
                <Route path="/super-admin/routing" element={<RoleGuard allow={['super_admin']}><RoutingConfig /></RoleGuard>} />
                <Route path="/super-admin/audit" element={<RoleGuard allow={['super_admin']}><AuditLog /></RoleGuard>} />
                <Route path="/super-admin/monitoring" element={<RoleGuard allow={['super_admin']}><AgentMonitoring /></RoleGuard>} />
                <Route path="/admin/:mapView" element={<RoleGuard allow={['admin','super_admin']}><IncidentMap /></RoleGuard>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </motion.div>
      </AnimatePresence>
    </RoleLayout>
  );
}

export default App;
