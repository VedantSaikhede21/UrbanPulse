import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, Clock, ListOrdered,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { apiFetch } from '../../lib/api';

interface Ticket {
  id: string;
  category: string;
  status: string;
  severity: string;
  priority_score: number;
  created_at: string;
}

function statusBadgeValue(s: string): string {
  if (s === 'reported') return 'new';
  if (s === 'in_progress') return 'in progress';
  return s;
}

function formatTimestamp(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export const AuditLog: React.FC = () => {
  const [entries, setEntries] = useState<Ticket[]>([]);
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
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setEntries(sorted.slice(0, 20));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load audit log');
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Failed to load audit log</h3>
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
        <h1 className="text-2xl font-serif italic font-bold">System Audit Trail</h1>
        <p className="text-gray-500 text-xs mt-1">
          Chronological log of ticket activity — status changes, priority assignments, and system events.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="bg-panel-card border border-panel-border rounded-lg">
            <div className="px-5 py-4 border-b border-panel-border flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ListOrdered size={16} className="text-brand-lime" />
                Latest Activity
              </h3>
              <span className="text-[10px] font-mono text-gray-500">{entries.length} entries</span>
            </div>
            {entries.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Clock size={32} className="text-gray-600 mb-3" />
                <p className="text-sm text-gray-500">No audit entries found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-panel-border text-gray-500 text-[10px] uppercase tracking-wider">
                      <th className="text-left px-5 py-3 font-medium">Timestamp</th>
                      <th className="text-left px-5 py-3 font-medium">Ticket ID</th>
                      <th className="text-left px-5 py-3 font-medium">Category</th>
                      <th className="text-left px-5 py-3 font-medium">Status</th>
                      <th className="text-left px-5 py-3 font-medium">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(entry => (
                      <tr key={entry.id} className="border-b border-panel-border/50 hover:bg-panel-bg/40 transition-colors">
                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatTimestamp(entry.created_at)}</td>
                        <td className="px-5 py-3 text-gray-400">#{entry.id.slice(0, 8)}</td>
                        <td className="px-5 py-3 text-foreground">{entry.category}</td>
                        <td className="px-5 py-3">
                          <Badge type="status" value={statusBadgeValue(entry.status)} />
                        </td>
                        <td className="px-5 py-3">
                          <Badge type="priority" value={entry.priority_score >= 3 ? 'high' : entry.priority_score === 2 ? 'medium' : 'low'} />
                        </td>
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
