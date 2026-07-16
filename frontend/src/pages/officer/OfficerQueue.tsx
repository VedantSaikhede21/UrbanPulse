import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Calendar, CheckCircle2, Loader, MapPin,
  PlayCircle, Upload, Wrench,
} from 'lucide-react';
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
  original_media_url?: string;
  created_at: string;
}

export const OfficerQueue: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [closureUrl, setClosureUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadQueue = () => {
    setLoading(true);
    apiFetch('/api/officers/queue')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load queue');
        return res.json();
      })
      .then(data => {
        setTickets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load officer queue. Is the backend running?');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadQueue();
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
      setClosureUrl('');
      setResolvingId(null);
      loadQueue();
    } catch {
      setError('Resolution submission failed.');
      setResolvingId(null);
    }
  };

  const severityColors: Record<string, string> = {
    high: 'text-red-400 bg-red-950/40 border-red-800/40',
    medium: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40',
    low: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
  };

  const priorityLabel = (score: number) => (score >= 3 ? 'P1 Critical' : score >= 2 ? 'P2 Medium' : 'P3 Low');

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-gray-400">
        <Loader className="animate-spin text-brand-lime" size={24} />
        <span className="text-xs font-mono">Loading assigned work queue...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen">
      <div className="border-b border-panel-border pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Field Officer Work Queue</h1>
        <p className="text-gray-500 text-xs mt-1">
          Prioritized stack of assigned tickets — dispatch, resolve, and trigger verification.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-800/40 text-red-300 text-sm px-4 py-3 rounded">
          {error}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <CheckCircle2 className="mx-auto mb-3 text-brand-lime" size={32} />
          <p className="text-sm">No open tickets in your queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className="bg-panel-card border border-panel-border rounded-lg p-5 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">#{ticket.id.slice(0, 8)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${severityColors[ticket.severity] || severityColors.medium}`}>
                      {ticket.severity}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded border text-purple-400 bg-purple-950/40 border-purple-800/40">
                      {priorityLabel(ticket.priority_score)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded border text-gray-400 bg-gray-900 border-gray-800 capitalize">
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{ticket.category}</h3>
                  <p className="text-sm text-gray-400">{ticket.description}</p>
                  {ticket.priority_reason && (
                    <p className="text-xs text-gray-500 italic">{ticket.priority_reason}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
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
                    src={ticket.original_media_url}
                    alt="Issue"
                    className="w-24 h-24 object-cover rounded border border-panel-border"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-panel-border">
                {ticket.status === 'assigned' && (
                  <button
                    onClick={() => handleStartWork(ticket.id)}
                    className="inline-flex items-center gap-1.5 text-xs bg-orange-950/40 text-orange-300 border border-orange-800/40 px-3 py-1.5 rounded hover:bg-orange-950/60"
                  >
                    <Wrench size={14} /> Start Work
                  </button>
                )}
                <Link
                  to={`/shared/trace/${ticket.id}`}
                  className="inline-flex items-center gap-1.5 text-xs bg-panel-card text-brand-lime border border-brand-lime/30 px-3 py-1.5 rounded hover:bg-brand-soft"
                >
                  <PlayCircle size={14} /> Agent Trace
                </Link>
                <Link
                  to={`/citizen/reports/${ticket.id}`}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 border border-panel-border px-3 py-1.5 rounded hover:text-foreground"
                >
                  View Details
                </Link>
              </div>

              {(ticket.status === 'assigned' || ticket.status === 'in_progress') && (
                <div className="bg-background/50 border border-panel-border rounded p-4 space-y-3">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Submit Resolution</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="Closure photo URL (after repair)"
                      value={resolvingId === ticket.id ? closureUrl : ''}
                      onFocus={() => setResolvingId(ticket.id)}
                      onChange={e => {
                        setResolvingId(ticket.id);
                        setClosureUrl(e.target.value);
                      }}
                      className="flex-1 bg-background border border-panel-border rounded px-3 py-2 text-sm text-foreground placeholder:text-gray-600"
                    />
                    <button
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
                            setClosureUrl('');
                            setResolvingId(null);
                            loadQueue();
                          })
                          .catch(() => {
                            setError('Resolution submission failed.');
                            setResolvingId(null);
                          });
                      }}
                      className="inline-flex items-center justify-center gap-1.5 text-xs bg-brand-lime text-background font-semibold px-4 py-2 rounded hover:bg-brand-lime-hover disabled:opacity-50"
                    >
                      <Upload size={14} />
                      Use Sample & Resolve
                    </button>
                    <button
                      onClick={() => handleResolve(ticket.id)}
                      disabled={resolvingId === ticket.id && !closureUrl}
                      className="inline-flex items-center justify-center gap-1.5 text-xs border border-panel-border text-gray-300 px-4 py-2 rounded hover:text-foreground disabled:opacity-50"
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

      <div className="text-xs text-gray-600 flex items-center gap-1">
        <AlertTriangle size={12} />
        Queue sorted by priority score (highest first).
      </div>
    </div>
  );
};
