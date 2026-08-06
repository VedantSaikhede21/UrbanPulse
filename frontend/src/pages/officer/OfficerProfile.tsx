import React, { useEffect, useState } from 'react';
import { Shield, Mail, Phone, User, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';

interface UserInfo {
  id: string;
  role: string;
  email: string | null;
  phone: string | null;
  name: string;
}

interface Ticket {
  id: string;
  category: string;
  status: string;
  priority_score: number;
  description: string;
  created_at: string;
}

export const OfficerProfile: React.FC = () => {
  useDocumentTitle('Officer Profile');
  const breadcrumbs = useBreadcrumbs();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, queueRes] = await Promise.all([
        apiFetch('/api/me'),
        apiFetch('/api/officers/queue'),
      ]);
      if (!userRes.ok || !queueRes.ok) throw new Error('Failed to load data');
      const userData: UserInfo = await userRes.json();
      const queueData: Ticket[] = await queueRes.json();
      setUser(userData);
      setTickets(queueData);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-status-escalated/10 border border-status-escalated/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-status-escalated" />
          </div>
          <h2 className="text-base font-semibold mb-1.5">Failed to load profile</h2>
          <p className="text-sm text-text-tertiary max-w-xs mb-5">{error}</p>
          <button type="button" onClick={loadData} aria-label="Retry loading profile" className="focus-ring px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const assignedCount = tickets.filter(t => t.status === 'assigned').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const reportedCount = tickets.filter(t => t.status === 'reported').length;
  const resolvedCount = tickets.filter(t => ['resolved', 'verified'].includes(t.status)).length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 min-h-screen">

      <Breadcrumbs items={breadcrumbs} />
      <div className="border-b border-border-default pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Officer Profile</h1>
        <p className="text-text-tertiary text-xs mt-1">Your assigned ward, department info, tickets, and SLA compliance status.</p>
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* User card */}
          <div className="bg-panel-card border border-border-default rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-lime/20 to-brand-lime/5 border border-brand-lime/20 flex items-center justify-center">
                <User size={24} className="text-brand-lime" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{user?.name || 'Officer'}</h2>
                <Badge type="priority" value={user?.role === 'super_admin' ? 'high' : 'medium'} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-tertiary">
              <span className="flex items-center gap-2">
                <Mail size={12} /> {user?.email || 'N/A'}
              </span>
              <span className="flex items-center gap-2">
                <Phone size={12} /> {user?.phone || 'Not provided'}
              </span>
              <span className="flex items-center gap-2">
                <Shield size={12} /> Role: {user?.role?.replace('_', ' ') || 'N/A'}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={12} /> ID: {(user?.id || '').slice(0, 8)}...
              </span>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-panel-card border border-border-default p-4 rounded">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Reported</span>
              <p className="text-2xl font-serif italic font-bold mt-1">{reportedCount}</p>
            </div>
            <div className="bg-panel-card border border-border-default p-4 rounded">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Assigned</span>
              <p className="text-2xl font-serif italic font-bold mt-1 text-status-new">{assignedCount}</p>
            </div>
            <div className="bg-panel-card border border-border-default p-4 rounded">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">In Progress</span>
              <p className="text-2xl font-serif italic font-bold mt-1 text-status-progress">{inProgressCount}</p>
            </div>
            <div className="bg-panel-card border border-border-default p-4 rounded">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Resolved</span>
              <p className="text-2xl font-serif italic font-bold mt-1 text-status-resolved">{resolvedCount}</p>
            </div>
          </div>

          {/* Assigned tickets */}
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Clock size={14} /> Active Tickets ({tickets.length})
            </h3>
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center bg-panel-card border border-border-default rounded-lg" role="status" aria-label="No tickets assigned">
                <CheckCircle2 size={24} className="text-brand-lime mb-3" />
                <p className="text-sm text-text-tertiary">No tickets assigned. Queue is clear.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map(t => (
                  <div key={t.id} className="bg-panel-card border border-border-default rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-text-tertiary">#{t.id.slice(0, 8)}</span>
                        <Badge type="status" value={t.status} />
                      </div>
                      <p className="font-medium text-sm truncate">{t.category}</p>
                      <p className="text-xs text-text-tertiary truncate">{t.description}</p>
                    </div>
                    <div className="shrink-0 ml-3">
                      <Badge type="priority" value={t.priority_score >= 3 ? 'high' : t.priority_score === 2 ? 'medium' : 'low'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
