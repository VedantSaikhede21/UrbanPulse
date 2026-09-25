import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader, MapPin, Calendar, AlertTriangle, CheckCircle2, ChevronRight, Image, Mic } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { apiFetch } from '../../lib/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../components/ui/Toast';
import { SlaCountdown } from '../../components/ui/SlaCountdown';
import type { Ticket } from '../../lib/types';
import { mapTileAttribution, mapTileClassName, mapTileUrl } from '../../lib/mapTiles';

const STATIC_MARKER = divIcon({
  className: 'custom-map-marker',
  html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:#C6F135;border:2px solid #161616;border-radius:50%;box-shadow:0 0 12px rgba(198,241,53,0.4);transform:translate(-50%,-100%);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#0d0d0d" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});


export const ReportDetail: React.FC = () => {
  useDocumentTitle('Report Details');
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const controller = new AbortController();
    apiFetch(`/api/tickets/${id}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load ticket');
        return res.json();
      })
      .then((data: Ticket) => {
        if (cancelled) return;
        setTicket(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        toast({ type: 'error', title: 'Failed to load report' });
        setLoading(false);
      });
    return () => { cancelled = true; controller.abort(); };
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-gray-400">
        <Loader className="animate-spin text-brand-lime" size={24} />
        <span className="text-xs font-mono">Loading report tracking data...</span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-center text-gray-400">
        <AlertTriangle className="mx-auto mb-2 text-status-progress" />
        <p className="text-sm">Ticket not found.</p>
        <Link to="/citizen/dashboard" className="text-brand-lime text-xs underline mt-2 block">Back to Dashboard</Link>
      </div>
    );
  }

  // Map ticket status to vertical timeline stages.
  // The stage list has SIX entries but there are only five statuses — the extra
  // "AI triage" stage is completed as part of reaching `assigned`, so an
  // explicit status -> stage-index map is required. Indexing the status order
  // directly shifted every stage after the first by one position.
  const STAGE_FOR_STATUS: Record<string, number> = {
    reported: 0,
    assigned: 2,
    in_progress: 3,
    resolved: 4,
    verified: 5,
  };

  const getTimelineStages = (status: string) => {
    const active = STAGE_FOR_STATUS[status];
    const at = (i: number) => active !== undefined && active > i;
    // The final stage can never be "active" — it is reached only at the end.
    const is = (i: number) => active === i;

    return [
      { label: 'Report received', description: 'Your report has been logged in the system.', completed: at(0), active: is(0) },
      { label: 'AI triage', description: 'The system classified it, scored its priority and checked for duplicates.', completed: at(1), active: is(1) },
      { label: 'Officer assigned', description: 'Routed to the municipal team that handles this kind of issue.', completed: at(2), active: is(2) },
      { label: 'Work in progress', description: 'A field officer is on it now.', completed: at(3), active: is(3) },
      { label: 'Fix submitted', description: 'The officer marked it fixed with a closure photo.', completed: at(4), active: is(4) },
      { label: 'Verified and closed', description: 'The repair was checked and the ticket is closed.', completed: status === 'verified', active: false },
    ];
  };

  const stages = getTimelineStages(ticket.status);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 min-h-screen text-foreground font-sans">
      
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
        <Link to="/citizen/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight size={10} />
        <span className="text-gray-300">Ticket #{ticket.id.slice(0, 8)}</span>
      </div>

      {ticket.ai_degraded && (
        <div
          role="status"
          aria-live="polite"
          data-testid="ai-degraded-banner"
          className="flex items-start gap-3 bg-status-progress/10 border border-status-progress/30 rounded-lg p-4"
        >
          <AlertTriangle size={18} className="text-status-progress mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="text-status-progress font-semibold mb-0.5">AI reasoning unavailable, using basic triage</p>
            <p className="text-status-progress/80 leading-relaxed">
              The category and priority on this ticket were assigned by a fallback
              rule, not by the AI pipeline. An officer will review and may
              recategorize.
            </p>
          </div>
        </div>
      )}

      {/* Ticket Brief Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xl font-serif italic font-bold text-gray-100">{ticket.category}</span>
              <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-full ${ticket.severity === 'high' ? 'text-status-escalated bg-status-escalated/10 border-status-escalated/30' : 'text-status-progress bg-status-progress/10 border-status-progress/30'}`}>
                {ticket.severity} severity
              </span>
              {ticket.expected_resolution_at && ticket.status !== 'resolved' && ticket.status !== 'verified' && (
                <span
                  data-testid="sla-promise"
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 border border-brand-lime/30 bg-brand-soft text-brand-lime rounded-full"
                >
                  <SlaCountdown
                    expectedResolutionAt={ticket.expected_resolution_at}
                    status={ticket.status}
                    variant="compact"
                  />
                </span>
              )}
            </div>
            <p className="text-gray-300 text-xs leading-relaxed bg-panel-card border border-panel-border p-4 rounded-lg">
              {ticket.description}
            </p>
          </div>

          {/* Media Display */}
          {ticket.original_media_url && (
            <div className="bg-panel-card border border-panel-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-panel-border bg-panel-bg">
                <Image size={14} className="text-brand-lime" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Attached Media</span>
              </div>
              <div className="p-3">
                {ticket.original_media_url.match(/\.(mp4|mov|webm)(\?|$)/i) ? (
                  <video src={ticket.original_media_url} controls className="w-full rounded max-h-80 object-contain bg-black" />
                ) : (
                  <img src={ticket.original_media_url} alt="Report evidence" className="w-full rounded max-h-80 object-contain bg-black" />
                )}
              </div>
            </div>
          )}

          {ticket.voice_note_url && (
            <div className="bg-panel-card border border-panel-border rounded-lg p-4 flex items-center gap-3">
              <Mic size={18} className="text-brand-lime shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Voice Note</p>
                <audio src={ticket.voice_note_url} controls className="w-full h-8" />
              </div>
            </div>
          )}

          {/* Map Display */}
          <div className="bg-panel-card border border-panel-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-panel-border bg-panel-bg">
              <MapPin size={14} className="text-brand-lime" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Location</span>
            </div>
            <div className="h-48">
              <MapContainer
                center={[ticket.latitude, ticket.longitude]}
                zoom={15}
                className={`w-full h-full ${mapTileClassName}`}
                zoomControl={false}
                scrollWheelZoom={false}
                dragging={false}
              >
                <TileLayer
                  attribution={mapTileAttribution}
                  url={mapTileUrl}
                />
                <Marker position={[ticket.latitude, ticket.longitude]} icon={STATIC_MARKER} />
              </MapContainer>
            </div>
            <div className="px-4 py-2 text-[10px] font-mono text-gray-500 border-t border-panel-border">
              {ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-panel-card border border-panel-border rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 border-b border-panel-border/60 pb-2">Complaint Info</h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-500 block">Reported Coordinates</span>
                <span className="text-gray-200 mt-0.5 block flex items-center gap-1">
                  <MapPin size={12} className="text-brand-lime" />
                  {ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Date Filed</span>
                <span className="text-gray-200 mt-0.5 block flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">AI Priority Score</span>
                <span className="text-white mt-0.5 block font-semibold">Level {ticket.priority_score} / 3</span>
              </div>
              <div>
                <span className="text-gray-500 block">Pipeline Status</span>
                <span className="text-brand-lime mt-0.5 block font-semibold capitalize">{ticket.status.replace('_', ' ')}</span>
              </div>
              {ticket.expected_resolution_at && (
                <div className="col-span-2 border-t border-panel-border/60 pt-3 mt-1">
                  <span className="text-gray-500 block">Resolution Promise</span>
                  <span className="mt-0.5 block">
                    <SlaCountdown
                      expectedResolutionAt={ticket.expected_resolution_at}
                      status={ticket.status}
                      variant="full"
                    />
                  </span>
                </div>
              )}
            </div>

            {ticket.priority_reason && (
              <div className="bg-panel-bg p-3 border border-panel-border rounded text-[11px] text-gray-400">
                <span className="font-mono text-gray-500 block mb-1">Priority Assignment Reason</span>
                {ticket.priority_reason}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Timeline */}
        <div className="bg-panel-card border border-panel-border rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-2 text-brand-lime border-b border-panel-border/60 pb-3">
            <CheckCircle2 size={16} />
            <h3 className="font-serif italic font-bold text-sm">Resolution Timeline</h3>
          </div>

          <div className="relative space-y-8 border-l border-panel-border/80 pl-6">
            {stages.map((stage, i) => {
              // An "active" stage was previously also flagged completed, so it
              // rendered with a checkmark and identical styling — a citizen
              // could not tell "we are working on it now" from "this is done".
              const isDone = stage.completed && !stage.active;
              const isActive = stage.active;
              return (
                <div key={i} className="relative">
                  {/* Node circle indicators */}
                  <div
                    style={{ left: '-31px', top: '2px' }}
                    className={`absolute flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? 'animate-pulse border-brand-lime bg-panel-card'
                        : isDone
                          ? 'border-brand-lime bg-brand-lime'
                          : 'border-border-default bg-panel-card'
                    }`}
                  >
                    {isDone && <CheckCircle2 size={10} className="text-background" aria-hidden="true" />}
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-brand-lime" aria-hidden="true" />}
                  </div>

                  <div className="space-y-1">
                    <h4
                      className={`text-body-sm font-semibold ${
                        isActive ? 'text-brand-lime' : isDone ? 'text-foreground' : 'text-text-tertiary'
                      }`}
                    >
                      {stage.label}
                      {isActive && (
                        <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-brand-lime/80">
                          happening now
                        </span>
                      )}
                    </h4>
                    <p className="text-caption text-text-tertiary leading-normal">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {ticket.status === 'verified' && (
            <div className="bg-brand-soft border border-brand-lime/20 rounded p-4 text-[11px] text-brand-lime font-mono space-y-1">
              <span className="font-bold uppercase tracking-wider block text-[10px]">Verified Resolution details</span>
              <p className="leading-relaxed">{ticket.verification_reason || 'AI comparison verified successfully.'}</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
