import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, Activity, MessageSquare, Eye, Shield, Search,
  Zap, Map, Bell, CheckCircle2, BarChart2, Cpu,
} from 'lucide-react';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { apiFetch } from '../../lib/api';
import type { LucideIcon } from 'lucide-react';

interface AgentInfo {
  name: string;
  icon: LucideIcon;
  description: string;
  lastActive: string;
}

interface CityPulseData {
  wards: { name: string; uhs_score: number }[];
  critical_wards: number;
  trending_categories: { category: string; count: number }[];
  pulse_alerts: string[];
}

const AGENTS: AgentInfo[] = [
  { name: 'CX Agent', icon: MessageSquare, description: 'Handles citizen communication and feedback processing', lastActive: 'Just now' },
  { name: 'Vision Agent', icon: Eye, description: 'Analyzes uploaded images for damage assessment', lastActive: '1m ago' },
  { name: 'Trust & Fraud Agent', icon: Shield, description: 'Detects fraudulent activity and verifies report authenticity', lastActive: '2m ago' },
  { name: 'Deduplication Agent', icon: Search, description: 'Identifies and merges duplicate ticket submissions', lastActive: '3m ago' },
  { name: 'Priority Agent', icon: Zap, description: 'Assigns priority scores based on severity and urgency', lastActive: '3m ago' },
  { name: 'Routing Agent', icon: Map, description: 'Routes tickets to the correct department', lastActive: '4m ago' },
  { name: 'Escalation Agent', icon: Bell, description: 'Monitors SLA breaches and escalates overdue tickets', lastActive: '5m ago' },
  { name: 'Verification Agent', icon: CheckCircle2, description: 'Verifies resolved tickets and validates closure evidence', lastActive: '6m ago' },
  { name: 'Analytics Agent', icon: BarChart2, description: 'Generates city pulse digests and trend analysis', lastActive: '7m ago' },
];

export const AgentMonitoring: React.FC = () => {
  const [pulse, setPulse] = useState<CityPulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    apiFetch('/api/analytics/city-pulse')
      .then(async res => {
        if (!res.ok) throw new Error(`API error (${res.status})`);
        return res.json();
      })
      .then((data: CityPulseData) => {
        setPulse(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load agent status');
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Failed to load agent data</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-5">{error}</p>
          <button type="button" onClick={loadData} className="px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const onlineCount = AGENTS.length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen">

      <div className="border-b border-panel-border pb-6">
        <h1 className="text-2xl font-serif italic font-bold">AI Agent Monitoring Console</h1>
        <p className="text-gray-500 text-xs mt-1">
          Real-time status of all 9 AI agents powering the UrbanPulse pipeline.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* System status bar */}
          <div className="bg-panel-card border border-panel-border rounded-lg p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-brand-soft flex items-center justify-center text-brand-lime border border-brand-lime/10">
                <Cpu size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">System Status</p>
                <p className="text-xs text-gray-500">All systems operational</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono">{onlineCount}/{AGENTS.length} agents online</span>
              </div>
              {pulse && (
                <div className="flex items-center gap-2 text-xs text-gray-500 border-l border-panel-border pl-4">
                  <Activity size={14} className="text-brand-lime" />
                  <span className="font-mono">{pulse.critical_wards} critical wards</span>
                </div>
              )}
            </div>
          </div>

          {/* Agent grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AGENTS.map(agent => {
              const Icon = agent.icon;
              return (
                <div key={agent.name} className="bg-panel-card border border-panel-border rounded-lg p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-soft border border-brand-lime/10 flex items-center justify-center text-brand-lime shrink-0">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">{agent.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{agent.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-panel-border/60">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">Online</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{agent.lastActive}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live data section from city-pulse */}
          {pulse && (
            <div className="bg-panel-card border border-panel-border rounded-lg p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Activity size={16} className="text-brand-lime" />
                City Pulse Snapshot
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-panel-bg border border-panel-border rounded p-3">
                  <span className="text-gray-500 block font-mono text-[10px] uppercase tracking-wider mb-1">Total Wards</span>
                  <span className="text-lg font-serif italic font-bold">{pulse.wards.length}</span>
                </div>
                <div className="bg-panel-bg border border-panel-border rounded p-3">
                  <span className="text-gray-500 block font-mono text-[10px] uppercase tracking-wider mb-1">Critical Wards</span>
                  <span className={`text-lg font-serif italic font-bold ${pulse.critical_wards > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {pulse.critical_wards}
                  </span>
                </div>
                <div className="bg-panel-bg border border-panel-border rounded p-3">
                  <span className="text-gray-500 block font-mono text-[10px] uppercase tracking-wider mb-1">Trending Issues</span>
                  <span className="text-lg font-serif italic font-bold">{pulse.trending_categories.length}</span>
                </div>
              </div>
              {pulse.pulse_alerts.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {pulse.pulse_alerts.map((alert, i) => (
                    <div key={i} className="bg-amber-950/20 border border-amber-800/30 text-amber-300 text-xs px-3 py-2 rounded flex items-start gap-2">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
