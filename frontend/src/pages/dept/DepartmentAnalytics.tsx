import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, BarChart2, FileText, MapPin, Layers,
  Loader,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
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

interface Ward {
  name: string;
  uhs_score: number;
}

const STATUS_LABELS: Record<string, string> = {
  reported: 'Reported',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  verified: 'Verified',
};

const SEVERITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

function uhsColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export const DepartmentAnalytics: React.FC = () => {
  useDocumentTitle('Department Analytics');
  const breadcrumbs = useBreadcrumbs();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch('/api/tickets'),
      apiFetch('/api/analytics/wards'),
    ])
      .then(async ([ticketRes, wardRes]) => {
        if (!ticketRes.ok) throw new Error(`Tickets API error (${ticketRes.status})`);
        if (!wardRes.ok) throw new Error(`Wards API error (${wardRes.status})`);
        return Promise.all([ticketRes.json(), wardRes.json()]);
      })
      .then(([ticketData, wardData]) => {
        setTickets(ticketData);
        setWards(wardData);
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

  const categoryCounts: Record<string, number> = {};
  tickets.forEach(t => { categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1; });
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  const severityCounts: Record<string, number> = {};
  tickets.forEach(t => { severityCounts[t.severity] = (severityCounts[t.severity] || 0) + 1; });
  const sortedSeverities = Object.entries(severityCounts).sort((a, b) => b[1] - a[1]);

  const statusCounts: Record<string, number> = {};
  tickets.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });

  const sortedWards = [...wards].sort((a, b) => b.uhs_score - a.uhs_score);

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
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen">
      <Breadcrumbs items={breadcrumbs} />
      <div className="border-b border-border-default pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Department Analytics</h1>
        <p className="text-text-tertiary text-xs mt-1">
          Category breakdown, severity distribution, status overview, and ward UHS scores.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader size={32} className="text-brand-lime animate-spin" />
        </div>
      ) : tickets.length === 0 && wards.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No analytics data"
          message="Ticket and ward data will appear here once available."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block">Categories</span>
                <span className="text-2xl font-serif italic font-bold block">{sortedCategories.length}</span>
              </div>
              <div className="w-10 h-10 rounded bg-surface-raised flex items-center justify-center text-text-secondary border border-border-default">
                <Layers size={18} />
              </div>
            </div>
            <div className="bg-surface-card border border-border-default p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block">Wards Tracked</span>
                <span className="text-2xl font-serif italic font-bold block">{wards.length}</span>
              </div>
              <div className="w-10 h-10 rounded bg-surface-raised flex items-center justify-center text-text-secondary border border-border-default">
                <MapPin size={18} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-card border border-border-default rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FileText size={16} className="text-brand-lime" />
                By Category
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

            <div className="bg-surface-card border border-border-default rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <BarChart2 size={16} className="text-brand-lime" />
                By Severity
              </h2>
              {sortedSeverities.length === 0 ? (
                <p className="text-xs text-text-tertiary">No tickets found.</p>
              ) : (
                <div className="space-y-3">
                  {sortedSeverities.map(([severity, count]) => (
                    <div key={severity} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{SEVERITY_LABELS[severity] || severity}</span>
                        <span className="font-mono text-foreground font-bold">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            severity === 'critical' ? 'bg-red-500' :
                            severity === 'high' ? 'bg-orange-500' :
                            severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(count / totalTickets) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface-card border border-border-default rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Layers size={16} className="text-brand-lime" />
                By Status
              </h2>
              {Object.keys(statusCounts).length === 0 ? (
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
          </div>

          {sortedWards.length > 0 && (
            <div className="bg-surface-card border border-border-default rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <MapPin size={16} className="text-brand-lime" />
                Ward UHS Leaderboard
              </h2>
              <div className="space-y-3">
                {sortedWards.map((ward, i) => (
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
        </>
      )}
    </div>
  );
};
