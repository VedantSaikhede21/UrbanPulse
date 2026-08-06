import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`shimmer rounded-md ${className}`} aria-hidden="true" />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`} role="status" aria-label="Loading content">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-3 rounded ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
    ))}
    <span className="sr-only">Loading...</span>
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-[#161616] border border-[#262626] rounded-lg p-4 space-y-3 ${className}`} role="status" aria-label="Loading card">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-20 rounded-md" />
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
    <span className="sr-only">Loading...</span>
  </div>
);

export const SkeletonAvatar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`} role="status" aria-label="Loading avatar">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="space-y-1.5 flex-1">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-2.5 w-16" />
    </div>
    <span className="sr-only">Loading...</span>
  </div>
);

export default Skeleton;
