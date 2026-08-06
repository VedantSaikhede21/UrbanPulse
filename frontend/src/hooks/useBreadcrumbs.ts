import { useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeMap: Record<string, { label: string; parent?: string }> = {
  '/': { label: 'Home' },
  '/about': { label: 'About' },
  '/public-map': { label: 'Incident Map' },
  '/auth/citizen-login': { label: 'Citizen Login' },
  '/auth/staff-login': { label: 'Staff Login', parent: '/auth/citizen-login' },
  '/auth/staff-register': { label: 'Staff Registration' },
  '/citizen/dashboard': { label: 'Dashboard' },
  '/citizen/report': { label: 'Report Issue' },
  '/citizen/report/:id': { label: 'Report Details' },
  '/citizen/ward-health': { label: 'Ward Health' },
  '/citizen/profile': { label: 'Profile' },
  '/citizen/notifications': { label: 'Notifications' },
  '/officer/queue': { label: 'Queue' },
  '/officer/profile': { label: 'Officer Profile' },
  '/dept/inbox': { label: 'Inbox' },
  '/dept/analytics': { label: 'Analytics' },
  '/dept/officers': { label: 'Officer Management' },
  '/admin/city-analytics': { label: 'City Analytics' },
  '/admin/escalation': { label: 'Escalation Monitor' },
  '/super-admin/dashboard': { label: 'Dashboard' },
  '/super-admin/users': { label: 'User Management' },
  '/super-admin/routing': { label: 'Routing Config' },
  '/super-admin/audit': { label: 'Audit Log' },
  '/super-admin/monitoring': { label: 'Agent Monitoring' },
  '/settings': { label: 'Settings' },
  '/support': { label: 'Support' },
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  const pathname = location.pathname;

  // Try exact match first
  if (routeMap[pathname]) {
    const { label } = routeMap[pathname];
    const parentPath = routeMap[pathname].parent;
    if (parentPath && routeMap[parentPath]) {
      return [{ label, href: pathname }];
    }
    return [{ label }];
  }

  // Try pattern match for parameterized routes
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  for (let i = 0; i < segments.length; i++) {
    const partialPath = '/' + segments.slice(0, i + 1).join('/');
    if (routeMap[partialPath]) {
      items.push({ label: routeMap[partialPath].label, href: partialPath });
    }
  }

  if (items.length === 0 && segments.length > 0) {
    items.push({ label: segments[segments.length - 1].replace(/-/g, ' ') });
  }

  return items.slice(0, items.length - 1).concat(items[items.length - 1] ? [{ label: items[items.length - 1].label }] : []);
}
