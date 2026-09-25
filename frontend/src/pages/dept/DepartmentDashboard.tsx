import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, FileText, Clock, CheckCircle2, Users,
  Calendar, RotateCcw,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { apiFetch } from '../../lib/api';
import { SlaCountdown } from '../../components/ui/SlaCountdown';
import type { Ticket, Officer } from '../../lib/types';


const OPEN_STATUSES = ['reported', 'assigned', 'in_progress'];

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

export const DepartmentDashboard: React.FC = () => {
  useDocumentTitle('Department Dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    // Officers come from the same endpoint OfficerManagement uses, so the
    // headcount on this card can never drift from the real roster. The card
    // used to read a hardcoded `OFFICER_COUNT = 4`.
    Promise.all([apiFetch('/api/tickets'), apiFetch('/api/officers')])
      .then(async ([ticketRes, officerRes]) => {
        if (!ticketRes.ok) throw new Error(`API error (${ticketRes.status})`);
        if (!officerRes.ok) throw new Error(`Officers API error (${officerRes.status})`);
        return [await ticketRes.json(), (await officerRes.json()) as Officer[]] as const;
      })
      .then(([ticketData, officerData]) => {
        setTickets(Array.isArray(ticketData) ? ticketData : ticketData.tickets);
        setOfficers(officerData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load tickets');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalTickets = tickets.length;
  // Only active field officers count towards a department's capacity. Kept
  // identical to the filter AdminDashboard uses so both dashboards report the
  // same headcount for the same /api/officers roster.
  const activeOfficerCount = officers.filter(o => o.is_active && o.role === 'officer').length;
  const openTickets = tickets.filter(t => OPEN_STATUSES.includes(t.status)).length;
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-status-escalated/10 border border-status-escalated/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-status-escalated" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Failed to load dashboard</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-5">{error}</p>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim transition-all disabled:opacity-50"
          >
            <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen">
      <div className="border-b border-panel-border pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Department Dashboard</h1>
        <p className="text-gray-500 text-xs mt-1">
          Overview of department tickets, open items, and recent activity.
        </p>
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No tickets in the system"
          message="Tickets will appear here once residents submit reports."
          action={{ label: 'Retry', onClick: loadData }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="w-10 h-10 rounded bg-status-progress/10 flex items-center justify-center text-status-progress border border-status-progress/30">
                <Clock size={18} />
              </div>
            </div>
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Active Officers</span>
                <span className="text-2xl font-serif italic font-bold block">
                  {loading ? '—' : activeOfficerCount}
                </span>
              </div>
              <div className="w-10 h-10 rounded bg-status-new/10 flex items-center justify-center text-status-new border border-status-new/30">
                <Users size={18} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Clock size={14} /> Recent Tickets
            </h3>
            <div className="space-y-2">
              {recentTickets.map(t => (
                <div key={t.id} className="bg-panel-card border border-panel-border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">#{t.id.slice(0, 8)}</span>
                      <Badge type="status" value={statusBadgeValue(t.status)} />
                    </div>
                    <p className="font-medium text-sm truncate">{t.category}</p>
                    {t.description && (
                      <p className="text-xs text-gray-500 truncate">{t.description}</p>
                    )}
                    <span className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                      <Calendar size={10} /> {new Date(t.created_at).toLocaleDateString()}
                    </span>
                    <SlaCountdown
                      expectedResolutionAt={t.expected_resolution_at}
                      status={t.status}
                    />
                  </div>
                  <div className="shrink-0 ml-3">
                    <Badge type="priority" value={priorityBadgeValue(t.priority_score)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
