import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import {
  FileText, CheckCircle2, Plus, MapPin, Calendar, AlertCircle, TrendingUp, RotateCcw, Activity,
  Bell, ClipboardList, Lightbulb, ArrowRight,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { MetricCard } from '../../components/ui/Card';
import { CircularProgress } from '../../components/ui/ProgressBar';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { SlaCountdown } from '../../components/ui/SlaCountdown';
import type { Ticket, Ward } from '../../lib/types';
import { mapTileAttribution, mapTileClassName, mapTileUrl } from '../../lib/mapTiles';
import { statusBadgeValue, isOpenStatus, isResolvedStatus } from '../../lib/ticketStatus';


/**
 * Open / resolved membership now comes from the shared vocabulary in
 * `lib/ticketStatus`, which is where `needs_review` lives. It used to be
 * missing from OPEN_STATUSES on this page, so those tickets fell into no
 * bucket: the metric cards did not add up and no filter except "All" could
 * find them.
 */

type ReportFilter = 'all' | 'open' | 'resolved';

/** How many report cards are rendered before the "show more" control. */
const REPORT_PAGE_SIZE = 12;

const FILTERS: { id: ReportFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Active' },
  { id: 'resolved', label: 'Resolved' },
];

function priorityBadgeValue(score: number): string {
  if (score >= 3) return 'high';
  if (score === 2) return 'medium';
  return 'low';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Plain-language "what happens next" copy so a first-time citizen can read a
// ticket card without knowing the internal status vocabulary.
function nextStepHint(status: string): string {
  switch (status) {
    case 'reported':  return 'AI is classifying this and routing it to a department.';
    case 'assigned':  return 'A field officer has been assigned and will start shortly.';
    case 'in_progress': return 'A field officer is working on it now.';
    case 'needs_review': return 'This one needs a human decision before it can be assigned.';
    case 'resolved':  return 'Mark this as fixed once you have checked the spot.';
    case 'verified':  return 'Closed. Thanks for confirming the fix.';
    default:          return 'Waiting for the next update.';
  }
}

// 4-stage progress timeline shown on every report card.
// A stage is "reached" once the ticket's status is at or past it.
const STATUS_STAGES: { key: string; label: string }[] = [
  { key: 'reported', label: 'Filed' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
];

function stageIndex(status: string): number {
  if (status === 'verified') return STATUS_STAGES.length; // past resolved
  const i = STATUS_STAGES.findIndex(s => s.key === status);
  return i === -1 ? 0 : i;
}

// Lime brand pin for the citizen's own ticket markers on the mini-map.
const CITIZEN_PIN = divIcon({
  className: 'custom-map-marker',
  html: `<div style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;background:#C6F135;border:2px solid #161616;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 8px rgba(198,241,53,0.6);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function uhsTone(score: number): { accent: 'success' | 'warning' | 'danger'; stroke: string; label: string } {
  if (score >= 80) return { accent: 'success', stroke: 'text-status-resolved', label: 'Healthy' };
  if (score >= 60) return { accent: 'warning', stroke: 'text-status-progress', label: 'Watch' };
  return { accent: 'danger', stroke: 'text-status-escalated', label: 'Critical' };
}

const QUICK_ACTIONS = [
  {
    to: '/citizen/report',
    icon: Plus,
    label: 'Report an issue',
    detail: 'Photo + map pin, about 60 seconds',
    primary: true,
  },
  {
    to: '/citizen/notifications',
    icon: Bell,
    label: 'Check updates',
    detail: 'Status changes on your reports',
    primary: false,
  },
  {
    to: '/citizen/ward-health',
    icon: Activity,
    label: 'Ward health',
    detail: 'See what is happening nearby',
    primary: false,
  },
];

const ONBOARDING_STEPS = [
  { icon: ClipboardList, title: 'Describe the problem', detail: 'Pick a category, write a line or two, attach a photo.' },
  { icon: MapPin, title: 'Pin the exact spot', detail: 'Drop a marker or let the app use your phone GPS.' },
  { icon: Lightbulb, title: 'Let AI triage it', detail: 'Department, priority and SLA are set automatically.' },
];

export const CitizenDashboard: React.FC = () => {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReportFilter>('all');
  const [showAll, setShowAll] = useState(false);

  const loadTickets = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch('/api/tickets'),
      apiFetch('/api/analytics/wards'),
    ])
      .then(async ([ticketRes, wardRes]) => {
        if (!ticketRes.ok) throw new Error(`Failed to load tickets (${ticketRes.status})`);
        if (!wardRes.ok) throw new Error(`Failed to load wards (${wardRes.status})`);
        return Promise.all([ticketRes.json(), wardRes.json()]);
      })
      .then(([ticketData, wardData]) => {
        setTickets(ticketData);
        setWards(wardData);
        setLoading(false);
      })
      .catch(err => {
        // Never show a raw status code or network string to a citizen.
        setError(
          err instanceof Error && /401|403/.test(err.message)
            ? 'Your session has expired. Sign in again to see your reports.'
            : "We couldn't load your reports. Check your connection and try again."
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const totalReports = tickets.length;
  const openReports = tickets.filter(t => isOpenStatus(t.status)).length;
  const resolvedReports = tickets.filter(t => isResolvedStatus(t.status)).length;

  const visibleTickets = useMemo(() => {
    const base = filter === 'open'
      ? tickets.filter(t => isOpenStatus(t.status))
      : filter === 'resolved'
        ? tickets.filter(t => isResolvedStatus(t.status))
        : tickets;
    return showAll ? base : base.slice(0, REPORT_PAGE_SIZE);
  }, [tickets, filter, showAll]);

  /** How many the current filter matches, before the page cap. */
  const filterTotal = useMemo(() => {
    if (filter === 'open') return tickets.filter(t => isOpenStatus(t.status)).length;
    if (filter === 'resolved') return tickets.filter(t => isResolvedStatus(t.status)).length;
    return tickets.length;
  }, [tickets, filter]);

  // City average UHS for the gauge tile. Per-ward selection would need a
  // spatial join on the citizen's coords, which the backend doesn't expose
  // for the dashboard — show the aggregate as a simple, honest signal.
  const cityUhs = useMemo(() => {
    if (wards.length === 0) return null;
    const sum = wards.reduce((acc, w) => acc + (w.uhs_score ?? 0), 0);
    return sum / wards.length;
  }, [wards]);

  // Map center: mean of recent ticket coords, or null if nothing to plot.
  const mapCenter = useMemo<[number, number] | null>(() => {
    const withCoords = tickets.filter(t => Number.isFinite(t.latitude) && Number.isFinite(t.longitude));
    if (withCoords.length === 0) return null;
    const lat = withCoords.reduce((a, t) => a + t.latitude, 0) / withCoords.length;
    const lon = withCoords.reduce((a, t) => a + t.longitude, 0) / withCoords.length;
    return [lat, lon];
  }, [tickets]);

  const pinnedCount = useMemo(
    () => tickets.filter(t => Number.isFinite(t.latitude) && Number.isFinite(t.longitude)).length,
    [tickets]
  );

  const firstName = (user?.email || user?.phone || '').split(/[@._-]/)[0];
  const displayName = firstName && firstName.length > 1
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
    : null;

  // "Welcome back" is wrong for someone who has never filed a report.
  const greeting = !loading && totalReports === 0
    ? 'Welcome — let\u2019s get your first issue fixed'
    : displayName
      ? `Welcome back, ${displayName}`
      : 'Welcome back';

  // Contextual sub-line: replace a generic greeting with the actual state.
  const contextLine = loading
    ? 'Loading your reports…'
    : totalReports === 0
      ? 'No reports yet — your first one takes about a minute.'
      : openReports > 0
        ? `${openReports} active ${openReports === 1 ? 'report' : 'reports'} in progress · ${resolvedReports} resolved`
        : `All ${totalReports} of your ${totalReports === 1 ? 'report is' : 'reports are'} resolved`;

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-foreground font-sans">
        <div role="alert" className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-status-escalated/10 border border-status-escalated/30 flex items-center justify-center mb-4">
            <AlertCircle size={24} className="text-status-escalated" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1.5">Failed to load dashboard</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-5 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={loadTickets}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-lime-hover transition-all duration-200 disabled:opacity-50"
          >
            <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 text-foreground relative font-sans pb-24 md:pb-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-serif italic font-bold">{greeting}</h1>
          <p className="text-gray-400 text-sm mt-1">{contextLine}</p>
        </div>
        <Link
          to="/citizen/report"
          className="inline-flex items-center gap-2 self-start bg-brand-lime text-background hover:bg-brand-lime-hover active:scale-[0.98] font-semibold px-4 h-11 rounded-lg transition-all duration-150"
        >
          <Plus size={16} />
          <span>Report an issue</span>
        </Link>
      </div>

      {/* Quick actions — the primary path is obvious before any scrolling */}
      <section aria-label="Quick actions">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={action.to}
                className={`group flex items-start gap-3 rounded-lg p-4 border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] ${
                  action.primary
                    ? 'bg-brand-soft border-brand-lime/30 hover:border-brand-lime/50'
                    : 'bg-panel-card border-panel-border hover:bg-panel-hover hover:border-border-hover'
                }`}
              >
                <div
                  className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border ${
                    action.primary
                      ? 'bg-brand-lime text-background border-transparent'
                      : 'bg-panel-bg text-gray-400 border-panel-border group-hover:text-foreground'
                  }`}
                >
                  <action.icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className={`text-body font-semibold ${action.primary ? 'text-text-primary' : 'text-text-primary'}`}>
                    {action.label}
                  </p>
                  <p className="text-caption text-text-tertiary mt-0.5">{action.detail}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="ml-auto shrink-0 mt-1 text-text-quaternary group-hover:text-brand-lime transition-colors"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Metrics double as report-list filters */}
      <section aria-label="Report totals">
        {!loading && totalReports > 0 && (
          <p className="mb-2 text-caption text-text-tertiary font-mono">
            Tap a total to filter the list below
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading ? (
            <>
              <MetricCard label="My Total Reports" icon={<FileText size={20} />}><SkeletonCard /></MetricCard>
              <MetricCard label="Open Reports" icon={<TrendingUp size={20} />}><SkeletonCard /></MetricCard>
              <MetricCard label="Issues Resolved" icon={<CheckCircle2 size={20} />} accent><SkeletonCard /></MetricCard>
            </>
          ) : (
            <>
              {([
                { id: 'all' as ReportFilter, label: 'My Total Reports', icon: <FileText size={20} />, value: totalReports },
                { id: 'open' as ReportFilter, label: 'Open Reports', icon: <TrendingUp size={20} />, value: openReports },
                { id: 'resolved' as ReportFilter, label: 'Issues Resolved', icon: <CheckCircle2 size={20} />, value: resolvedReports },
              ]).map(m => {
                const active = filter === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFilter(m.id)}
                    aria-pressed={active}
                    aria-label={`${m.label}: ${m.value}. ${active ? 'Currently filtering the report list' : 'Show this group in the report list'}`}
                    className={`text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200 ${
                      active ? 'ring-1 ring-brand-lime/50' : 'ring-1 ring-transparent'
                    }`}
                  >
                    <MetricCard
                      label={m.label}
                      icon={m.icon}
                      accent={active}
                      className="hover:bg-panel-hover cursor-pointer h-full"
                    >
                      <span className="flex items-baseline gap-2">
                        {m.value}
                        {active && (
                          <span
                            className="font-mono text-[10px] uppercase tracking-wider text-brand-lime not-italic"
                            aria-hidden="true"
                          >
                            showing
                          </span>
                        )}
                      </span>
                    </MetricCard>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </section>

      {/* First-visit onboarding — only shown when there is nothing to track yet */}
      {!loading && totalReports === 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Getting started"
          className="rounded-lg border border-brand-lime/20 bg-brand-soft p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={16} className="text-brand-lime" aria-hidden="true" />
            <h2 className="text-heading font-semibold text-text-primary">Getting started</h2>
          </div>
          <p className="text-body-sm text-text-secondary mb-5">
            Three steps from a photo to a resolved street-level issue.
          </p>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ONBOARDING_STEPS.map((step, i) => (
              <li key={step.title} className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-md bg-surface-card border border-brand-lime/25 flex items-center justify-center">
                  <step.icon size={15} className="text-brand-lime" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-body-sm font-semibold text-text-primary">
                    <span className="font-mono text-text-quaternary mr-1.5">{String(i + 1).padStart(2, '0')}</span>
                    {step.title}
                  </p>
                  <p className="text-caption text-text-tertiary mt-0.5">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.section>
      )}

      {/* UHS gauge + Mini-map row */}
      {(!loading && (cityUhs !== null || mapCenter !== null)) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cityUhs !== null && (
            <div className="bg-panel-card border border-panel-border rounded-lg p-5 flex items-center gap-5">
              <CircularProgress
                value={cityUhs}
                size={84}
                strokeWidth={6}
                showLabel={false}
                accent={uhsTone(cityUhs).accent}
                className={uhsTone(cityUhs).stroke}
              />
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block">
                  City UHS
                </span>
                <span className="text-2xl font-serif italic font-bold block">
                  {cityUhs.toFixed(1)}
                </span>
                <span className={`text-[11px] font-mono ${uhsTone(cityUhs).stroke}`}>
                  {uhsTone(cityUhs).label} · {wards.length} ward{wards.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          )}

          {mapCenter && (
            <div className={`bg-panel-card border border-panel-border rounded-lg overflow-hidden ${cityUhs !== null ? 'md:col-span-2' : 'md:col-span-3'}`}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-panel-border bg-panel-bg">
                <Activity size={14} className="text-brand-lime" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Your reports</span>
                <span className="text-[10px] font-mono text-text-quaternary ml-auto">
                  {pinnedCount} pin{pinnedCount === 1 ? '' : 's'}
                </span>
              </div>
              <div aria-hidden="true" className="h-44">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  className={`w-full h-full ${mapTileClassName}`}
                  zoomControl={false}
                  scrollWheelZoom={false}
                  dragging={false}
                  attributionControl={false}
                  keyboard={false}
                >
                  <TileLayer
                    attribution={mapTileAttribution}
                    url={mapTileUrl}
                  />
                  {tickets
                    .filter(t => Number.isFinite(t.latitude) && Number.isFinite(t.longitude))
                    .map(t => (
                      <Marker key={t.id} position={[t.latitude, t.longitude]} icon={CITIZEN_PIN} />
                    ))}
                </MapContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reports list */}
      <section aria-label="Your reports" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-serif italic font-bold flex items-center gap-2">
            <span>{filter === 'open' ? 'Active reports' : filter === 'resolved' ? 'Resolved reports' : 'All reports'}</span>
            {!loading && (
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-panel-card border border-panel-border text-gray-400 font-normal">
                {visibleTickets.length} of {filterTotal}
              </span>
            )}
          </h2>

          {!loading && totalReports > 0 && (
            <div role="group" aria-label="Filter reports" className="flex gap-1 rounded-lg bg-surface-elevated p-1">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  className={`h-11 px-4 rounded-md text-label font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime ${
                    filter === f.id
                      ? 'bg-surface-card text-brand-lime'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : totalReports === 0 ? (
          // The "Getting started" card above is already the first-visit prompt;
          // repeating it here would stack two competing calls to action.
          <div className="rounded-lg border border-panel-border bg-panel-card px-5 py-6 text-center">
            <p className="text-body-sm text-text-secondary">
              Your reports will appear here once you file your first one.
            </p>
          </div>
        ) : visibleTickets.length === 0 ? (
          <div className="bg-panel-card border border-panel-border rounded-lg">
            <EmptyState
              icon={filter === 'open' ? CheckCircle2 : FileText}
              title={filter === 'open' ? 'Nothing active right now' : 'Nothing resolved yet'}
              message={
                filter === 'open'
                  ? 'Every report you filed has been resolved. We will notify you the moment a new one needs attention.'
                  : 'Resolved and verified reports will appear here once a field officer closes them.'
              }
              action={
                filter === 'open'
                  ? { label: 'View all reports', onClick: () => setFilter('all'), variant: 'secondary' as const }
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleTickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i, 6) * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={`/citizen/report/${ticket.id}`}
                  className="block bg-panel-card border border-panel-border hover:border-brand-lime/30 hover:bg-panel-hover rounded-lg p-5 transition-all duration-200 group card-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-body font-semibold text-text-primary group-hover:text-brand-lime transition-colors">
                        {ticket.category}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge type="priority" value={priorityBadgeValue(ticket.priority_score)} />
                        <Badge type="status" value={statusBadgeValue(ticket.status)} />
                      </div>
                    </div>

                    <p className="text-gray-400 text-caption leading-relaxed line-clamp-2">
                      {ticket.description || 'No description provided.'}
                    </p>

                    {/* Plain-language status line — no status vocabulary required */}
                    <p className="text-caption text-text-secondary flex items-start gap-1.5">
                      <ArrowRight size={12} className="shrink-0 mt-0.5 text-brand-lime" aria-hidden="true" />
                      <span>{nextStepHint(ticket.status)}</span>
                    </p>

                    {(() => {
                      const reached = stageIndex(ticket.status);
                      return (
                        <ol
                          aria-label="Resolution progress"
                          className="flex items-center gap-1 pt-1"
                        >
                          {STATUS_STAGES.map((stage, i) => {
                            const done = i < reached;
                            const active = i === reached && ticket.status !== 'verified';
                            return (
                              <li key={stage.key} className="flex-1 flex items-center gap-1 min-w-0">
                                <span
                                  aria-hidden="true"
                                  className={`shrink-0 w-2 h-2 rounded-full transition-colors ${
                                    done ? 'bg-brand-lime'
                                      : active ? 'bg-brand-lime animate-pulse'
                                      : 'bg-panel-border'
                                  }`}
                                />
                                <span
                                  className={`text-[10px] font-mono uppercase tracking-wider truncate ${
                                    done || active ? 'text-gray-300' : 'text-text-quaternary'
                                  }`}
                                >
                                  {stage.label}
                                </span>
                                {i < STATUS_STAGES.length - 1 && (
                                  <span
                                    aria-hidden="true"
                                    className={`flex-1 h-px ml-1 ${i < reached ? 'bg-brand-lime/60' : 'bg-panel-border'}`}
                                  />
                                )}
                              </li>
                            );
                          })}
                        </ol>
                      );
                    })()}
                  </div>

                  <div className="border-t border-panel-border/60 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">{ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <SlaCountdown
                        expectedResolutionAt={ticket.expected_resolution_at}
                        status={ticket.status}
                      />
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{ticket.created_at ? timeAgo(ticket.created_at) : 'Today'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filterTotal > visibleTickets.length && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-lg border border-border-default bg-panel-card px-5 text-sm font-medium text-text-primary transition-colors hover:border-brand-lime/30 hover:text-foreground"
            >
              Show all {filterTotal} reports
            </button>
          </div>
        )}
      </section>

      {/* FAB — mobile primary action. pb-24 on the wrapper keeps it from
          covering the last card's footer when scrolled to the bottom. */}
      <Link
        to="/citizen/report"
        aria-label="Report a new issue"
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-lime hover:bg-brand-lime-hover text-background rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 md:hidden z-40 border border-brand-lime/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
      >
        <Plus size={24} />
      </Link>

    </div>
  );
};
