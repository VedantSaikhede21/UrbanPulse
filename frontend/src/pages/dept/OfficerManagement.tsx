import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, User, Shield, BadgeCheck, FileText, Users,
} from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { apiFetch } from '../../lib/api';
import type { Officer, Ticket } from '../../lib/types';

export const OfficerManagement: React.FC = () => {
  useDocumentTitle('Officer Management');
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch('/api/officers'),
      apiFetch('/api/tickets'),
    ])
      .then(async ([officerRes, ticketRes]) => {
        if (!officerRes.ok) throw new Error(`Officers API error (${officerRes.status})`);
        if (!ticketRes.ok) throw new Error(`Tickets API error (${ticketRes.status})`);
        return Promise.all([officerRes.json(), ticketRes.json()]);
      })
      .then(([officerData, ticketData]) => {
        setOfficers(officerData);
        setTickets(ticketData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load officer data');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const assignmentCount = (officerId: string): number =>
    tickets.filter(t => t.assigned_officer_id === officerId).length;

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-status-escalated/10 border border-status-escalated/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-status-escalated" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Failed to load officer data</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-5">{error}</p>
          <button type="button" onClick={loadData} className="px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen">
      <div className="border-b border-panel-border pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Officer Management</h1>
        <p className="text-gray-500 text-xs mt-1">
          Field officers, their departments, and live assignment counts.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-brand-lime/30 border-t-brand-lime animate-spin" />
        </div>
      ) : officers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No officers configured"
          message="Officers will appear here once an admin creates them."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {officers.map(officer => (
            <div
              key={officer.id}
              className="bg-panel-card border border-panel-border rounded-lg p-6 space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-lime/20 to-brand-lime/5 border border-brand-lime/20 flex items-center justify-center">
                  <User size={24} className="text-brand-lime" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold truncate">{officer.name}</h2>
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider mt-1 ${
                      officer.is_active
                        ? 'text-status-resolved bg-status-resolved/10 border border-status-resolved/30'
                        : 'text-status-escalated bg-status-escalated/10 border border-status-escalated/30'
                    }`}
                  >
                    <BadgeCheck size={12} />
                    {officer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 pt-2 border-t border-panel-border">
                <span className="flex items-center gap-2">
                  <Shield size={12} /> {officer.department}
                </span>
                <span className="flex items-center gap-2">
                  <FileText size={12} /> {assignmentCount(officer.id)} assignment{assignmentCount(officer.id) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
