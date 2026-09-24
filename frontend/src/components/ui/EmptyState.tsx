import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  message,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="w-14 h-14 rounded-full bg-panel-card border border-panel-border flex items-center justify-center mb-4">
        <Icon size={24} className="text-gray-500" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs mb-5 leading-relaxed">{message}</p>
      {action && (
        <Button
          type="button"
          onClick={action.onClick}
          variant={action.variant ?? 'primary'}
          size="sm"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};
