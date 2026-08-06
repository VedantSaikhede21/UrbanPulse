import React, { useState } from 'react';

type BadgeVariant = 'status' | 'priority' | 'default';
type BadgeValue = 'new' | 'progress' | 'resolved' | 'verified' | 'escalated' | 'low' | 'medium' | 'high' | string;

interface BadgeProps {
  variant?: BadgeVariant;
  type?: BadgeVariant;
  value: BadgeValue;
  dot?: boolean;
  dismissable?: boolean;
  className?: string;
  onDismiss?: () => void;
}

const statusColorMap: Record<string, string> = {
  new: 'bg-status-new/10 text-status-new',
  progress: 'bg-status-progress/10 text-status-progress',
  in_progress: 'bg-status-progress/10 text-status-progress',
  'in progress': 'bg-status-progress/10 text-status-progress',
  resolved: 'bg-status-resolved/10 text-status-resolved',
  verified: 'bg-status-verified/10 text-status-verified',
  escalated: 'bg-status-escalated/10 text-status-escalated',
};

const priorityColorMap: Record<string, string> = {
  low: 'bg-priority-low/10 text-priority-low',
  medium: 'bg-priority-medium/10 text-priority-medium',
  high: 'bg-priority-high/10 text-priority-high',
};

export const Badge: React.FC<BadgeProps> = ({
  variant,
  type,
  value,
  dot = false,
  dismissable = false,
  className = '',
  onDismiss,
}) => {
  const resolvedVariant = variant ?? type ?? 'default';
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const baseStyles =
    'inline-flex items-center h-5 px-1.5 font-[11px] font-semibold uppercase tracking-[0.04em] rounded';

  const valLower = value.toLowerCase();

  let colorStyles = 'bg-panel-card text-gray-400';

  if (resolvedVariant === 'status') {
    colorStyles = statusColorMap[valLower] || 'bg-panel-card text-gray-400';
  } else if (resolvedVariant === 'priority') {
    colorStyles = priorityColorMap[valLower] || 'bg-panel-card text-gray-400';
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <span className={`${baseStyles} ${colorStyles} ${className}`}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${
            resolvedVariant === 'default' ? 'bg-gray-400' : 'bg-currentColor'
          }`}
        />
      )}
      {value}
      {dismissable && (
        <button
          type="button"
          onClick={handleDismiss}
          className="ml-1 hover:opacity-70"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </span>
  );
};
