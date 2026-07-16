import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader, MapPin, Calendar, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { apiFetch } from '../../lib/api';

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
  verification_status?: string;
  verification_reason?: string;
  created_at: string;
}

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/tickets/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load ticket');
        return res.json();
      })
      .then((data: Ticket) => {
        setTicket(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
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
        <AlertTriangle className="mx-auto mb-2 text-yellow-500" />
        <p className="text-sm">Ticket not found.</p>
        <Link to="/citizen/dashboard" className="text-brand-lime text-xs underline mt-2 block">Back to Dashboard</Link>
      </div>
    );
  }

  // Map ticket status to vertical timeline stages
  const getTimelineStages = (status: string) => {
    const isReported = ['reported', 'assigned', 'in_progress', 'resolved', 'verified'].includes(status);
    const isIngested = ['assigned', 'in_progress', 'resolved', 'verified'].includes(status);
    const isAssigned = ['assigned', 'in_progress', 'resolved', 'verified'].includes(status);
    const isInProgress = ['in_progress', 'resolved', 'verified'].includes(status);
    const isResolved = ['resolved', 'verified'].includes(status);
    const isVerified = ['verified'].includes(status);

    return [
      { label: 'Incident Reported', description: 'Complaint logged on system by Citizen.', completed: isReported, active: status === 'reported' },
      { label: 'Multi-Agent Triage', description: 'Pipeline classified, verified priority, and searched duplicates.', completed: isIngested, active: status === 'reported' && isIngested },
      { label: 'Officer Assigned', description: 'Routed to correct municipal ward team.', completed: isAssigned, active: status === 'assigned' },
      { label: 'Work In Progress', description: 'Field officer dispatched and repair ongoing.', completed: isInProgress, active: status === 'in_progress' },
      { label: 'Fix Submitted', description: 'Resolution submitted with closing photographic check.', completed: isResolved, active: status === 'resolved' },
      { label: 'Verification Complete', description: 'Multi-agent visual check confirmed clean resolution.', completed: isVerified, active: status === 'verified' },
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

      {/* Ticket Brief Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xl font-serif italic font-bold text-gray-100">{ticket.category}</span>
              <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-full ${ticket.severity === 'high' ? 'text-red-400 bg-red-950/40 border-red-800/40' : 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40'}`}>
                {ticket.severity} severity
              </span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed bg-panel-card border border-panel-border p-4 rounded-lg">
              {ticket.description}
            </p>
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

          <div className="relative pl-6 border-l border-panel-border/80 space-y-8">
            {stages.map((stage, i) => (
              <div key={i} className="relative">
                {/* Node circle indicators */}
                <div style={{ left: '-31px', top: '2px' }} className={`absolute w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${stage.completed ? 'bg-brand-lime border-brand-lime' : 'bg-panel-card border-panel-border'}`}>
                  {stage.completed && <CheckCircle2 size={10} className="text-background" />}
                </div>

                <div className="space-y-1">
                  <h4 className={`text-xs font-semibold ${stage.completed ? 'text-gray-100 font-bold' : 'text-gray-500'} ${stage.active ? 'text-brand-lime font-bold' : ''}`}>
                    {stage.label}
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-normal">{stage.description}</p>
                </div>
              </div>
            ))}
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
