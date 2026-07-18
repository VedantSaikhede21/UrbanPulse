import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, Clock, CheckCircle2, Calendar, MapPin, Shield,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { apiFetch } from '../../lib/api';

interface Ticket {
  id: string;
  category: string;
  severity: string;
  status: string;
  priority_score: number;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

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
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Failed to load escalation data</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-5">{error}</p>
          <button type="button" onClick={loadData} className="px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 min-h-screen">

      <div className="border-b border-panel-border pb-6">
        <h1 className="text-2xl font-serif italic font-bold">SLA Escalation Monitor</h1>
        <p className="text-gray-500 text-xs mt-1">
          Tickets breaching SLA timers, response bottlenecks, and critical items requiring reassignment.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Open Tickets</span>
                <span className="text-2xl font-serif italic font-bold block">{breaches.length}</span>
              </div>
              <div className="w-10 h-10 rounded bg-panel-bg flex items-center justify-center text-gray-400 border border-panel-border">
                <Clock size={18} />
              </div>
            </div>
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Breached SLA</span>
                <span className="text-2xl font-serif italic font-bold text-red-400 block">{breached.length}</span>
              </div>
              <div className="w-10 h-10 rounded bg-red-950/40 flex items-center justify-center text-red-400 border border-red-800/30">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">At Risk</span>
                <span className="text-2xl font-serif italic font-bold text-yellow-400 block">{atRisk.length}</span>
              </div>
              <div className="w-10 h-10 rounded bg-yellow-950/40 flex items-center justify-center text-yellow-400 border border-yellow-800/30">
                <Clock size={18} />
              </div>
            </div>
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Within SLA</span>
                <span className="text-2xl font-serif italic font-bold text-green-400 block">{withinSLA.length}</span>
              </div>
              <div className="w-10 h-10 rounded bg-green-950/40 flex items-center justify-center text-green-400 border border-green-800/30">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>

          {/* Breach list */}
          {breaches.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <CheckCircle2 size={32} className="text-brand-lime mb-3" />
              <p className="text-sm text-gray-500">No open tickets requiring escalation monitoring.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {breaches.map(b => (
                <div
                  key={b.ticket.id}
                  className={`bg-panel-card border rounded-lg p-5 space-y-3 ${
                    b.breached
                      ? 'border-red-800/40'
                      : b.ageHours > b.slaHours * 0.75
                        ? 'border-yellow-800/30'
                        : 'border-panel-border'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-gray-500">#{b.ticket.id.slice(0, 8)}</span>
                        {b.breached && (
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-800/40 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            SLA BREACHED
                          </span>
                        )}
                        <Badge type="priority" value={priorityBadgeValue(b.ticket.priority_score)} />
                        <Badge type="status" value={statusBadgeValue(b.ticket.status)} />
                      </div>
                      <h3 className="font-semibold text-foreground">{b.ticket.category}</h3>
                      <p className="text-sm text-gray-400">{b.ticket.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {b.ticket.latitude.toFixed(4)}, {b.ticket.longitude.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {b.ticket.created_at ? new Date(b.ticket.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className={`flex items-center gap-1 ${b.breached ? 'text-red-400' : b.ageHours > b.slaHours * 0.75 ? 'text-yellow-400' : 'text-green-400'}`}>
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
                      <span className="text-gray-500">SLA</span>
                      <span className={b.breached ? 'text-red-400' : 'text-gray-400'}>
                        {breachPct(b)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          b.breached ? 'bg-red-500' : b.ageHours > b.slaHours * 0.75 ? 'bg-yellow-500' : 'bg-green-500'
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
          <div className="bg-panel-card border border-panel-border rounded-lg p-4 text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-brand-lime" />
              <span className="font-semibold text-foreground">SLA Policy</span>
            </div>
            <p>P1 Critical (priority 3): <span className="text-red-400 font-mono">4h</span> response time</p>
            <p>P2 Medium (priority 2): <span className="text-yellow-400 font-mono">8h</span> response time</p>
            <p>P3 Low (priority 1): <span className="text-green-400 font-mono">24h</span> response time</p>
          </div>
        </>
      )}
    </div>
  );
};
