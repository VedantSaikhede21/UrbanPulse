import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Calendar, CheckCircle2, MapPin,
  PlayCircle, Wrench, Filter, Camera, ShieldAlert, RotateCcw,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { apiFetch, apiUrl, apiUpload } from '../../lib/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../components/ui/Toast';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { SlaCountdown } from '../../components/ui/SlaCountdown';
import type { Ticket } from '../../lib/types';


type StatusFilter = 'all' | 'assigned' | 'in_progress';

/** Distinguishes "you may not see this" from "the network is down". */
type QueueError = { kind: 'permission' } | { kind: 'network'; message: string };

const POLL_INTERVAL = 15_000;

/** "just now" / "40s ago" / "3m ago" — powers the live-freshness label. */
function relativeTime(iso?: string | null): string {
  if (!iso) return 'just now';
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 'just now';
  const secs = Math.floor(diff / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ago`;
}

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
  const [startingId, setStartingId] = useState<string | null>(null);
  /**
   * Closure evidence is stored PER TICKET. It used to be a single component
   * value that `onFocus` rebound to whichever card was focused, so typing a
   * photo URL for ticket A and then touching ticket B armed B's "Submit
   * Closure" with A's evidence.
   */
  const [closureUrls, setClosureUrls] = useState<Record<string, string>>({});
  /** Ticket awaiting explicit confirmation before the irreversible resolve. */
  const [pendingResolve, setPendingResolve] = useState<string | null>(null);
  const [error, setError] = useState<QueueError | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [, setClockTick] = useState(0);

  const hasLoadedOnce = useRef(false);

  const loadQueue = useCallback(() => {
    apiFetch('/api/officers/queue')
      .then(async res => {
        if (res.status === 401 || res.status === 403) {
          // A permission problem is not a connection problem. Reporting it as
          // "Connection Error" with a raw status code is both alarming and
          // useless to the officer.
          const kind: QueueError = { kind: 'permission' };
          if (!hasLoadedOnce.current) setError(kind);
          else toast({ type: 'error', title: 'Queue unavailable', message: 'Your account cannot access the officer queue.' });
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error(`Failed to load queue (${res.status})`);
        return res.json();
      })
      .then(data => {
        if (data === undefined) return; // permission path already handled
        setTickets(data);
        setLoading(false);
        hasLoadedOnce.current = true;
        setLastUpdatedAt(new Date().toISOString());
        setError(null);
      })
      .catch((err: unknown) => {
        setLoading(false);
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (!hasLoadedOnce.current) {
          setError({ kind: 'network', message });
        } else {
          // Show toast for silent refresh failures
          toast({ type: 'error', title: 'Queue refresh failed', message });
        }
      });
  }, [toast]);

  const loadQueueRef = useRef(loadQueue);
  loadQueueRef.current = loadQueue;

  useEffect(() => {
    loadQueueRef.current();
    const interval = setInterval(() => {
      // Don't burn battery and bandwidth polling a tab nobody is looking at.
      if (document.hidden) return;
      loadQueueRef.current();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // A 1s tick, not 15s: the poll resets `lastUpdatedAt` on the same 15s boundary,
  // so a matching tick made the freshness label permanently read "just now".
  useEffect(() => {
    const id = setInterval(() => setClockTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handleStartWork = async (ticketId: string) => {
    if (startingId) return;
    setStartingId(ticketId);
    try {
      const res = await apiFetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'in_progress' }),
      });
      if (!res.ok) throw new Error(`Start work failed (${res.status})`);
      toast({ type: 'success', title: 'Work started', message: 'Ticket moved to In Progress.' });
      loadQueue();
    } catch (err: unknown) {
      toast({ type: 'error', title: 'Could not start work', message: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setStartingId(null);
    }
  };

  const handleResolve = async (ticketId: string, closureUrl: string) => {
    if (resolvingId) return; // guard against a double-tap firing two resolves
    setResolvingId(ticketId);
    setError(null);
    try {
      const res = await apiFetch(`/api/tickets/${ticketId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ closure_media_url: closureUrl }),
      });
      if (!res.ok) throw new Error('Resolve failed');
      toast({ type: 'success', title: 'Ticket resolved', message: 'Verification process initiated' });
      setClosureUrls(prev => {
        const next = { ...prev };
        delete next[ticketId];
        return next;
      });
      setResolvingId(null);
      setPendingResolve(null);
      loadQueue();
    } catch {
      toast({ type: 'error', title: 'Resolution failed', message: 'Could not submit resolution. Try again.' });
      setResolvingId(null);
    }
  };

  /**
   * Upload the closure photo and resolve in one confirmed action.
   * A field officer has a camera, not a URL — the previous UI asked them to
   * type a "Closure photo URL" it could never accept in the field.
   */
  const handleResolveWithPhoto = async (ticketId: string, file: File) => {
    if (resolvingId) return;
    setResolvingId(ticketId);
    setError(null);
    try {
      const up = await apiUpload(`/api/tickets/${ticketId}/closure-media`, file);
      if (!up.ok) throw new Error('Photo upload failed');
      const body = await up.json();
      const url: string | undefined = body?.closure_media_url ?? body?.url ?? body?.media_url;
      if (!url) throw new Error('Upload did not return a media URL');
      setResolvingId(null);
      await handleResolve(ticketId, url);
    } catch (err) {
      toast({
        type: 'error',
        title: 'Could not attach the photo',
        message: err instanceof Error ? err.message : 'Upload failed. Try again.',
      });
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
    const isPermission = error.kind === 'permission';
    return (
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center space-y-4 p-6 text-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full border ${
            isPermission
              ? 'border-status-progress/30 bg-status-progress/10'
              : 'border-status-escalated/30 bg-status-escalated/10'
          }`}
        >
          {isPermission ? (
            <ShieldAlert size={24} className="text-status-progress" aria-hidden="true" />
          ) : (
            <AlertTriangle size={24} className="text-status-escalated" aria-hidden="true" />
          )}
        </div>
        <h2 className="text-lg font-semibold">{isPermission ? 'No queue assigned to you yet' : 'We could not load your queue'}</h2>
        <p className="max-w-md text-sm text-text-secondary">
          {isPermission
            ? 'Your account is active, but no tickets are assigned to it. If you think that is wrong, ask a department head to link your officer record.'
            : "We couldn't reach the queue service. Check your connection and try again."}
        </p>
        {!isPermission && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              loadQueue();
            }}
            className="focus-ring inline-flex h-11 items-center gap-1.5 rounded-lg bg-brand-lime px-5 text-sm font-semibold text-background transition-all hover:bg-brand-lime-hover active:scale-[0.98]"
          >
            <RotateCcw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
            Try again
          </button>
        )}
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
        <div className="bg-status-escalated/10 border border-status-escalated/30 text-status-escalated text-sm px-4 py-3 rounded flex items-center gap-2">
          <AlertTriangle size={14} aria-hidden="true" />
          {error.kind === 'network' ? error.message : 'Your account cannot access the officer queue.'}
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError(null)}
            className="focus-ring ml-auto text-status-escalated hover:text-status-escalated text-xs"
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
                    <SlaCountdown
                      expectedResolutionAt={ticket.expected_resolution_at}
                      status={ticket.status}
                    />
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
                    disabled={startingId === ticket.id}
                    aria-busy={startingId === ticket.id}
                    aria-label={`Start work on ticket ${ticket.id.slice(0, 8)}`}
                    className="focus-ring inline-flex items-center gap-1.5 text-xs bg-status-progress/10 text-status-progress border border-status-progress/30 px-3 py-1.5 rounded hover:bg-status-progress/10 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wrench size={14} /> {startingId === ticket.id ? 'Starting…' : 'Start Work'}
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
                <div className="rounded border border-border-default bg-background/50 p-4 space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                    Submit resolution
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label
                      htmlFor={`closure-photo-${ticket.id}`}
                      className="focus-ring inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border-default px-4 text-xs font-medium text-text-primary transition-colors hover:border-brand-lime/40 hover:text-foreground"
                    >
                      <Camera size={14} aria-hidden="true" />
                      {resolvingId === ticket.id ? 'Uploading photo…' : 'Take / upload closure photo'}
                    </label>
                    <input
                      id={`closure-photo-${ticket.id}`}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      disabled={resolvingId !== null}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        e.target.value = ''; // allow re-picking the same file
                        if (file) handleResolveWithPhoto(ticket.id, file);
                      }}
                    />

                    {/* Manual fallback: paste a link if the upload is not possible. */}
                    <input
                      type="url"
                      aria-label={`Closure photo link for ticket ${ticket.id.slice(0, 8)}`}
                      placeholder="Or paste a photo link"
                      value={closureUrls[ticket.id] ?? ''}
                      onChange={e => setClosureUrls(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                      className="focus-ring min-h-[44px] flex-1 rounded-lg border border-border-default bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-quaternary"
                    />
                    <button
                      type="button"
                      onClick={() => closureUrls[ticket.id]?.trim() && setPendingResolve(ticket.id)}
                      disabled={!closureUrls[ticket.id]?.trim() || resolvingId !== null}
                      className="focus-ring inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-border-default px-4 text-xs text-text-primary transition-colors hover:text-foreground disabled:opacity-50"
                    >
                      Submit Closure
                    </button>
                  </div>
                  <p className="text-caption text-text-quaternary">
                    A closure photo is required so the verification step has evidence to review.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-quaternary">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-status-resolved" aria-hidden="true" />
          Live · updated {relativeTime(lastUpdatedAt)}
        </span>
        <span>Highest priority first.</span>
      </div>

      {/* Resolving a ticket is terminal, so it is always confirmed first. */}
      <ConfirmModal
        isOpen={pendingResolve !== null}
        onClose={() => setPendingResolve(null)}
        onConfirm={() => {
          if (pendingResolve) handleResolve(pendingResolve, closureUrls[pendingResolve]);
        }}
        confirmLoading={resolvingId !== null}
        title="Close this ticket?"
        description="Resolving a ticket starts the verification step and closes it for the citizen. This cannot be undone."
        confirmLabel="Yes, resolve ticket"
        cancelLabel="Keep working"
      />
    </div>
  );
};
