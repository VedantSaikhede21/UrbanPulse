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
import type { Ticket } from '../../lib/types';


interface UserEntry {
  id: string;
  ticketCount: number;
  categories: string[];
}

export const UserManagement: React.FC = () => {
  useDocumentTitle('User Management');
  const breadcrumbs = useBreadcrumbs();
  const [citizens, setCitizens] = useState<UserEntry[]>([]);
  const [officers, setOfficers] = useState<UserEntry[]>([]);
  const [search, setSearch] = useState('');
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
        const citizenMap = new Map<string, { count: number; cats: Set<string> }>();
        const officerMap = new Map<string, { count: number; cats: Set<string> }>();

        data.forEach(t => {
          const cId = t.id.split('-')[0] || 'unknown';
          if (!citizenMap.has(cId)) citizenMap.set(cId, { count: 0, cats: new Set() });
          citizenMap.get(cId)!.count++;
          citizenMap.get(cId)!.cats.add(t.category);

          if (t.assigned_officer) {
            if (!officerMap.has(t.assigned_officer)) officerMap.set(t.assigned_officer, { count: 0, cats: new Set() });
            officerMap.get(t.assigned_officer)!.count++;
            officerMap.get(t.assigned_officer)!.cats.add(t.category);
          }
        });

        setCitizens(
          Array.from(citizenMap.entries()).map(([id, d]) => ({
            id, ticketCount: d.count, categories: Array.from(d.cats),
          })),
        );
        setOfficers(
          Array.from(officerMap.entries()).map(([id, d]) => ({
            id, ticketCount: d.count, categories: Array.from(d.cats),
          })),
        );
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
    o.id.toLowerCase().includes(search.toLowerCase()),
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
          <p className="text-xs text-text-tertiary mb-5">View-only user directory. Full CRUD available after auth module integration.</p>
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
          View-only directory derived from ticket data. Full CRUD requires auth module integration.
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
              placeholder="Search by user ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="focus-ring w-full bg-surface-card border border-border-default rounded pl-9 pr-4 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-brand-lime"
            />
          </div>

          {citizens.length === 0 && officers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No user data available"
              message="Users will be derived from ticket activity once reports are filed."
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
                        <span className="text-[10px] font-mono text-brand-lime">{c.ticketCount} tickets</span>
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
                        <span className="text-xs font-mono text-text-secondary">#{o.id.slice(0, 8)}</span>
                        <span className="text-[10px] font-mono text-brand-lime">{o.ticketCount} assigned</span>
                      </div>
                      <p className="text-xs text-text-tertiary">
                        Categories: {o.categories.join(', ') || 'N/A'}
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
