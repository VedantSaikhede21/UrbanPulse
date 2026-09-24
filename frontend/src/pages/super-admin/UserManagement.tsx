import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, Users, UserCircle, Shield, Search,
} from 'lucide-react';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { apiFetch } from '../../lib/api';
import type { Officer, Ticket } from '../../lib/types';

interface CitizenEntry {
  id: string;
  ticketCount: number;
  categories: string[];
}

export const UserManagement: React.FC = () => {
  useDocumentTitle('User Management');
  const breadcrumbs = useBreadcrumbs();
  const [citizens, setCitizens] = useState<CitizenEntry[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [officerTicketCounts, setOfficerTicketCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch('/api/tickets'),
      apiFetch('/api/officers'),
    ])
      .then(async ([ticketRes, officerRes]) => {
        if (!ticketRes.ok) throw new Error(`Tickets API error (${ticketRes.status})`);
        if (!officerRes.ok) throw new Error(`Officers API error (${officerRes.status})`);
        return Promise.all([ticketRes.json(), officerRes.json()]);
      })
      .then(([ticketData, officerData]) => {
        const tickets = ticketData as Ticket[];
        const citizenMap = new Map<string, { count: number; cats: Set<string> }>();
        const officerCounts: Record<string, number> = {};
        tickets.forEach(t => {
          if (t.citizen_id) {
            if (!citizenMap.has(t.citizen_id)) citizenMap.set(t.citizen_id, { count: 0, cats: new Set() });
            citizenMap.get(t.citizen_id)!.count++;
            citizenMap.get(t.citizen_id)!.cats.add(t.category);
          }
          if (t.assigned_officer_id) {
            officerCounts[t.assigned_officer_id] = (officerCounts[t.assigned_officer_id] ?? 0) + 1;
          }
        });
        setCitizens(
          Array.from(citizenMap.entries()).map(([id, d]) => ({
            id, ticketCount: d.count, categories: Array.from(d.cats),
          })),
        );
        setOfficers(officerData as Officer[]);
        setOfficerTicketCounts(officerCounts);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load user data');
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const filteredCitizens = citizens.filter(c =>
    c.id.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredOfficers = officers.filter(o =>
    `${o.name} ${o.department} ${o.id}`.toLowerCase().includes(search.toLowerCase()),
  );

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h2 className="text-base font-semibold mb-1.5">Failed to load user data</h2>
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
        <h1 className="text-2xl font-serif italic font-bold">User Management</h1>
        <p className="text-text-tertiary text-xs mt-1">
          Directory of citizens (from authenticated ticket activity) and field officers.
        </p>
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search by user ID, name, or department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="focus-ring w-full bg-surface-card border border-border-default rounded pl-9 pr-4 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-brand-lime"
            />
          </div>

          {citizens.length === 0 && officers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No user data available"
              message="Users will appear here once citizens file reports and officers are created."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <UserCircle size={16} className="text-brand-lime" />
                  Citizens ({filteredCitizens.length})
                </h2>
                {filteredCitizens.length === 0 ? (
                  <p className="text-xs text-text-tertiary">No citizens match your search.</p>
                ) : (
                  filteredCitizens.map(c => (
                    <div key={c.id} className="bg-surface-card border border-border-default rounded-xl p-4 space-y-2 hover:border-border-hover transition-colors duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-text-secondary">#{c.id.slice(0, 8)}</span>
                        <span className="text-[10px] font-mono text-brand-lime">{c.ticketCount} ticket{c.ticketCount !== 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-xs text-text-tertiary">
                        Categories: {c.categories.join(', ') || 'N/A'}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Shield size={16} className="text-brand-lime" />
                  Officers ({filteredOfficers.length})
                </h2>
                {filteredOfficers.length === 0 ? (
                  <p className="text-xs text-text-tertiary">No officers match your search.</p>
                ) : (
                  filteredOfficers.map(o => (
                    <div key={o.id} className="bg-surface-card border border-border-default rounded p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{o.name}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          o.is_active
                            ? 'text-green-400 border-green-800/30 bg-green-950/30'
                            : 'text-red-400 border-red-800/30 bg-red-950/30'
                        }`}>
                          {o.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-text-tertiary">
                        {o.department} · {officerTicketCounts[o.id] ?? 0} assignment{officerTicketCounts[o.id] !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
