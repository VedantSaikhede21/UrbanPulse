import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, Activity, MessageSquare, Eye, Shield, Search,
  Zap, Map, Bell, CheckCircle2, BarChart2, Cpu,
} from 'lucide-react';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { apiFetch } from '../../lib/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import type { LucideIcon } from 'lucide-react';

interface AgentInfo {
  name: string;
  icon: LucideIcon;
  description: string;
}

interface AgentMetric {
  name: string;
  node: string;
  invocations: number;
  avg_latency_ms: number | null;
  last_active: string | null;
  online: boolean;
}

interface MetricsResponse {
  window_minutes: number;
  total_invocations: number;
  online_count: number;
  agent_count: number;
  agents: AgentMetric[];
}

interface CityPulseData {
  wards: { name: string; uhs_score: number }[];
  critical_wards: number;
  trending_categories: { category: string; count: number }[];
  pulse_alerts: string[];
}

const AGENT_META: Record<string, { icon: LucideIcon; description: string }> = {
  'CX Agent': { icon: MessageSquare, description: 'Handles citizen communication and feedback processing' },
  'Vision Agent': { icon: Eye, description: 'Analyzes uploaded images for damage assessment' },
  'Trust & Fraud Agent': { icon: Shield, description: 'Detects fraudulent activity and verifies report authenticity' },
  'Deduplication Agent': { icon: Search, description: 'Identifies and merges duplicate ticket submissions' },
  'Priority Agent': { icon: Zap, description: 'Assigns priority scores based on severity and urgency' },
  'Routing Agent': { icon: Map, description: 'Routes tickets to the correct department' },
  'Escalation Agent': { icon: Bell, description: 'Monitors SLA breaches and escalates overdue tickets' },
  'Verification Agent': { icon: CheckCircle2, description: 'Verifies resolved tickets and validates closure evidence' },
  'Analytics Agent': { icon: BarChart2, description: 'Generates city pulse digests and trend analysis' },
};

function formatRelative(iso: string | null): string {
  if (!iso) return 'never';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const delta = Math.max(0, Math.floor((now - then) / 1000));
  if (delta < 60) return `${delta}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

export const AgentMonitoring: React.FC = () => {
  useDocumentTitle('Agent Monitoring');
  const breadcrumbs = useBreadcrumbs();
  const [pulse, setPulse] = useState<CityPulseData | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch('/api/analytics/city-pulse').then(async res => {
        if (!res.ok) throw new Error(`API error (${res.status})`);
        return res.json() as Promise<CityPulseData>;
      }),
      apiFetch('/api/agents/metrics').then(async res => {
        if (!res.ok) throw new Error(`API error (${res.status})`);
        return res.json() as Promise<MetricsResponse>;
      }),
    ])
      .then(([p, m]) => {
        setPulse(p);
        setMetrics(m);
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
        <div role="alert" className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Failed to load agent data</h3>
          <p className="text-sm text-secondary max-w-xs mb-5">{error}</p>
          <button type="button" aria-label="Retry loading agent data" onClick={loadData} className="focus-ring px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const onlineCount = metrics?.online_count ?? 0;
  const totalAgents = metrics?.agent_count ?? 9;
  const totalInvocations = metrics?.total_invocations ?? 0;
  const windowMinutes = metrics?.window_minutes ?? 1440;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen">

      <div className="border-b border-panel-border pb-6">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="text-2xl font-serif italic font-bold">AI Agent Monitoring Console</h1>
        <p className="text-tertiary text-xs mt-1">
          Real-time status of the {totalAgents} AI agents powering the UrbanPulse pipeline.
        </p>
      </div>

      {loading ? (
        <div role="status" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* System status bar */}
          <div className="bg-panel-card border border-panel-border rounded-xl p-5 flex items-center justify-between card-glow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand-lime border border-brand-lime/10">
                <Cpu size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">System Status</p>
                <p className="text-xs text-tertiary">
                  {onlineCount === totalAgents
                    ? `All ${totalAgents} agents operational`
                    : `${onlineCount}/${totalAgents} agents online in last ${windowMinutes < 60 ? `${windowMinutes}m` : `${Math.round(windowMinutes / 60)}h`}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-tertiary">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${onlineCount === totalAgents ? 'bg-green-400' : 'bg-yellow-400'} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${onlineCount === totalAgents ? 'bg-green-500' : 'bg-yellow-500'}`} />
                </span>
                <span className="font-mono">{onlineCount}/{totalAgents} agents online</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-tertiary border-l border-panel-border pl-4">
                <Activity size={14} className="text-brand-lime" />
                <span className="font-mono">{totalInvocations.toLocaleString()} invocations</span>
              </div>
              {pulse && (
                <div className="flex items-center gap-2 text-xs text-tertiary border-l border-panel-border pl-4">
                  <Activity size={14} className="text-brand-lime" />
                  <span className="font-mono">{pulse.critical_wards} critical wards</span>
                </div>
              )}
            </div>
          </div>

          {/* Agent grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(metrics?.agents ?? []).map(agent => {
              const meta = AGENT_META[agent.name] ?? { icon: Cpu, description: '' };
              const Icon = meta.icon;
              return (
                <div key={agent.name} className="bg-panel-card border border-panel-border rounded-xl p-5 space-y-4 card-glow hover:border-brand-lime/15 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-soft border border-brand-lime/10 flex items-center justify-center text-brand-lime shrink-0">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">{agent.name}</h3>
                      <p className="text-xs text-tertiary mt-0.5 leading-relaxed">{meta.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-tertiary">
                    <div>
                      <span className="block uppercase tracking-wider text-[9px]">Invocations</span>
                      <span className="text-sm text-foreground">{agent.invocations.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block uppercase tracking-wider text-[9px]">Avg latency</span>
                      <span className="text-sm text-foreground">
                        {agent.avg_latency_ms != null ? `${Math.round(agent.avg_latency_ms)}ms` : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-panel-border/60">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        {agent.online && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${agent.online ? 'bg-green-500' : 'bg-gray-600'}`} />
                      </span>
                      <span className={`text-[10px] font-mono uppercase tracking-wider ${agent.online ? 'text-green-400' : 'text-tertiary'}`}>
                        {agent.online ? 'Online' : 'Idle'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-tertiary">{formatRelative(agent.last_active)}</span>
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
                  <span className="text-tertiary block font-mono text-[10px] uppercase tracking-wider mb-1">Total Wards</span>
                  <span className="text-lg font-serif italic font-bold">{pulse.wards.length}</span>
                </div>
                <div className="bg-panel-bg border border-panel-border rounded p-3">
                  <span className="text-tertiary block font-mono text-[10px] uppercase tracking-wider mb-1">Critical Wards</span>
                  <span className={`text-lg font-serif italic font-bold ${pulse.critical_wards > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {pulse.critical_wards}
                  </span>
                </div>
                <div className="bg-panel-bg border border-panel-border rounded p-3">
                  <span className="text-tertiary block font-mono text-[10px] uppercase tracking-wider mb-1">Trending Issues</span>
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
