import React, { useEffect, useState } from 'react';
import { Shield, Mail, Phone, User, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../../lib/api';
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
  const [user, setUser] = useState<UserInfo | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [userRes, queueRes] = await Promise.all([
          apiFetch('/api/me'),
          apiFetch('/api/officers/queue'),
        ]);
        if (!userRes.ok || !queueRes.ok) throw new Error('Failed to load data');
        const userData: UserInfo = await userRes.json();
        const queueData: Ticket[] = await queueRes.json();
        if (!cancelled) {
          setUser(userData);
          setTickets(queueData);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load profile');
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-24">
          <AlertTriangle size={24} className="text-red-400 mb-4" />
          <p className="text-sm text-gray-400 mb-5">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded">
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

      <div className="border-b border-panel-border pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Officer Profile</h1>
        <p className="text-gray-500 text-xs mt-1">Your assigned ward, department info, tickets, and SLA compliance status.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* User card */}
          <div className="bg-panel-card border border-panel-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-lime/20 to-brand-lime/5 border border-brand-lime/20 flex items-center justify-center">
                <User size={24} className="text-brand-lime" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{user?.name || 'Officer'}</h2>
                <Badge type="priority" value={user?.role === 'super_admin' ? 'high' : 'medium'} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400">
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
            <div className="bg-panel-card border border-panel-border p-4 rounded">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Reported</span>
              <p className="text-2xl font-serif italic font-bold mt-1">{reportedCount}</p>
            </div>
            <div className="bg-panel-card border border-panel-border p-4 rounded">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Assigned</span>
              <p className="text-2xl font-serif italic font-bold mt-1 text-blue-400">{assignedCount}</p>
            </div>
            <div className="bg-panel-card border border-panel-border p-4 rounded">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">In Progress</span>
              <p className="text-2xl font-serif italic font-bold mt-1 text-orange-400">{inProgressCount}</p>
            </div>
            <div className="bg-panel-card border border-panel-border p-4 rounded">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Resolved</span>
              <p className="text-2xl font-serif italic font-bold mt-1 text-green-400">{resolvedCount}</p>
            </div>
          </div>

          {/* Assigned tickets */}
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Clock size={14} /> Active Tickets ({tickets.length})
            </h3>
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <CheckCircle2 size={24} className="text-brand-lime mb-3" />
                <p className="text-sm text-gray-500">No tickets assigned. Queue is clear.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map(t => (
                  <div key={t.id} className="bg-panel-card border border-panel-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">#{t.id.slice(0, 8)}</span>
                        <Badge type="status" value={t.status} />
                      </div>
                      <p className="font-medium text-sm truncate">{t.category}</p>
                      <p className="text-xs text-gray-500 truncate">{t.description}</p>
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
