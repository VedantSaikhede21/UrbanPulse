import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, FileText, CheckCircle2, Users, TrendingUp,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { MetricCard } from '../../components/ui/Card';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { apiFetch } from '../../lib/api';
import type { Ticket } from '../../lib/types';
import type { Officer } from '../../lib/types';



const OPEN_STATUSES = ['reported', 'assigned', 'in_progress'];
const RESOLVED_STATUSES = ['resolved', 'verified'];

function statusBadgeValue(s: string): string {
  if (s === 'reported') return 'new';
  if (s === 'in_progress') return 'in progress';
  return s;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export const AdminDashboard: React.FC = () => {
  useDocumentTitle('Admin Dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch('/api/tickets'),
      apiFetch('/api/officers/queue'),
    ])
      .then(async ([ticketRes, officerRes]) => {
        if (!ticketRes.ok) throw new Error(`Tickets API error (${ticketRes.status})`);
        if (!officerRes.ok) throw new Error(`Officers API error (${officerRes.status})`);
        return Promise.all([ticketRes.json(), officerRes.json()]);
      })
      .then(([ticketData, officerData]) => {
        setTickets(ticketData);
        setOfficers(officerData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => OPEN_STATUSES.includes(t.status)).length;
  const resolvedTickets = tickets.filter(t => RESOLVED_STATUSES.includes(t.status)).length;
  const activeOfficers = officers.length;
  const recentTickets = tickets.slice(-5).reverse();

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <div role="alert" className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Failed to load dashboard</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-5">{error}</p>
          <button type="button" aria-label="Retry loading dashboard" onClick={loadData} className="px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen">

      <div className="border-b border-panel-border pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Super Admin Dashboard</h1>
        <p className="text-gray-500 text-xs mt-1">
          System-wide overview — ticket metrics, active officers, and recent activity.
        </p>
      </div>

      {loading ? (
        <div role="status" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-panel-card border border-panel-border rounded-lg p-5 space-y-4 animate-pulse">
              <div className="h-3 w-2/5 bg-gray-700/50 rounded" />
              <div className="h-8 w-1/4 bg-gray-700/50 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard label="Total Tickets" icon={<FileText size={18} />}>
              {totalTickets}
            </MetricCard>
            <MetricCard label="Open" icon={<TrendingUp size={18} />}>
              {openTickets}
            </MetricCard>
            <MetricCard label="Resolved" icon={<CheckCircle2 size={18} />} accent>
              {resolvedTickets}
            </MetricCard>
            <MetricCard label="Active Officers" icon={<Users size={18} />}>
              {activeOfficers}
            </MetricCard>
          </div>

          <div className="bg-panel-card border border-panel-border rounded-lg card-glow overflow-hidden">
            <div className="px-5 py-4 border-b border-panel-border flex items-center justify-between">
              <h3 className="text-sm font-semibold">Recent Tickets</h3>
              <span className="text-[10px] font-mono text-gray-500">{recentTickets.length} entries</span>
            </div>
            {recentTickets.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <FileText size={28} className="text-gray-600 mb-3" />
                <p className="text-sm text-gray-500">No tickets found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-panel-border text-gray-500 text-[10px] font-mono uppercase tracking-wider">
                      <th className="text-left px-5 py-3 font-medium">ID</th>
                      <th className="text-left px-5 py-3 font-medium">Category</th>
                      <th className="text-left px-5 py-3 font-medium">Status</th>
                      <th className="text-left px-5 py-3 font-medium">Priority</th>
                      <th className="text-left px-5 py-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map((ticket, i) => (
                      <motion.tr
                        key={ticket.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className="border-b border-panel-border/50 hover:bg-panel-bg/60 transition-colors"
                      >
                        <td className="px-5 py-3 font-mono text-gray-400">#{ticket.id.slice(0, 8)}</td>
                        <td className="px-5 py-3 text-foreground font-medium">{ticket.category}</td>
                        <td className="px-5 py-3">
                          <Badge type="status" value={statusBadgeValue(ticket.status)} />
                        </td>
                        <td className="px-5 py-3">
                          <Badge type="priority" value={ticket.priority_score >= 3 ? 'high' : ticket.priority_score === 2 ? 'medium' : 'low'} />
                        </td>
                        <td className="px-5 py-3 text-gray-500 font-mono">{formatDate(ticket.created_at)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
