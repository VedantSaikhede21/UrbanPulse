import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, TrendingUp, MapPin } from 'lucide-react';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { apiFetch } from '../../lib/api';
import type { Ward, CityPulse } from '../../lib/types';



function uhsColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

function uhsLabel(score: number): string {
  if (score >= 80) return 'Healthy';
  if (score >= 60) return 'Moderate';
  return 'Critical';
}

function uhsTextColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function avgUhs(wards: Ward[]): number {
  if (!wards.length) return 0;
  return wards.reduce((s, w) => s + w.uhs_score, 0) / wards.length;
}

export const WardHealth: React.FC = () => {
  useDocumentTitle('Ward Health');
  const breadcrumbs = useBreadcrumbs();
  const [wards, setWards] = useState<Ward[]>([]);
  const [pulse, setPulse] = useState<CityPulse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch('/api/analytics/wards'),
      apiFetch('/api/analytics/city-pulse'),
    ])
      .then(async ([wardsRes, pulseRes]) => {
        if (!wardsRes.ok) throw new Error(`Wards API error (${wardsRes.status})`);
        if (!pulseRes.ok) throw new Error(`City pulse API error (${pulseRes.status})`);
        return Promise.all([wardsRes.json(), pulseRes.json()]);
      })
      .then(([wardsData, pulseData]) => {
        setWards(wardsData);
        setPulse(pulseData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load ward data');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load ward data"
          message={error}
          action={{ label: 'Retry', onClick: loadData }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 min-h-screen">
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="border-b border-border-default pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Ward Health View</h1>
        <p className="text-text-tertiary text-xs mt-1">
          Urban Health Score (UHS) by ward — infrastructure quality, resolution efficiency, and live pulse alerts.
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div role="status" aria-live="polite" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* City Summary */}
          {pulse && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-card border border-border-default p-6 rounded flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-text-tertiary text-[10px] font-mono uppercase tracking-wider block">City Avg UHS</span>
                  <span className="text-3xl font-serif italic font-bold block">{avgUhs(wards).toFixed(1)}</span>
                </div>
                <div className="w-12 h-12 rounded bg-brand-soft flex items-center justify-center text-brand-lime border border-brand-lime/10">
                  <Activity size={20} />
                </div>
              </div>
              <div className="bg-surface-card border border-border-default p-6 rounded flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-text-tertiary text-[10px] font-mono uppercase tracking-wider block">Wards Monitored</span>
                  <span className="text-3xl font-serif italic font-bold block">{wards.length}</span>
                </div>
                <div className="w-12 h-12 rounded bg-surface-raised flex items-center justify-center text-text-secondary border border-border-default">
                  <MapPin size={20} />
                </div>
              </div>
              <div className="bg-surface-card border border-border-default p-6 rounded flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-text-tertiary text-[10px] font-mono uppercase tracking-wider block">Critical Wards</span>
                  <span className={`text-3xl font-serif italic font-bold block ${pulse.critical_wards > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {pulse.critical_wards}
                  </span>
                </div>
                <div className="w-12 h-12 rounded bg-surface-raised flex items-center justify-center text-text-secondary border border-border-default">
                  <AlertTriangle size={20} />
                </div>
              </div>
            </div>
          )}

          {/* Ward Cards */}
          <div className="space-y-4">
            <h2 className="text-lg font-serif italic font-bold">Ward Scores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wards.map(ward => (
                <div
                  key={ward.id}
                  className="bg-surface-card border border-border-default rounded-lg p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{ward.name}</h3>
                      <p className="text-[10px] font-mono text-text-tertiary mt-0.5">Ward #{ward.id}</p>
                    </div>
                    <Badge
                      type="priority"
                      value={uhsLabel(ward.uhs_score).toLowerCase()}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-end justify-between">
                      <span className={`text-2xl font-bold font-serif italic ${uhsTextColor(ward.uhs_score)}`}>
                        {ward.uhs_score.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-mono text-text-tertiary">/ 100</span>
                    </div>
                    <div className="h-2 bg-border-default rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${uhsColor(ward.uhs_score)}`}
                        style={{ width: `${ward.uhs_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Categories */}
          {pulse && pulse.trending_categories.length > 0 && (
            <div className="bg-surface-card border border-border-default rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-lime" />
                <h3 className="text-sm font-semibold">Trending Issues City-Wide</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {pulse.trending_categories.map(c => (
                  <div
                    key={c.category}
                    className="bg-surface-raised border border-border-default rounded px-3 py-1.5 text-xs flex items-center gap-2"
                  >
                    <span className="text-foreground">{c.category}</span>
                    <span className="text-brand-lime font-mono font-bold">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pulse Alerts */}
          {pulse && pulse.pulse_alerts.length > 0 && (
            <div className="space-y-2">
              {pulse.pulse_alerts.map((alert, i) => (
                <div
                  key={i}
                  className="bg-amber-950/20 border border-amber-800/30 text-amber-300 text-xs px-4 py-3 rounded flex items-start gap-2"
                >
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
