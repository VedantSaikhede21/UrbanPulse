import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, AlertTriangle, Plus, MapPin, Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { MetricCard } from '../../components/ui/Card';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { apiFetch } from '../../lib/api';
import type { Ticket } from '../../lib/types';


const OPEN_STATUSES = ['reported', 'assigned', 'in_progress'];
const RESOLVED_STATUSES = ['resolved', 'verified'];

function statusBadgeValue(status: string): string {
  if (status === 'reported') return 'new';
  if (status === 'in_progress') return 'in progress';
  return status;
}

function priorityBadgeValue(score: number): string {
  if (score >= 3) return 'high';
  if (score === 2) return 'medium';
  return 'low';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const CitizenDashboard: React.FC = () => {
  useDocumentTitle('Dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch('/api/tickets')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load tickets (${res.status})`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          setTickets(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Could not load tickets');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const totalReports = tickets.length;
  const openReports = tickets.filter(t => OPEN_STATUSES.includes(t.status)).length;
  const resolvedReports = tickets.filter(t => RESOLVED_STATUSES.includes(t.status)).length;
  const recentTickets = tickets.slice(0, 6);

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen text-foreground font-sans">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1.5">Failed to load dashboard</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-5 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 min-h-screen text-foreground relative font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-panel-border pb-6">
        <div>
          <h1 className="text-2xl font-serif italic font-bold">Welcome back, Citizen</h1>
          <p className="text-gray-500 text-xs mt-1">Monitor your infrastructure requests and view auto-triage resolutions.</p>
        </div>
        <Link
          to="/citizen/report"
          className="inline-flex items-center space-x-2 bg-brand-lime text-background hover:bg-brand-lime-hover font-semibold px-5 py-2.5 rounded transition-all duration-150 self-start md:self-auto text-sm"
        >
          <Plus size={16} />
          <span>New Report</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="My Total Reports" icon={<FileText size={20} />}>
          {loading ? <div className="h-8 w-16 shimmer rounded" /> : totalReports}
        </MetricCard>
        <MetricCard label="Open Reports" icon={<TrendingUp size={20} />}>
          {loading ? <div className="h-8 w-16 shimmer rounded" /> : openReports}
        </MetricCard>
        <MetricCard label="Issues Resolved" icon={<CheckCircle2 size={20} />} accent>
          {loading ? <div className="h-8 w-16 shimmer rounded" /> : resolvedReports}
        </MetricCard>
      </div>

      {/* Recent Reports */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif italic font-bold flex items-center gap-2">
          <span>Recent Reports</span>
          {!loading && (
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-panel-card border border-panel-border text-gray-400 font-normal">
              {totalReports} total
            </span>
          )}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No reports filed yet"
            message="Your filed tickets will show up here. Report an issue to begin."
            action={{ label: 'Report Infrastructure Issue', onClick: () => window.location.href = '/citizen/report' }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentTickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
              <Link
                to={`/citizen/report/${ticket.id}`}
                className="block bg-panel-card border border-panel-border hover:border-brand-lime/20 rounded-lg p-6 transition-all duration-200 group card-glow"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-serif italic font-bold text-gray-100 group-hover:text-brand-lime transition-colors">
                      {ticket.category}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge type="priority" value={priorityBadgeValue(ticket.priority_score)} />
                      <Badge type="status" value={statusBadgeValue(ticket.status)} />
                    </div>
                  </div>

                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                    {ticket.description || 'No description provided.'}
                  </p>
                </div>

                <div className="border-t border-panel-border/60 pt-4 mt-4 flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span>{ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>{ticket.created_at ? timeAgo(ticket.created_at) : 'Today'}</span>
                  </div>
                </div>
              </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        to="/citizen/report"
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-lime hover:bg-brand-lime-hover text-background rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 md:hidden z-40 border border-brand-lime/20"
      >
        <Plus size={24} />
      </Link>

    </div>
  );
};
