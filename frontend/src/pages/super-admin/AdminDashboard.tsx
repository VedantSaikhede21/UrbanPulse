import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, FileText, Clock, CheckCircle2, Users,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { apiFetch } from '../../lib/api';

interface Ticket {
  id: string;
  category: string;
  status: string;
  severity: string;
  priority_score: number;
  created_at: string;
}

interface Officer {
  id: string;
}

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
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Failed to load dashboard</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-5">{error}</p>
          <button type="button" onClick={loadData} className="px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Total Tickets</span>
                <span className="text-2xl font-serif italic font-bold block">{totalTickets}</span>
              </div>
              <div className="w-10 h-10 rounded bg-panel-bg flex items-center justify-center text-gray-400 border border-panel-border">
                <FileText size={18} />
              </div>
            </div>
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Open</span>
                <span className="text-2xl font-serif italic font-bold block">{openTickets}</span>
              </div>
              <div className="w-10 h-10 rounded bg-orange-950/40 flex items-center justify-center text-orange-400 border border-orange-800/30">
                <Clock size={18} />
              </div>
            </div>
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Resolved</span>
                <span className="text-2xl font-serif italic font-bold text-brand-lime block">{resolvedTickets}</span>
              </div>
              <div className="w-10 h-10 rounded bg-brand-soft flex items-center justify-center text-brand-lime border border-brand-lime/10">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Active Officers</span>
                <span className="text-2xl font-serif italic font-bold block">{activeOfficers}</span>
              </div>
              <div className="w-10 h-10 rounded bg-panel-bg flex items-center justify-center text-gray-400 border border-panel-border">
                <Users size={18} />
              </div>
            </div>
          </div>

          <div className="bg-panel-card border border-panel-border rounded-lg">
            <div className="px-5 py-4 border-b border-panel-border">
              <h3 className="text-sm font-semibold">Recent Tickets</h3>
            </div>
            {recentTickets.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <FileText size={28} className="text-gray-600 mb-3" />
                <p className="text-sm text-gray-500">No tickets found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-panel-border text-gray-500 text-[10px] uppercase tracking-wider">
                      <th className="text-left px-5 py-3 font-medium">ID</th>
                      <th className="text-left px-5 py-3 font-medium">Category</th>
                      <th className="text-left px-5 py-3 font-medium">Status</th>
                      <th className="text-left px-5 py-3 font-medium">Priority</th>
                      <th className="text-left px-5 py-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map(ticket => (
                      <tr key={ticket.id} className="border-b border-panel-border/50 hover:bg-panel-bg/40 transition-colors">
                        <td className="px-5 py-3 text-gray-400">#{ticket.id.slice(0, 8)}</td>
                        <td className="px-5 py-3 text-foreground">{ticket.category}</td>
                        <td className="px-5 py-3">
                          <Badge type="status" value={statusBadgeValue(ticket.status)} />
                        </td>
                        <td className="px-5 py-3">
                          <Badge type="priority" value={ticket.priority_score >= 3 ? 'high' : ticket.priority_score === 2 ? 'medium' : 'low'} />
                        </td>
                        <td className="px-5 py-3 text-gray-500">{formatDate(ticket.created_at)}</td>
                      </tr>
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
