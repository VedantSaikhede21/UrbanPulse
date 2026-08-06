import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Bell, CheckCircle2, AlertTriangle, Info, X, Clock } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

interface Notification {
  id: string;
  type: 'status' | 'alert' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'status', title: 'Report Resolved', message: 'Your pothole report #URB-2024-0421 has been marked as resolved.', time: '2h ago', read: false },
  { id: '2', type: 'alert', title: 'Escalation Update', message: 'Water leakage issue escalated to priority due to community impact.', time: '5h ago', read: false },
  { id: '3', type: 'info', title: 'Officer Assigned', message: 'An officer has been assigned to your streetlight report.', time: '1d ago', read: true },
  { id: '4', type: 'status', title: 'Verification Needed', message: 'Please confirm the resolution of your garbage collection report.', time: '2d ago', read: true },
  { id: '5', type: 'info', title: 'Agent Processing Complete', message: 'All 8 AI agents have finished processing your latest report.', time: '3d ago', read: true },
];

const TYPE_CONFIG = {
  status: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-800/20' },
  alert: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-950/30 border-amber-800/20' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-950/30 border-blue-800/20' },
};

export const Notifications: React.FC = () => {
  useDocumentTitle('Notifications');
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 min-h-screen text-foreground font-sans">
      <div className="flex items-center justify-between border-b border-panel-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif italic font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-1">Updates on your reports and platform activity.</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs text-gray-400 hover:text-brand-lime transition-colors flex items-center gap-1.5"
            aria-label="Mark all as read"
          >
            <CheckCircle2 size={12} />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              filter === f
                ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/20'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
            aria-pressed={filter === f}
          >
            {f === 'all' ? 'All' : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="All caught up"
              message={filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
            />
          ) : (
            filtered.map((n, i) => {
              const config = TYPE_CONFIG[n.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex items-start gap-4 bg-panel-card border border-panel-border rounded-lg p-4 group ${
                    !n.read ? 'border-l-2 border-l-brand-lime' : ''
                  }`}
                  onClick={() => markRead(n.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.title}: ${n.message}`}
                  onKeyDown={e => { if (e.key === 'Enter') markRead(n.id); }}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-medium ${!n.read ? 'text-gray-100' : 'text-gray-400'}`}>
                        {n.title}
                      </span>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-lime shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-gray-600">
                        <Clock size={10} />
                        {n.time}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); dismissNotification(n.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-panel-border/30 text-gray-500 hover:text-gray-300 transition-all"
                    aria-label={`Dismiss ${n.title}`}
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
