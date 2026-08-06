import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, FileText, TrendingUp, MapPin, Calendar, Target } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { apiFetch } from '../../lib/api';

interface Ticket {
  id: string;
  category: string;
  status: string;
  priority_score: number;
  created_at: string;
}

export const Profile: React.FC = () => {
  useDocumentTitle('My Profile');
  const breadcrumbs = useBreadcrumbs();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/tickets')
      .then(res => res.json())
      .then(data => { if (!cancelled) { setTickets(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'verified').length;
  const trustScore = Math.min(100, 50 + resolvedCount * 10);
  const level = trustScore >= 80 ? 'Trusted' : trustScore >= 50 ? 'Verified' : 'New';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 min-h-screen text-foreground font-sans">
      <Breadcrumbs items={breadcrumbs} />
      <div className="border-b border-border-default pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Citizen Profile</h1>
        <p className="text-text-tertiary text-xs mt-1">Your reputation, activity, and trust score across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-panel-card border border-border-default rounded-lg p-6 card-glow"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-lime/20 to-brand-lime/5 border border-brand-lime/20 flex items-center justify-center">
              <Shield size={22} className="text-brand-lime" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Trust Score</p>
              <p className="text-2xl font-bold font-serif italic text-brand-lime">{loading ? '...' : trustScore}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award size={14} className="text-text-tertiary" />
            <span className="text-xs text-text-tertiary">Level: {loading ? '...' : level}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="bg-panel-card border border-border-default rounded-lg p-6 card-glow"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-950/40 border border-blue-800/30 flex items-center justify-center">
              <FileText size={22} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Total Reports</p>
              <p className="text-2xl font-bold font-serif italic">{loading ? '...' : tickets.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-text-tertiary" />
            <span className="text-xs text-text-tertiary">{resolvedCount} resolved</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="bg-panel-card border border-border-default rounded-lg p-6 card-glow"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-950/40 border border-amber-800/30 flex items-center justify-center">
              <Target size={22} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Credibility</p>
              <p className="text-2xl font-bold font-serif italic">
                {loading ? '...' : `${tickets.length > 0 ? Math.round((resolvedCount / tickets.length) * 100) : 0}%`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award size={14} className="text-text-tertiary" />
            <span className="text-xs text-text-tertiary">Resolution rate</span>
          </div>
        </motion.div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-serif italic font-bold">Recent Activity</h2>
        {loading ? (
          <div role="status" aria-live="polite" className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 shimmer rounded-lg" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-panel-card border border-border-default rounded-lg" role="status" aria-label="No activity yet">
            <div className="w-14 h-14 rounded-full bg-surface-raised border border-border-default flex items-center justify-center mb-4">
              <FileText size={24} className="text-text-tertiary" />
            </div>
            <h3 className="text-base font-semibold mb-1.5">No activity yet</h3>
            <p className="text-sm text-text-tertiary max-w-xs">Reports you file will appear here with status updates.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between bg-panel-card border border-border-default rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-border-default/30">
                    <MapPin size={14} className="text-text-tertiary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{ticket.category}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Calendar size={10} className="text-text-tertiary" />
                      <span className="text-[10px] text-text-tertiary">{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Recently'}</span>
                    </div>
                  </div>
                </div>
                <Badge type="status" value={ticket.status === 'in_progress' ? 'in progress' : ticket.status} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
