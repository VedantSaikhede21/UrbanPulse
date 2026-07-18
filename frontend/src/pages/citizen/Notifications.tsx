import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { apiFetch } from '../../lib/api';

interface Notification {
  id: string;
  ticket_id: string;
  category: string;
  status: string;
  message: string;
  timestamp: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const Notifications: React.FC = () => {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/notifications')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load notifications (${res.status})`);
        return res.json();
      })
      .then(data => { if (!cancelled) { setItems(data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message || 'Could not load notifications'); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState icon={AlertCircle} title="Couldn't load notifications" message={error} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-6">
        <EmptyState icon={Bell} title="No notifications yet" message="You'll see updates here as your reports move through triage and resolution." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3 max-w-2xl">
      <h1 className="font-display text-2xl mb-4">Notifications</h1>
      {items.map(n => {
        return (
          <Link
            key={n.id}
            to={`/citizen/reports/${n.ticket_id}`}
            className="block rounded-card border border-border bg-surface p-4 hover:border-border-strong transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <Badge type="default" value={n.category || 'General'} />
              <span className="text-xs text-muted">{timeAgo(n.timestamp)}</span>
            </div>
            <p className="text-sm">{n.message}</p>
          </Link>
        );
      })}
    </div>
  );
};