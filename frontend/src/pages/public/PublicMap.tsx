import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { AlertTriangle, MapPin, Activity, Flame, Plus, RefreshCw, Inbox, TrendingUp, FileText } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { avgUhs } from '../../lib/uhs';
import { mapTileAttribution, mapTileClassName, mapTileUrl } from '../../lib/mapTiles';
import { HeatmapLayer, type HeatPoint } from '../../components/map/HeatmapLayer';
import type { Ward, CityPulse } from '../../lib/types';
import { mapStatusLabel, statusMapColor, statusMapRadius } from '../../lib/ticketStatus';
import { CITY_CENTER, CITY_NAME, CITY_TICKETS_NEAR_URL } from '../../lib/city';

/**
 * Leaflet renders into raw SVG, so these mirror the DESIGN.md semantic palette
 * exactly: new=blue, in progress=amber, resolved=emerald, verified=purple.
 * An earlier version used off-system hexes where `resolved` and `verified` were
 * both green, making the two states indistinguishable on the map.
 */


/** Rendering more than this freezes the tab; the API is rate limited anyway. */
const MAX_MARKERS = 500;

interface PublicTicket {
  id: string;
  category: string;
  severity: string;
  description?: string | null;
  status: string;
  latitude: number;
  longitude: number;
  created_at?: string | null;
}

function uhsTone(score: number) {
  if (score >= 80) return 'text-status-resolved';
  if (score >= 60) return 'text-status-progress';
  return 'text-status-escalated';
}

