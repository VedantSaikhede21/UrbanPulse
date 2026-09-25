import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, Clock, CheckCircle2, Calendar, MapPin, Shield,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { apiFetch } from '../../lib/api';
import type { Ticket } from '../../lib/types';


interface BreachInfo {
  ticket: Ticket;
  ageHours: number;
  slaHours: number;
  breached: boolean;
}

const SLA_HOURS: Record<number, number> = { 1: 24, 2: 8, 3: 4 };
const OPEN_STATUSES = ['reported', 'assigned', 'in_progress'];

function computeBreaches(tickets: Ticket[]): BreachInfo[] {
  const now = Date.now();
  return tickets
    .filter(t => OPEN_STATUSES.includes(t.status))
    .map(t => {
      const ageHours = t.created_at
        ? (now - new Date(t.created_at).getTime()) / 3600000
        : 999;
      const slaHours = SLA_HOURS[t.priority_score] || 24;
      return { ticket: t, ageHours, slaHours, breached: ageHours > slaHours };
    })
    .sort((a, b) => {
      if (a.breached !== b.breached) return a.breached ? -1 : 1;
      return (b.ageHours - b.slaHours) - (a.ageHours - a.slaHours);
    });
}

function breachPct(breach: BreachInfo): number {
  return Math.min(100, Math.round((breach.ageHours / breach.slaHours) * 100));
}

function statusBadgeValue(s: string): string {
  if (s === 'reported') return 'new';
  if (s === 'in_progress') return 'in progress';
  return s;
}

function priorityBadgeValue(s: number): string {
  if (s >= 3) return 'high';
  if (s === 2) return 'medium';
  return 'low';
}

export const EscalationMonitor: React.FC = () => {
  useDocumentTitle('Escalation Monitor');
  const breadcrumbs = useBreadcrumbs();
  const [breaches, setBreaches] = useState<BreachInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    apiFetch('/api/tickets')
      .then(async res => {
        if (!res.ok) throw new Error(`API error (${res.status})`);
        return res.json();
      })
      .then((data: Ticket[]) => {
        setBreaches(computeBreaches(data));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load tickets');
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const breached = breaches.filter(b => b.breached);
  const atRisk = breaches.filter(b => !b.breached && b.ageHours > b.slaHours * 0.75);
  const withinSLA = breaches.filter(b => !b.breached && b.ageHours <= b.slaHours * 0.75);

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <div role="alert" className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-status-escalated/10 border border-status-escalated/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-status-escalated" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Failed to load escalation data</h3>
          <p className="text-sm text-secondary max-w-xs mb-5">{error}</p>
          <button type="button" aria-label="Retry loading escalation data" onClick={loadData} className="focus-ring px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 min-h-screen">

      <div className="border-b border-panel-border pb-6">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="text-2xl font-serif italic font-bold">SLA Escalation Monitor</h1>
        <p className="text-tertiary text-xs mt-1">
          Tickets breaching SLA timers, response bottlenecks, and critical items requiring reassignment.
        </p>
      </div>

      {loading ? (
        <div role="status" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary block">Open Tickets</span>
                <span className="text-2xl font-serif italic font-bold block">{breaches.length}</span>
              </div>
              <div className="w-10 h-10 rounded bg-panel-bg flex items-center justify-center text-secondary border border-panel-border">
                <Clock size={18} />
              </div>
            </div>
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary block">Breached SLA</span>
                <span className="text-2xl font-serif italic font-bold text-status-escalated block">{breached.length}</span>
              </div>
              <div className="w-10 h-10 rounded bg-status-escalated/10 flex items-center justify-center text-status-escalated border border-status-escalated/30">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary block">At Risk</span>
                <span className="text-2xl font-serif italic font-bold text-status-progress block">{atRisk.length}</span>
              </div>
              <div className="w-10 h-10 rounded bg-status-progress/10 flex items-center justify-center text-status-progress border border-status-progress/30">
                <Clock size={18} />
              </div>
            </div>
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary block">Within SLA</span>
                <span className="text-2xl font-serif italic font-bold text-status-resolved block">{withinSLA.length}</span>
              </div>
              <div className="w-10 h-10 rounded bg-status-resolved/10 flex items-center justify-center text-status-resolved border border-status-resolved/30">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>

          {/* Breach list */}
          {breaches.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No breaches to monitor"
              message="No open tickets requiring escalation monitoring."
            />
          ) : (
            <div className="space-y-3">
              {breaches.map(b => (
                <div
                  key={b.ticket.id}
                  className={`bg-panel-card border rounded-lg p-5 space-y-3 ${
                    b.breached
                      ? 'border-status-escalated/30'
                      : b.ageHours > b.slaHours * 0.75
                        ? 'border-status-progress/30'
                        : 'border-panel-border'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-tertiary">#{b.ticket.id.slice(0, 8)}</span>
                        {b.breached && (
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-status-escalated/10 text-status-escalated border border-status-escalated/30 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            SLA BREACHED
                          </span>
                        )}
                        <Badge type="priority" value={priorityBadgeValue(b.ticket.priority_score)} />
                        <Badge type="status" value={statusBadgeValue(b.ticket.status)} />
                      </div>
                      <h3 className="font-semibold text-foreground">{b.ticket.category}</h3>
                      <p className="text-sm text-secondary">{b.ticket.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-tertiary">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {b.ticket.latitude.toFixed(4)}, {b.ticket.longitude.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {b.ticket.created_at ? new Date(b.ticket.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className={`flex items-center gap-1 ${b.breached ? 'text-status-escalated' : b.ageHours > b.slaHours * 0.75 ? 'text-status-progress' : 'text-status-resolved'}`}>
                          <Clock size={12} />
                          {b.ageHours < 1
                            ? '< 1h'
                            : `${Math.round(b.ageHours)}h`} / {b.slaHours}h SLA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SLA bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-tertiary">SLA</span>
                      <span className={b.breached ? 'text-status-escalated' : 'text-secondary'}>
                        {breachPct(b)}%
                      </span>
                    </div>
                    <div className="h-2 bg-border-default rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          b.breached ? 'bg-status-escalated' : b.ageHours > b.slaHours * 0.75 ? 'bg-status-progress' : 'bg-status-resolved'
                        }`}
                        style={{ width: `${Math.min(100, breachPct(b))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SLA policy reference */}
          <div className="bg-panel-card border border-panel-border rounded-lg p-4 text-xs text-tertiary space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-brand-lime" />
              <span className="font-semibold text-foreground">SLA Policy</span>
            </div>
            <p>P1 Critical (priority 3): <span className="text-status-escalated font-mono">4h</span> response time</p>
            <p>P2 Medium (priority 2): <span className="text-status-progress font-mono">8h</span> response time</p>
            <p>P3 Low (priority 1): <span className="text-status-resolved font-mono">24h</span> response time</p>
          </div>
        </>
      )}
    </div>
  );
};
