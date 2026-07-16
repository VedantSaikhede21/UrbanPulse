import React from 'react';

type BadgeType = 'status' | 'priority' | 'default';
type BadgeValue = 'new' | 'progress' | 'resolved' | 'verified' | 'escalated' | 'low' | 'medium' | 'high' | string;

interface BadgeProps {
  type?: BadgeType;
  value: BadgeValue;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  type = 'default',
  value,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold tracking-wider uppercase border';

  const valLower = value.toLowerCase();

  let styles = 'bg-panel-bg text-foreground border-panel-border';

  if (type === 'status') {
    if (valLower === 'new') {
      styles = 'bg-status-new/10 text-status-new border-status-new/30';
    } else if (valLower === 'progress' || valLower === 'in progress' || valLower === 'in_progress') {
      styles = 'bg-status-progress/10 text-status-progress border-status-progress/30';
    } else if (valLower === 'resolved') {
      styles = 'bg-status-resolved/10 text-status-resolved border-status-resolved/30';
    } else if (valLower === 'verified') {
      styles = 'bg-status-verified/10 text-status-verified border-status-verified/30';
    } else if (valLower === 'escalated') {
      styles = 'bg-status-escalated/10 text-status-escalated border-status-escalated/30';
    }
  } else if (type === 'priority') {
    if (valLower === 'low') {
      styles = 'bg-priority-low/10 text-priority-low border-priority-low/30';
    } else if (valLower === 'medium') {
      styles = 'bg-priority-medium/10 text-priority-medium border-priority-medium/30';
    } else if (valLower === 'high') {
      styles = 'bg-priority-high/10 text-priority-high border-priority-high/30';
    }
  }

  return (
    <span className={`${baseStyles} ${styles} ${className}`}>
      {value}
    </span>
  );
};
