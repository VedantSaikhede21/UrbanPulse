import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, GitBranch, Route, Navigation, Droplets, Trash2,
  Lightbulb, VolumeX, PaintBucket, Trees,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import type { LucideIcon } from 'lucide-react';

interface RoutingRule {
  category: string;
  department: string;
  priority: string;
  description: string;
  icon: LucideIcon;
}

const ROUTING_RULES: RoutingRule[] = [
  { category: 'Roads & Potholes', department: 'Roads Dept', priority: 'medium', description: 'Pothole reports, road damage, sidewalk cracks', icon: Navigation },
  { category: 'Water Leak', department: 'Water Dept', priority: 'high', description: 'Burst pipes, leaking hydrants, water main breaks', icon: Droplets },
  { category: 'Garbage & Sanitation', department: 'Sanitation Dept', priority: 'medium', description: 'Missed pickup, illegal dumping, bin requests', icon: Trash2 },
  { category: 'Streetlight & Electrical', department: 'Electrical Dept', priority: 'medium', description: 'Broken streetlights, exposed wiring, pole damage', icon: Lightbulb },
  { category: 'Signage & Hazards', department: 'Roads Dept', priority: 'high', description: 'Missing signs, fallen trees, road obstructions', icon: AlertTriangle },
  { category: 'Noise Complaint', department: 'Police Dept', priority: 'low', description: 'Excessive noise, construction hours, parties', icon: VolumeX },
  { category: 'Graffiti & Vandalism', department: 'Sanitation Dept', priority: 'low', description: 'Graffiti removal, property defacement', icon: PaintBucket },
  { category: 'Parks & Recreation', department: 'Parks Dept', priority: 'low', description: 'Playground damage, overgrown trails, bench repair', icon: Trees },
];

export const RoutingConfig: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-800/30 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Failed to load routing config</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-5">{error}</p>
          <button type="button" className="px-4 py-2 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen">

      <div className="border-b border-panel-border pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Department Routing Rules</h1>
        <p className="text-gray-500 text-xs mt-1">
          Category-to-department mapping rules. Changes require backend deployment.
          <span className="ml-3 inline-block px-1.5 py-0.5 rounded bg-yellow-900/30 text-yellow-400 text-[9px] font-mono border border-yellow-700/30">Demo Configuration</span>
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Categories</span>
                <span className="text-2xl font-serif italic font-bold block">{ROUTING_RULES.length}</span>
              </div>
              <div className="w-10 h-10 rounded bg-panel-bg flex items-center justify-center text-gray-400 border border-panel-border">
                <GitBranch size={18} />
              </div>
            </div>
            <div className="bg-panel-card border border-panel-border p-5 rounded flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Departments</span>
                <span className="text-2xl font-serif italic font-bold block">{new Set(ROUTING_RULES.map(r => r.department)).size}</span>
              </div>
              <div className="w-10 h-10 rounded bg-panel-bg flex items-center justify-center text-gray-400 border border-panel-border">
                <Route size={18} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROUTING_RULES.map(rule => {
              const Icon = rule.icon;
              return (
                <div key={rule.category} className="bg-panel-card border border-panel-border rounded-lg p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-panel-bg border border-panel-border flex items-center justify-center text-gray-400 shrink-0">
                        <Icon size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{rule.category}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{rule.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs pt-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 border rounded-full bg-brand-soft text-brand-lime border-brand-lime/20">
                      {rule.department}
                    </span>
                    <Badge type="priority" value={rule.priority} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
