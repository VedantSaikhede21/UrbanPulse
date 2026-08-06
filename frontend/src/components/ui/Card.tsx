import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, glow = false }) => {
  return (
    <div
      onClick={onClick}
      className={`relative bg-panel-card border border-panel-border rounded-lg p-5 transition-all duration-300 ${
        glow ? 'card-glow' : ''
      } ${
        onClick
          ? 'cursor-pointer hover:border-brand-lime/30 hover:bg-panel-hover hover:-translate-y-0.5'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative bg-panel-card border border-panel-border rounded-lg p-5 transition-all duration-300 cursor-pointer hover:border-brand-lime/30 hover:-translate-y-0.5 ${
        onClick ? '' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const MetricCard: React.FC<{
  children: React.ReactNode;
  label: string;
  icon: React.ReactNode;
  accent?: boolean;
  className?: string;
}> = ({ children, label, icon, accent = false, className = '' }) => {
  return (
    <div
      className={`relative bg-panel-card border border-panel-border rounded-lg p-5 overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-gray-500 text-[10px] font-mono uppercase tracking-wider block">
            {label}
          </span>
          <div className="text-3xl font-serif italic font-bold">{children}</div>
        </div>
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
            accent
              ? 'bg-brand-soft text-brand-lime border border-brand-lime/10'
              : 'bg-panel-bg text-gray-400 border border-panel-border'
          }`}
        >
          {icon}
        </div>
      </div>
      {accent && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-lime/5 rounded-full blur-2xl pointer-events-none" />
      )}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`flex items-center justify-between mb-4 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <h3 className={`text-sm font-semibold text-foreground ${className}`}>{children}</h3>;
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <p className={`text-xs text-gray-500 mt-1 ${className}`}>{children}</p>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={className}>{children}</div>;
};
