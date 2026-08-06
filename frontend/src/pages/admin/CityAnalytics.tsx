import React, { useEffect, useState } from 'react';
import {
  Activity, AlertTriangle, FileText, TrendingUp, MapPin,
  CheckCircle2, Clock, BarChart2,
} from 'lucide-react';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { apiFetch } from '../../lib/api';

interface Ticket {
  id: string;
  category: string;
  status: string;
  severity: string;
  priority_score: number;
  created_at: string;
}

interface CityPulseData {
  wards: { name: string; uhs_score: number }[];
  critical_wards: number;
  trending_categories: { category: string; count: number }[];
  pulse_alerts: string[];
}

function uhsColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

const OPEN_STATUSES = ['reported', 'assigned', 'in_progress'];
const RESOLVED_STATUSES = ['resolved', 'verified'];
const STATUS_LABELS: Record<string, string> = {
  reported: 'Reported',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  verified: 'Verified',
};

export const CityAnalytics: React.FC = () => {
  useDocumentTitle('City Analytics');
  const breadcrumbs = useBreadcrumbs();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pulse, setPulse] = useState<CityPulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch('/api/tickets'),
      apiFetch('/api/analytics/city-pulse'),
    ])
      .then(async ([ticketRes, pulseRes]) => {
        if (!ticketRes.ok) throw new Error(`Tickets API error (${ticketRes.status})`);
        if (!pulseRes.ok) throw new Error(`City pulse API error (${pulseRes.status})`);
        return Promise.all([ticketRes.json(), pulseRes.json()]);
      })
      .then(([ticketData, pulseData]) => {
        setTickets(ticketData);
        setPulse(pulseData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load analytics');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => OPEN_STATUSES.includes(t.status)).length;
  const resolvedTickets = tickets.filter(t => RESOLVED_STATUSES.includes(t.status)).length;

  const statusCounts: Record<string, number> = {};
  tickets.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });

  const categoryCounts: Record<string, number> = {};
  tickets.forEach(t => { categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1; });
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h2 className="text-base font-semibold mb-1.5">Failed to load analytics</h2>
          <p className="text-sm text-text-secondary max-w-xs mb-5">{error}</p>
          <button type="button" onClick={loadData} className="focus-ring px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 min-h-screen">

      <Breadcrumbs items={breadcrumbs} />
      <div className="border-b border-border-default pb-6">
        <h1 className="text-2xl font-serif italic font-bold">City Analytics Dashboard</h1>
        <p className="text-text-tertiary text-xs mt-1">
          City-wide performance metrics, ward UHS leaderboard, and auto-generated City Pulse digests.
        </p>
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface-card border border-border-default p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block">Total Tickets</span>
                <span className="text-2xl font-serif italic font-bold block">{totalTickets}</span>
              </div>
              <div className="w-10 h-10 rounded bg-surface-raised flex items-center justify-center text-text-secondary border border-border-default">
                <FileText size={18} />
              </div>
            </div>
            <div className="bg-surface-card border border-border-default p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block">Open</span>
                <span className="text-2xl font-serif italic font-bold block">{openTickets}</span>
              </div>
              <div className="w-10 h-10 rounded bg-orange-950/40 flex items-center justify-center text-orange-400 border border-orange-800/30">
                <Clock size={18} />
              </div>
            </div>
            <div className="bg-surface-card border border-border-default p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block">Resolved</span>
                <span className="text-2xl font-serif italic font-bold text-brand-lime block">{resolvedTickets}</span>
              </div>
              <div className="w-10 h-10 rounded bg-brand-soft flex items-center justify-center text-brand-lime border border-brand-lime/10">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="bg-surface-card border border-border-default p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block">Critical Wards</span>
                <span className={`text-2xl font-serif italic font-bold block ${(pulse?.critical_wards || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {pulse?.critical_wards || 0}
                </span>
              </div>
              <div className="w-10 h-10 rounded bg-surface-raised flex items-center justify-center text-text-secondary border border-border-default">
                <AlertTriangle size={18} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status breakdown */}
            <div className="bg-surface-card border border-border-default rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <BarChart2 size={16} className="text-brand-lime" />
                Tickets by Status
              </h2>
              {Object.entries(statusCounts).length === 0 ? (
                <p className="text-xs text-text-tertiary">No tickets found.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{STATUS_LABELS[status] || status}</span>
                        <span className="font-mono text-foreground font-bold">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-lime transition-all duration-500"
                          style={{ width: `${(count / totalTickets) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category breakdown */}
            <div className="bg-surface-card border border-border-default rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FileText size={16} className="text-brand-lime" />
                Tickets by Category
              </h2>
              {sortedCategories.length === 0 ? (
                <p className="text-xs text-text-tertiary">No tickets found.</p>
              ) : (
                <div className="space-y-3">
                  {sortedCategories.map(([category, count]) => (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{category}</span>
                        <span className="font-mono text-foreground font-bold">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${(count / totalTickets) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ward UHS Leaderboard */}
          {pulse && (
            <div className="bg-surface-card border border-border-default rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <MapPin size={16} className="text-brand-lime" />
                Ward UHS Leaderboard
              </h2>
              <div className="space-y-3">
                {pulse.wards.map((ward, i) => (
                  <div key={ward.name} className="flex items-center gap-4">
                    <span className="text-xs font-mono text-text-tertiary w-6 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-foreground truncate">{ward.name}</span>
                        <span className="font-mono font-bold ml-2">{ward.uhs_score.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${uhsColor(ward.uhs_score)}`}
                          style={{ width: `${ward.uhs_score}%` }}
                        />
                      </div>
                    </div>
                    <Badge type="priority" value={ward.uhs_score >= 80 ? 'low' : ward.uhs_score >= 60 ? 'medium' : 'high'} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending + Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pulse && pulse.trending_categories.length > 0 && (
              <div className="bg-surface-card border border-border-default rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-brand-lime" />
                  <h2 className="text-sm font-semibold">Trending Issues</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pulse.trending_categories.map(c => (
                    <div key={c.category} className="bg-surface-raised border border-border-default rounded px-3 py-1.5 text-xs flex items-center gap-2">
                      <span className="text-foreground">{c.category}</span>
                      <span className="text-brand-lime font-mono font-bold">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pulse && pulse.pulse_alerts.length > 0 && (
              <div className="bg-surface-card border border-border-default rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-amber-400" />
                  <h2 className="text-sm font-semibold">Pulse Alerts</h2>
                </div>
                <div className="space-y-2">
                  {pulse.pulse_alerts.map((alert, i) => (
                    <div key={i} className="bg-amber-950/20 border border-amber-800/30 text-amber-300 text-xs px-3 py-2 rounded flex items-start gap-2">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