function relativeTime(iso?: string | null): string {
  if (!iso) return 'just now';
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff)) return 'just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const PublicMap: React.FC = () => {
  useDocumentTitle('City Incident Map');
  // Signed-in visitors get a shortcut to their own reports, but the map itself
  // always renders the whole city.
  const { user } = useAuth();
  const [tickets, setTickets] = useState<PublicTicket[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [pulse, setPulse] = useState<CityPulse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  // Ticks every 30s so the freshness label does not silently go stale.
  const [, setTick] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Always the public city feed. This page is titled "City Incident Map" and
      // promises "every reported issue across {CITY_NAME}" — it previously
      // switched to the authenticated /api/tickets endpoint when a session
      // existed, so a signed-in visitor silently saw only their OWN tickets
      // (and the map re-centred on wherever those happened to be).
      const [wardsRes, pulseRes, ticketsRes] = await Promise.all([
        apiFetch('/api/analytics/wards'),
        apiFetch('/api/analytics/city-pulse'),
        apiFetch(CITY_TICKETS_NEAR_URL),
      ]);

      if (!wardsRes.ok || !pulseRes.ok) throw new Error('aggregate');
      if (!ticketsRes.ok) throw new Error('tickets');

      const [wardsData, pulseData, ticketsData] = await Promise.all([
        wardsRes.json(),
        pulseRes.json(),
        ticketsRes.json(),
      ]);

      setWards(Array.isArray(wardsData) ? wardsData : []);
      setPulse(pulseData ?? null);
      setTickets(
        Array.isArray(ticketsData)
          ? ticketsData
              .filter((t: PublicTicket) => Number.isFinite(t.latitude) && Number.isFinite(t.longitude))
              .slice(0, MAX_MARKERS)
          : []
      );
      setUpdatedAt(new Date().toISOString());
      setLoading(false);
    } catch {
      // Never surface a raw status code or a network string to a citizen.
      setError("We couldn't reach the live city feed. Check your connection and try again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (tickets.length === 0) return [CITY_CENTER.lat, CITY_CENTER.lng];
    return [
      tickets.reduce((s, t) => s + t.latitude, 0) / tickets.length,
      tickets.reduce((s, t) => s + t.longitude, 0) / tickets.length,
    ];
  }, [tickets]);

  const openCount = tickets.filter(t => !['resolved', 'verified'].includes(t.status)).length;
  const resolvedCount = tickets.length - openCount;
  const statusesPresent = useMemo(
    () => [...new Set(tickets.map(t => t.status))],
    [tickets]
  );

  // Only *open* incidents should heat the map — a resolved high-priority ticket
  // was still contributing 0.5 weight and made closed areas look critical.
  const heatPoints: HeatPoint[] = useMemo(
    () =>
      tickets
        .filter(t => !['resolved', 'verified'].includes(t.status))
        .map(t => ({
          lat: t.latitude,
          lng: t.longitude,
          weight: 0.5 + Math.min(1, Math.max(0, (Number(t.severity === 'critical' ? 3 : 2)) / 3)) * 0.5,
        })),
    [tickets]
  );

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div role="alert" className="flex flex-col items-center justify-center rounded-lg border border-border-default bg-surface-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-status-escalated/30 bg-status-escalated/10">
            <AlertTriangle size={24} className="text-status-escalated" aria-hidden="true" />
          </div>
          <h2 className="mb-1.5 text-base font-semibold">Live feed unavailable</h2>
          <p className="mb-5 max-w-xs text-sm text-text-secondary">{error}</p>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-brand-lime px-4 text-xs font-semibold text-background transition-colors hover:bg-brand-lime-hover disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
            {loading ? 'Retrying…' : 'Try again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">

      {/* Header + primary action */}
      <div className="flex flex-col gap-4 border-b border-border-default pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold italic font-serif">City Incident Map</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Every reported issue across {CITY_NAME}, live. Tap a marker for details.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {user && (
            <Link
              to="/citizen"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-default bg-surface-card px-4 text-sm font-medium text-foreground transition-colors hover:border-brand-lime/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
            >
              <FileText size={15} aria-hidden="true" />
              My reports
            </Link>
          )}
          <Link
            to="/auth/citizen-login"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-lime px-5 text-sm font-semibold text-background transition-colors hover:bg-brand-lime-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Plus size={16} aria-hidden="true" />
            Report an issue
          </Link>
          {updatedAt && (
            <span className="inline-flex items-center justify-end gap-1.5 text-[11px] font-mono text-text-quaternary">
              <span className="h-1.5 w-1.5 rounded-full bg-status-resolved" aria-hidden="true" />
              Updated {relativeTime(updatedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-border-default bg-surface-card p-4">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Open now</span>
          <span className="mt-1 block text-3xl font-bold italic font-serif">{loading ? '—' : openCount}</span>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-card p-4">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Resolved</span>
          <span className="mt-1 block text-3xl font-bold italic font-serif text-status-resolved">
            {loading ? '—' : resolvedCount}
          </span>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-card p-4">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-text-tertiary">City health score</span>
          <span className={`mt-1 block text-3xl font-bold italic font-serif ${uhsTone(avgUhs(wards))}`}>
            {loading ? '—' : avgUhs(wards).toFixed(1)}
          </span>
          <span className="mt-0.5 block text-[10px] text-text-quaternary">0–100 · lower means more strain</span>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-card p-4">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Wards monitored</span>
          <span className="mt-1 block text-3xl font-bold italic font-serif">{loading ? '—' : wards.length}</span>
        </div>
      </div>

      {loading ? (
        <div
          role="status"
          aria-busy="true"
          className="flex h-[320px] items-center justify-center rounded-lg border border-border-default bg-surface-card md:h-[440px] lg:h-[560px]"
        >
          <span className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-lime/30 border-t-brand-lime" aria-hidden="true" />
            Loading the live city feed…
          </span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-lg border border-border-default bg-surface-card py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border-default bg-surface-raised">
            <Inbox size={24} className="text-text-tertiary" aria-hidden="true" />
          </div>
          <h2 className="mb-1 text-base font-semibold">
            {wards.length === 0 ? 'City data is still being set up' : 'No issues on the map right now'}
          </h2>
          <p className="mx-auto max-w-sm text-sm text-text-secondary">
            {wards.length === 0
              ? `Ward health data for ${CITY_NAME} is being collected. Please check back shortly.`
              : 'Nothing is open in this area at the moment. If something is broken, report it and it will appear here.'}
          </p>
          <Link
            to="/auth/citizen-login"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-brand-lime px-5 text-sm font-semibold text-background transition-colors hover:bg-brand-lime-hover"
          >
            <Plus size={16} aria-hidden="true" />
            Report an issue
          </Link>
        </div>
      ) : (
        <>
          {/* Controls + legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-border-default bg-surface-card px-4 py-3">
            <span className="font-mono text-xs text-text-secondary">
              {tickets.length} shown · <span className="text-status-progress">{openCount} open</span>
            </span>
            <button
              type="button"
              onClick={() => setShowHeatmap(v => !v)}
              aria-pressed={showHeatmap}
              className={`inline-flex h-8 items-center gap-1.5 rounded border px-2.5 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime ${
                showHeatmap
                  ? 'border-brand-lime/30 bg-brand-soft text-brand-lime'
                  : 'border-border-default text-text-tertiary hover:text-text-primary'
              }`}
            >
              <Flame size={12} aria-hidden="true" />
              {showHeatmap ? 'Density on' : 'Density off'}
            </button>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-border-default px-2.5 font-mono text-[11px] text-text-tertiary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime disabled:opacity-50"
            >
              <RefreshCw size={12} aria-hidden="true" />
              Refresh
            </button>

            {/* Legend — status is never colour-only */}
            <ul className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {statusesPresent.map(status => (
                <li key={status} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: statusMapColor(status) }}
                    aria-hidden="true"
                  />
                  {mapStatusLabel(status)}
                </li>
              ))}
            </ul>
          </div>

          {/* Map */}
          <div
            role="region"
            aria-label={`Incident map of ${CITY_NAME}`}
            className="h-[320px] w-full overflow-hidden rounded-lg border border-border-default md:h-[440px] lg:h-[560px]"
          >
            <MapContainer
              center={center}
              zoom={12}
              className={`h-full w-full ${mapTileClassName}`}
              scrollWheelZoom={false}
            >
              <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
              {showHeatmap && <HeatmapLayer points={heatPoints} visible={showHeatmap} />}
              {tickets.map(t => (
                <CircleMarker
                  key={t.id}
                  center={[t.latitude, t.longitude]}
                  radius={statusMapRadius(t.status)}
                  pathOptions={{
                    color: statusMapColor(t.status),
                    fillColor: statusMapColor(t.status),
                    fillOpacity: 0.5,
                    weight: 1.5,
                  }}
                >
                  <Popup>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold">{t.category}</p>
                      {t.description && (
                        <p className="text-text-secondary">
                          {t.description.length > 110 ? `${t.description.slice(0, 110)}…` : t.description}
                        </p>
                      )}
                      <p className="text-text-tertiary">
                        <span className="text-text-secondary">Status: </span>
                        {mapStatusLabel(t.status)}
                      </p>
                      <p className="text-text-tertiary">
                        <span className="text-text-secondary">Severity: </span>
                        {t.severity}
                      </p>
                      <p className="text-text-quaternary">
                        Reported {relativeTime(t.created_at)}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </>
      )}

      {/* Ward health + what's trending */}
      {!loading && wards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section aria-label="Ward health" className="rounded-lg border border-border-default bg-surface-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-heading font-semibold">
              <Activity size={16} className="text-brand-lime" aria-hidden="true" />
              Ward health
            </h2>
            <ul className="space-y-2.5">
              {wards.map(w => (
                <li key={w.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-text-secondary">{w.name}</span>
                  <span className={`shrink-0 font-mono text-sm font-semibold ${uhsTone(w.uhs_score)}`}>
                    {w.uhs_score.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Most reported issues" className="rounded-lg border border-border-default bg-surface-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-heading font-semibold">
              <TrendingUp size={16} className="text-brand-lime" aria-hidden="true" />
              Most reported right now
            </h2>
            {pulse && pulse.trending_categories.length > 0 ? (
              <ul className="space-y-2.5">
                {pulse.trending_categories.map(c => (
                  <li key={c.category} className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-text-secondary">{c.category}</span>
                    <span className="shrink-0 font-mono text-sm text-text-tertiary">{c.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-tertiary">Nothing is trending at the moment.</p>
            )}

            {pulse && pulse.critical_wards > 0 && (
              <p className="mt-4 flex items-start gap-2 rounded-md border border-status-escalated/30 bg-status-escalated/10 p-3 text-xs text-text-secondary">
                <AlertTriangle size={13} className="mt-px shrink-0 text-status-escalated" aria-hidden="true" />
                <span>
                  {pulse.critical_wards} {pulse.critical_wards === 1 ? 'ward is' : 'wards are'} under heavy
                  strain. Open issues there are being prioritised.
                </span>
              </p>
            )}
          </section>
        </div>
      )}

      {!loading && tickets.length === 0 && wards.length === 0 && (
        <p className="flex items-center justify-center gap-2 py-6 text-sm text-text-tertiary">
          <MapPin size={14} aria-hidden="true" />
          No city data available right now.
        </p>
      )}
    </div>
  );
};
