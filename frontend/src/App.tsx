// heat map is remaining

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleLayout } from './components/layout/RoleLayout';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import StaffRegister from './pages/auth/StaffRegister';
import { RoleGuard } from './components/layout/RoleGuard';
import PostLogin from './pages/auth/PostLogin';

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
const Settings = lazy(() => import('./pages/shared/Settings').then(m => ({ default: m.Settings })));
const Support = lazy(() => import('./pages/shared/Support').then(m => ({ default: m.Support })));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <RoleLayout>
            <ErrorBoundary>
              <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-500"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>Loading...</div>}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/about" element={<About />} />
                <Route path="/public-map" element={<PublicMap />} />
                 

                {/* Auth routes */}
                <Route path="/auth/citizen-login" element={<CitizenLogin />} />
                <Route path="/auth/staff-login" element={<StaffLogin />} />
                <Route path="/auth/staff-register" element={<StaffRegister />} />
                
                
                {/* Deprecated redirects */}
                <Route path="/auth/login" element={<Navigate to="/auth/citizen-login" replace />} />
                <Route path="/auth/register" element={<Navigate to="/auth/citizen-login" replace />} />
                <Route path="/auth/admin-login" element={<Navigate to="/auth/staff-login" replace />} />

                {/* Citizen routes */}
                <Route path="/citizen" element={<RoleGuard allow={['citizen']}><CitizenDashboard /></RoleGuard>} />
                <Route path="/citizen/dashboard"      element={<RoleGuard allow={['citizen']}><CitizenDashboard /></RoleGuard>} />
                <Route path="/citizen/report"         element={<RoleGuard allow={['citizen']}><ReportIssue /></RoleGuard>} />
                <Route path="/citizen/report/:id"     element={<RoleGuard allow={['citizen']}><ReportDetail /></RoleGuard>} />
                <Route path="/citizen/ward-health"    element={<RoleGuard allow={['citizen']}><WardHealth /></RoleGuard>} />
                <Route path="/citizen/profile"        element={<RoleGuard allow={['citizen']}><Profile /></RoleGuard>} />
                <Route path="/citizen/notifications"  element={<RoleGuard allow={['citizen']}><Notifications /></RoleGuard>} />
                
                {/* Officer routes */}
                <Route path="/officer"                element={<RoleGuard allow={['officer','dept_head','admin','super_admin']}><OfficerQueue /></RoleGuard>} />
                <Route path="/officer/queue"          element={<RoleGuard allow={['officer','dept_head','admin','super_admin']}><OfficerQueue /></RoleGuard>} />
                <Route path="/officer/profile"        element={<RoleGuard allow={['officer','dept_head','admin','super_admin']}><OfficerProfile /></RoleGuard>} />
                <Route path="/citizen/processing/:id" element={<ProcessingPage />} />
                <Route path="/auth/post-login" element={<PostLogin />} />

                {/* Department Head routes */}
                <Route path="/dept"                   element={<RoleGuard allow={['dept_head','admin','super_admin']}><DepartmentDashboard /></RoleGuard>} />
                <Route path="/dept/inbox"             element={<RoleGuard allow={['dept_head','admin','super_admin']}><DepartmentDashboard /></RoleGuard>} />
                <Route path="/dept/analytics"         element={<RoleGuard allow={['dept_head','admin','super_admin']}><DepartmentAnalytics /></RoleGuard>} />
                <Route path="/dept/officers"          element={<RoleGuard allow={['dept_head','admin','super_admin']}><OfficerManagement /></RoleGuard>} /> 
                
                {/* City Admin routes */}
                <Route path="/admin/city-analytics"   element={<RoleGuard allow={['admin','super_admin']}><CityAnalytics /></RoleGuard>} />
                <Route path="/admin/dashboard"        element={<RoleGuard allow={['admin','super_admin']}><CityAnalytics /></RoleGuard>} />
                <Route path="/admin/heatmap" element={<Navigate to="/admin/incident-map" replace />} />
                <Route path="/admin/escalation"       element={<RoleGuard allow={['admin','super_admin']}><EscalationMonitor /></RoleGuard>} />

                {/* Super Admin routes */}
                <Route path="/super-admin"            element={<RoleGuard allow={['super_admin']}><AdminDashboard /></RoleGuard>} />
                <Route path="/super-admin/dashboard"  element={<RoleGuard allow={['super_admin']}><AdminDashboard /></RoleGuard>} />
                <Route path="/super-admin/users"      element={<RoleGuard allow={['super_admin']}><UserManagement /></RoleGuard>} />
                <Route path="/super-admin/routing"    element={<RoleGuard allow={['super_admin']}><RoutingConfig /></RoleGuard>} />
                <Route path="/super-admin/audit"      element={<RoleGuard allow={['super_admin']}><AuditLog /></RoleGuard>} />
                <Route path="/super-admin/monitoring" element={<RoleGuard allow={['super_admin']}><AgentMonitoring /></RoleGuard>} />
                <Route path="/admin/:mapView" element={<RoleGuard allow={['admin','super_admin']}><IncidentMap /></RoleGuard>} />

                {/* Shared routes */}
                <Route path="/trace" element={<LiveAgentTrace />} />
                <Route path="/trace/:ticketId" element={<LiveAgentTrace />} />
                <Route path="/shared/trace/:ticketId" element={<LiveAgentTrace />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/support" element={<Support />} />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Suspense>
            </ErrorBoundary>
          </RoleLayout>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
