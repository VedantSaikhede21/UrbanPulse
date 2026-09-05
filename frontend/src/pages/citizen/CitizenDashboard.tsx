import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { FileText, CheckCircle2, AlertTriangle, Plus, MapPin, Calendar, AlertCircle, TrendingUp, RotateCcw, Activity } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { MetricCard } from '../../components/ui/Card';
import { CircularProgress } from '../../components/ui/ProgressBar';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { apiFetch } from '../../lib/api';
import { SlaCountdown } from '../../components/ui/SlaCountdown';
import type { Ticket, Ward } from '../../lib/types';


const OPEN_STATUSES = ['reported', 'assigned', 'in_progress'];
const RESOLVED_STATUSES = ['resolved', 'verified'];

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

function MetricSkeleton() {
  return (
    <MetricCard label="" icon={<div className="w-5 h-5" />}>
      <SkeletonCard />
    </MetricCard>
  );
}

// 4-stage progress timeline shown on every recent-report card.
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

function uhsTone(score: number): { stroke: string; label: string } {
  if (score >= 80) return { stroke: 'text-emerald-400', label: 'Healthy' };
  if (score >= 60) return { stroke: 'text-amber-400', label: 'Watch' };
  return { stroke: 'text-red-400', label: 'Critical' };
}

export const CitizenDashboard: React.FC = () => {
  useDocumentTitle('Dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(err.message || 'Could not load tickets');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const totalReports = tickets.length;
  const openReports = tickets.filter(t => OPEN_STATUSES.includes(t.status)).length;
  const resolvedReports = tickets.filter(t => RESOLVED_STATUSES.includes(t.status)).length;
  const recentTickets = tickets.slice(0, 6);

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
    const withCoords = recentTickets.filter(t => Number.isFinite(t.latitude) && Number.isFinite(t.longitude));
    if (withCoords.length === 0) return null;
    const lat = withCoords.reduce((a, t) => a + t.latitude, 0) / withCoords.length;
    const lon = withCoords.reduce((a, t) => a + t.longitude, 0) / withCoords.length;
    return [lat, lon];
  }, [recentTickets]);

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen text-foreground font-sans">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1.5">Failed to load dashboard</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-5 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={loadTickets}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim transition-all duration-200 disabled:opacity-50"
          >
            <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 min-h-screen text-foreground relative font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-panel-border pb-6">
        <div>
          <h1 className="text-2xl font-serif italic font-bold">Welcome back, Citizen</h1>
          <p className="text-gray-500 text-xs mt-1">Monitor your infrastructure requests and view auto-triage resolutions.</p>
        </div>
        <Link
          to="/citizen/report"
          className="inline-flex items-center space-x-2 bg-brand-lime text-background hover:bg-brand-lime-hover font-semibold px-5 py-2.5 rounded transition-all duration-150 self-start md:self-auto text-sm"
        >
          <Plus size={16} />
          <span>New Report</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <MetricCard label="My Total Reports" icon={<FileText size={20} />}><SkeletonCard /></MetricCard>
            <MetricCard label="Open Reports" icon={<TrendingUp size={20} />}><SkeletonCard /></MetricCard>
            <MetricCard label="Issues Resolved" icon={<CheckCircle2 size={20} />} accent><SkeletonCard /></MetricCard>
          </>
        ) : (
          <>
            <MetricCard label="My Total Reports" icon={<FileText size={20} />}>{totalReports}</MetricCard>
            <MetricCard label="Open Reports" icon={<TrendingUp size={20} />}>{openReports}</MetricCard>
            <MetricCard label="Issues Resolved" icon={<CheckCircle2 size={20} />} accent>{resolvedReports}</MetricCard>
          </>
        )}
      </div>

      {/* UHS gauge + Mini-map row */}
      {(!loading && (cityUhs !== null || mapCenter !== null)) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cityUhs !== null && (
            <div className="bg-panel-card border border-panel-border rounded-lg p-5 flex items-center gap-5">
              <CircularProgress
                value={cityUhs}
                size={84}
                strokeWidth={6}
                showLabel={false}
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
                  {recentTickets.filter(t => Number.isFinite(t.latitude)).length} pin{recentTickets.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="h-44">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  className="w-full h-full"
                  zoomControl={false}
                  scrollWheelZoom={false}
                  dragging={false}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  {recentTickets
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

      {/* Recent Reports */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif italic font-bold flex items-center gap-2">
          <span>Recent Reports</span>
          {!loading && (
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-panel-card border border-panel-border text-gray-400 font-normal">
              {totalReports} total
            </span>
          )}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No reports filed yet"
            message="Your filed tickets will show up here. Report an issue to begin."
            action={{ label: 'Report Infrastructure Issue', onClick: () => window.location.href = '/citizen/report' }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentTickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
              <Link
                to={`/citizen/report/${ticket.id}`}
                className="block bg-panel-card border border-panel-border hover:border-brand-lime/20 rounded-lg p-6 transition-all duration-200 group card-glow"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-serif italic font-bold text-gray-100 group-hover:text-brand-lime transition-colors">
                      {ticket.category}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge type="priority" value={priorityBadgeValue(ticket.priority_score)} />
                      <Badge type="status" value={statusBadgeValue(ticket.status)} />
                    </div>
                  </div>

                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                    {ticket.description || 'No description provided.'}
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
                                className={`text-[9px] font-mono uppercase tracking-wider truncate ${
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

                <div className="border-t border-panel-border/60 pt-4 mt-4 flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span>{ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-3">
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
      </div>

      {/* FAB */}
      <Link
        to="/citizen/report"
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-lime hover:bg-brand-lime-hover text-background rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 md:hidden z-40 border border-brand-lime/20"
      >
        <Plus size={24} />
      </Link>

    </div>
  );
};
