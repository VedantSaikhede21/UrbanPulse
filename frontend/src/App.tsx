import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleLayout } from './components/layout/RoleLayout';
import { AuthProvider } from './context/AuthContext';

// Public pages
import { Landing } from './pages/public/Landing';
import { About } from './pages/public/About';
import { PublicMap } from './pages/public/PublicMap';

// Auth pages
import CitizenLogin from './pages/auth/CitizenLogin';
import StaffLogin from './pages/auth/StaffLogin';

// Citizen pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { ReportIssue } from './pages/citizen/ReportIssue';
import { ReportDetail } from './pages/citizen/ReportDetail';
import { WardHealth } from './pages/citizen/WardHealth';
import { Profile } from './pages/citizen/Profile';
import { Notifications } from './pages/citizen/Notifications';

// Officer pages
import { OfficerQueue } from './pages/officer/OfficerQueue';
import { OfficerProfile } from './pages/officer/OfficerProfile';

// Dept Head pages
import { DepartmentDashboard } from './pages/dept/DepartmentDashboard';
import { DepartmentAnalytics } from './pages/dept/DepartmentAnalytics';
import { OfficerManagement } from './pages/dept/OfficerManagement';

// Admin pages
import { CityAnalytics } from './pages/admin/CityAnalytics';
import { Heatmap } from './pages/admin/Heatmap';
import { EscalationMonitor } from './pages/admin/EscalationMonitor';

// Super Admin pages
import { AdminDashboard } from './pages/super-admin/AdminDashboard';
import { UserManagement } from './pages/super-admin/UserManagement';
import { RoutingConfig } from './pages/super-admin/RoutingConfig';
import { AuditLog } from './pages/super-admin/AuditLog';
import { AgentMonitoring } from './pages/super-admin/AgentMonitoring';

// Shared pages
import { LiveAgentTrace } from './pages/shared/LiveAgentTrace';
import { Settings } from './pages/shared/Settings';
import { Support } from './pages/shared/Support';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <RoleLayout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/public-map" element={<PublicMap />} />

            {/* Auth routes */}
            <Route path="/auth/citizen-login" element={<CitizenLogin />} />
            <Route path="/auth/staff-login" element={<StaffLogin />} />
            
            {/* Deprecated redirects */}
            <Route path="/auth/login" element={<Navigate to="/auth/citizen-login" replace />} />
            <Route path="/auth/register" element={<Navigate to="/auth/citizen-login" replace />} />
            <Route path="/auth/admin-login" element={<Navigate to="/auth/staff-login" replace />} />

            {/* Citizen routes */}
            <Route path="/citizen" element={<CitizenDashboard />} />
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/report" element={<ReportIssue />} />
            <Route path="/citizen/report/:id" element={<ReportDetail />} />
            <Route path="/citizen/ward-health" element={<WardHealth />} />
            <Route path="/citizen/profile" element={<Profile />} />
            <Route path="/citizen/notifications" element={<Notifications />} />

            {/* Officer routes */}
            <Route path="/officer" element={<OfficerQueue />} />
            <Route path="/officer/queue" element={<OfficerQueue />} />
            <Route path="/officer/profile" element={<OfficerProfile />} />

            {/* Department Head routes */}
            <Route path="/dept" element={<DepartmentDashboard />} />
            <Route path="/dept/inbox" element={<DepartmentDashboard />} />
            <Route path="/dept/analytics" element={<DepartmentAnalytics />} />
            <Route path="/dept/officers" element={<OfficerManagement />} />

            {/* City Admin routes */}
            <Route path="/admin/city-analytics" element={<CityAnalytics />} />
            <Route path="/admin/dashboard" element={<CityAnalytics />} />
            <Route path="/admin/heatmap" element={<Heatmap />} />
            <Route path="/admin/escalation" element={<EscalationMonitor />} />

            {/* Super Admin routes */}
            <Route path="/super-admin" element={<AdminDashboard />} />
            <Route path="/super-admin/dashboard" element={<AdminDashboard />} />
            <Route path="/super-admin/users" element={<UserManagement />} />
            <Route path="/super-admin/routing" element={<RoutingConfig />} />
            <Route path="/super-admin/audit" element={<AuditLog />} />
            <Route path="/super-admin/monitoring" element={<AgentMonitoring />} />

            {/* Shared routes */}
            <Route path="/trace" element={<LiveAgentTrace />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RoleLayout>
      </Router>
    </AuthProvider>
  );
};

export default App;
