import React from 'react';

interface SkeletonProps {
  className?: string;
}

const SkeletonBase: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse bg-panel-card rounded ${className}`}
  />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`} role="status" aria-label="Loading content">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBase
        key={i}
        className={`h-3 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
    <span className="sr-only">Loading...</span>
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`bg-panel-card border border-panel-border rounded-lg p-5 space-y-4 ${className}`}
    role="status"
    aria-label="Loading card"
  >
    <SkeletonBase className="h-4 w-3/5" />
    <SkeletonBase className="h-3 w-full" />
    <SkeletonBase className="h-3 w-4/5" />
    <div className="pt-2">
      <SkeletonBase className="h-8 w-28" />
    </div>
    <span className="sr-only">Loading...</span>
  </div>
);

export const SkeletonAvatar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`} role="status" aria-label="Loading avatar">
    <SkeletonBase className="w-10 h-10 rounded-full shrink-0" />
    <div className="space-y-2 flex-1">
      <SkeletonBase className="h-3 w-1/3" />
      <SkeletonBase className="h-2 w-1/5" />
    </div>
    <span className="sr-only">Loading...</span>
  </div>
);

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <SkeletonBase className={className} />
);
