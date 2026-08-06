import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Calendar, CheckCircle2, MapPin,
  PlayCircle, Upload, Wrench, Filter,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { apiFetch, apiUrl } from '../../lib/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../components/ui/Toast';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

interface Ticket {
  id: string;
  category: string;
  severity: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  priority_score: number;
  priority_reason?: string;
  original_media_url?: string;
  created_at: string;
}

type StatusFilter = 'all' | 'assigned' | 'in_progress';

const POLL_INTERVAL = 15_000;

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

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
];

export const OfficerQueue: React.FC = () => {
  useDocumentTitle('Officer Queue');
  const { toast } = useToast();
  const breadcrumbs = useBreadcrumbs();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [closureUrl, setClosureUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const hasLoadedOnce = useRef(false);

  const loadQueue = useCallback(() => {
    apiFetch('/api/officers/queue')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load queue');
        return res.json();
      })
      .then(data => {
        setTickets(data);
        setLoading(false);
        hasLoadedOnce.current = true;
        setError(null);
      })
      .catch(() => {
        setLoading(false);
        if (!hasLoadedOnce.current) {
          setError('Could not load officer queue. Is the backend running?');
        }
      });
  }, []);

  const loadQueueRef = useRef(loadQueue);
  loadQueueRef.current = loadQueue;

  useEffect(() => {
    loadQueueRef.current();
    const interval = setInterval(() => loadQueueRef.current(), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleStartWork = async (ticketId: string) => {
    await apiFetch(`/api/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'in_progress' }),
    });
    loadQueue();
  };

  const handleResolve = async (ticketId: string) => {
    if (!closureUrl.trim()) {
      setError('Provide a closure photo URL before submitting.');
      return;
    }
    setResolvingId(ticketId);
    setError(null);
    try {
      const res = await apiFetch(`/api/tickets/${ticketId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ closure_media_url: closureUrl }),
      });
      if (!res.ok) throw new Error('Resolve failed');
      toast({ type: 'success', title: 'Ticket resolved', message: 'Verification process initiated' });
      setClosureUrl('');
      setResolvingId(null);
      loadQueue();
    } catch {
      toast({ type: 'error', title: 'Resolution failed', message: 'Could not submit resolution. Try again.' });
      setResolvingId(null);
    }
  };

  const filteredTickets = statusFilter === 'all'
    ? tickets
    : tickets.filter(t => t.status === statusFilter);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <div className="border-b border-border-default pb-6 mb-6">
          <div className="h-7 w-64 animate-pulse bg-border-default rounded mb-2" />
          <div className="h-4 w-80 animate-pulse bg-border-default rounded" />
        </div>
        <div role="status" aria-live="polite" className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!loading && error && tickets.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-screen text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-red-300">Connection Error</h2>
        <p className="text-sm text-text-secondary max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoading(true);
            loadQueue();
          }}
          className="focus-ring inline-flex items-center gap-1.5 px-5 py-2 bg-brand-lime text-background font-semibold text-sm rounded hover:bg-brand-lime-hover transition-all active:scale-[0.97]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen">
      <Breadcrumbs items={breadcrumbs} />
      <div className="border-b border-border-default pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Field Officer Work Queue</h1>
        <p className="text-text-tertiary text-xs mt-1">
          Prioritized stack of assigned tickets — dispatch, resolve, and trigger verification.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-800/40 text-red-300 text-sm px-4 py-3 rounded flex items-center gap-2">
          <AlertTriangle size={14} />
          {error}
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError(null)}
            className="focus-ring ml-auto text-red-400 hover:text-red-200 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status filter tabs */}
      {tickets.length > 0 && (
        <div className="flex items-center gap-1.5 border-b border-border-default pb-3">
          <Filter size={14} className="text-text-tertiary" />
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              aria-label={`Filter: ${f.label}`}
              onClick={() => setStatusFilter(f.key)}
              className={`focus-ring text-xs font-mono px-3 py-1 rounded transition-colors ${
                statusFilter === f.key
                  ? 'bg-brand-lime text-background font-semibold'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="text-[10px] text-text-quaternary ml-auto font-mono">
            Polling every {POLL_INTERVAL / 1000}s
          </span>
        </div>
      )}

      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={statusFilter === 'all' ? 'No open tickets in your queue' : `No ${statusFilter.replace('_', ' ')} tickets`}
          message="New tickets will appear here once the AI pipeline assigns them."
          action={error ? { label: 'Retry', onClick: () => { setError(null); setLoading(true); loadQueue(); } } : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              className="relative bg-surface-card border border-border-default rounded-xl p-5 space-y-4 card-glow hover:border-brand-lime/15 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-text-tertiary">#{ticket.id.slice(0, 8)}</span>
                    <Badge type="priority" value={priorityBadgeValue(ticket.priority_score)} />
                    <Badge type="status" value={statusBadgeValue(ticket.status)} />
                  </div>
                  <h3 className="font-semibold text-foreground">{ticket.category}</h3>
                  <p className="text-sm text-text-secondary">{ticket.description}</p>
                  {ticket.priority_reason && (
                    <p className="text-xs text-text-tertiary italic">{ticket.priority_reason}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {ticket.original_media_url && (
                  <img
                    src={ticket.original_media_url.startsWith('/') ? apiUrl(ticket.original_media_url) : ticket.original_media_url}
                    alt="Issue"
                    className="w-24 h-24 object-cover rounded border border-border-default shrink-0"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border-default">
                {ticket.status === 'assigned' && (
                  <button
                    onClick={() => handleStartWork(ticket.id)}
                    aria-label={`Start work on ticket ${ticket.id.slice(0, 8)}`}
                    className="focus-ring inline-flex items-center gap-1.5 text-xs bg-orange-950/40 text-orange-300 border border-orange-800/40 px-3 py-1.5 rounded hover:bg-orange-950/60 transition-all active:scale-[0.97]"
                  >
                    <Wrench size={14} /> Start Work
                  </button>
                )}
                <Link
                  to={`/shared/trace/${ticket.id}`}
                  className="focus-ring inline-flex items-center gap-1.5 text-xs bg-brand-soft text-brand-lime border border-brand-lime/20 px-3 py-1.5 rounded hover:bg-brand-lime/15 transition-all"
                >
                  <PlayCircle size={14} /> Agent Trace
                </Link>
                <Link
                  to={`/citizen/report/${ticket.id}`}
                  className="focus-ring inline-flex items-center gap-1.5 text-xs text-text-secondary border border-border-default px-3 py-1.5 rounded hover:text-foreground hover:border-border-hover transition-all"
                >
                  View Details
                </Link>
              </div>

              {(ticket.status === 'assigned' || ticket.status === 'in_progress') && (
                <div className="bg-background/50 border border-border-default rounded p-4 space-y-3">
                  <p className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Submit Resolution</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="closure-photo-url"
                      type="url"
                      aria-label="Closure photo URL"
                      placeholder="Closure photo URL (after repair)"
                      value={resolvingId === ticket.id ? closureUrl : ''}
                      onFocus={() => setResolvingId(ticket.id)}
                      onChange={e => {
                        setResolvingId(ticket.id);
                        setClosureUrl(e.target.value);
                      }}
                      className="focus-ring flex-1 bg-background border border-border-default rounded px-3 py-2 text-sm text-foreground placeholder:text-text-quaternary"
                    />
                    <button
                      type="button"
                      aria-label={`Resolve ticket ${ticket.id.slice(0, 8)} with sample photo`}
                      onClick={() => {
                        const sampleUrl = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600';
                        setClosureUrl(sampleUrl);
                        setResolvingId(ticket.id);
                        apiFetch(`/api/tickets/${ticket.id}/resolve`, {
                          method: 'POST',
                          body: JSON.stringify({ closure_media_url: sampleUrl }),
                        })
                          .then(res => {
                            if (!res.ok) throw new Error('Resolve failed');
                            toast({ type: 'success', title: 'Ticket resolved (sample)' });
                            setClosureUrl('');
                            setResolvingId(null);
                            loadQueue();
                          })
                          .catch(() => {
                            toast({ type: 'error', title: 'Resolution failed' });
                            setResolvingId(null);
                          });
                      }}
                      className="focus-ring inline-flex items-center justify-center gap-1.5 text-xs bg-brand-lime text-background font-semibold px-4 py-2 rounded hover:bg-brand-lime-hover disabled:opacity-50"
                    >
                      <Upload size={14} />
                      Use Sample & Resolve
                    </button>
                    <button
                      type="button"
                      aria-label={`Submit closure for ticket ${ticket.id.slice(0, 8)}`}
                      onClick={() => handleResolve(ticket.id)}
                      disabled={resolvingId !== ticket.id || !closureUrl.trim()}
                      className="focus-ring inline-flex items-center justify-center gap-1.5 text-xs border border-border-default text-text-primary px-4 py-2 rounded hover:text-foreground disabled:opacity-50"
                    >
                      Submit Closure
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-text-quaternary flex items-center gap-1">
        <AlertTriangle size={12} />
        Queue sorted by priority score (highest first).
      </div>
    </div>
  );
};
