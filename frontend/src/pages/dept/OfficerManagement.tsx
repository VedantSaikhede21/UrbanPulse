import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, User, Shield, BadgeCheck, FileText,
  Loader, Users,
} from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { apiFetch } from '../../lib/api';

interface Ticket {
  id: string;
  category: string;
  status: string;
}

interface Officer {
  id: string;
  name: string;
  department: string;
  status: string;
  assignments: number;
}

const OFFICERS: Omit<Officer, 'assignments'>[] = [
  { id: '1', name: 'Dave Kumar', department: 'Roads & Potholes', status: 'Active' },
  { id: '2', name: 'Elisa Roy', department: 'Water Leak', status: 'Active' },
  { id: '3', name: "Frank D'Souza", department: 'Garbage & Sanitation', status: 'Active' },
  { id: '4', name: 'Grace Murthy', department: 'Streetlight & Electrical', status: 'Active' },
];

const DEPT_TO_CATEGORY: Record<string, string[]> = {
  'Roads & Potholes': ['Roads & Potholes', 'Roads', 'Potholes'],
  'Water Leak': ['Water Leak', 'Water'],
  'Garbage & Sanitation': ['Garbage & Sanitation', 'Garbage', 'Sanitation'],
  'Streetlight & Electrical': ['Streetlight & Electrical', 'Streetlight', 'Electrical'],
};

export const OfficerManagement: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    apiFetch('/api/tickets')
      .then(res => {
        if (!res.ok) throw new Error(`API error (${res.status})`);
        return res.json();
      })
      .then(data => {
        setTickets(data);
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

  const officers: Officer[] = OFFICERS.map(o => ({
    ...o,
    assignments: tickets.filter(t =>
      DEPT_TO_CATEGORY[o.department]?.includes(t.category)
    ).length,
  }));

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
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
          View field officers, their departments, and current assignment counts.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader size={32} className="text-brand-lime animate-spin" />
        </div>
      ) : officers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No officers configured"
          message="Officer assignments will appear here once configured."
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
                  <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-950/30 border border-green-800/30 px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider mt-1">
                    <BadgeCheck size={12} />
                    {officer.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 pt-2 border-t border-panel-border">
                <span className="flex items-center gap-2">
                  <Shield size={12} /> {officer.department}
                </span>
                <span className="flex items-center gap-2">
                  <FileText size={12} /> {officer.assignments} assignment{officer.assignments !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
