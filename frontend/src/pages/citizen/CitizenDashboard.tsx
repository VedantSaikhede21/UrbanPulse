import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, User, AlertTriangle, Plus, Loader, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Ticket {
  id: string;
  category: string;
  severity: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  priority_score: number;
  created_at: string;
}

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/tickets')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load tickets');
        return res.json();
      })
      .then(data => {
        setTickets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const totalReports = tickets.length;
  const resolvedReports = tickets.filter(t => t.status === 'resolved' || t.status === 'verified').length;
  // Trust rating is displayed dynamically based on authenticated citizen reputation, defaults to 110 for demo Alice profile
  const userReputation = user ? 110 : 100;

  const severityColors: Record<string, string> = {
    high: 'text-red-400 bg-red-950/40 border-red-800/40',
    medium: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40',
    low: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
  };

  const statusColors: Record<string, string> = {
    reported: 'text-gray-400 bg-gray-900 border-gray-800',
    assigned: 'text-purple-400 bg-purple-950/40 border-purple-800/40',
    in_progress: 'text-orange-400 bg-orange-950/40 border-orange-800/40',
    resolved: 'text-brand-lime bg-brand-soft border-brand-lime/20',
    verified: 'text-brand-lime bg-brand-soft border-brand-lime/30',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 min-h-screen text-foreground relative font-sans">
      
      {/* Upper Welcome Banner */}
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-panel-card border border-panel-border p-6 rounded flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-gray-500 text-[10px] font-mono uppercase tracking-wider block">My Total Reports</span>
            <span className="text-3xl font-serif italic font-bold block">{totalReports}</span>
          </div>
          <div className="w-12 h-12 rounded bg-panel-bg flex items-center justify-center text-gray-400 border border-panel-border">
            <FileText size={20} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-panel-card border border-panel-border p-6 rounded flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-gray-500 text-[10px] font-mono uppercase tracking-wider block">Issues Resolved</span>
            <span className="text-3xl font-serif italic font-bold block">{resolvedReports}</span>
          </div>
          <div className="w-12 h-12 rounded bg-brand-soft flex items-center justify-center text-brand-lime border border-brand-lime/10">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-panel-card border border-panel-border p-6 rounded flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-gray-500 text-[10px] font-mono uppercase tracking-wider block">Reputation trust score</span>
            <span className="text-3xl font-serif italic font-bold text-brand-lime block">{userReputation} <span className="text-xs text-gray-500 font-mono">/ 200</span></span>
          </div>
          <div className="w-12 h-12 rounded bg-panel-bg flex items-center justify-center text-gray-400 border border-panel-border">
            <User size={20} />
          </div>
        </div>
      </div>

      {/* Ticket List Header */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif italic font-bold flex items-center gap-2">
          <span>Active & Historic Issues</span>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-panel-card border border-panel-border text-gray-400 font-normal">
            {totalReports} total
          </span>
        </h2>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-gray-400">
            <Loader className="animate-spin text-brand-lime" size={24} />
            <span className="text-xs font-mono">Connecting to live Supabase client...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="border border-dashed border-panel-border rounded-lg py-16 text-center max-w-md mx-auto px-6">
            <AlertTriangle className="mx-auto text-gray-600 mb-4" size={32} />
            <h3 className="font-serif italic font-bold text-base mb-1">No reports filed yet</h3>
            <p className="text-gray-500 text-xs mb-6">Your filed tickets will show up here. Report an issue to begin.</p>
            <Link
              to="/citizen/report"
              className="inline-flex items-center space-x-2 bg-brand-lime text-background hover:bg-brand-lime-hover font-semibold px-4 py-2 rounded text-xs"
            >
              <Plus size={14} />
              <span>Report Infrastructure Pothole</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map(ticket => (
              <Link
                key={ticket.id}
                to={`/citizen/report/${ticket.id}`}
                className="bg-panel-card border border-panel-border hover:border-brand-lime/20 rounded p-6 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-serif italic font-bold text-gray-100 group-hover:text-brand-lime transition-colors">
                      {ticket.category}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-full ${severityColors[ticket.severity] || severityColors.low}`}>
                        {ticket.severity}
                      </span>
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-full ${statusColors[ticket.status] || statusColors.reported}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                    {ticket.description || 'No description provided.'}
                  </p>
                </div>

                <div className="border-t border-panel-border/60 pt-4 mt-4 flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span>{ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Today'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for quick access */}
      <Link
        to="/citizen/report"
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-lime hover:bg-brand-lime-hover text-background rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 md:hidden z-40 border border-brand-lime/20"
      >
        <Plus size={24} />
      </Link>
      
    </div>
  );
};
