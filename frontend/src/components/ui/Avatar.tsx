import React from 'react';
import { User } from 'lucide-react';

type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarShape = 'circle' | 'square';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; icon: number; status: string }> = {
  sm: { container: 'w-6 h-6', text: 'text-[10px]', icon: 12, status: 'w-2 h-2 bottom-0 right-0' },
  md: { container: 'w-8 h-8', text: 'text-xs', icon: 14, status: 'w-2 h-2 bottom-0 right-0' },
  lg: { container: 'w-10 h-10', text: 'text-sm', icon: 18, status: 'w-2.5 h-2.5 bottom-0.5 right-0.5' },
};

const shapeStyles: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-lg',
};

const statusColors = {
  online: 'bg-status-resolved',
  offline: 'bg-text-quaternary',
  busy: 'bg-status-escalated',
  away: 'bg-status-progress',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ src, alt, name, size = 'md', shape = 'circle', status, className = '' }: AvatarProps) {
  const { container, text, icon, status: statusStyle } = sizeStyles[size];
  const hasImage = src && src.length > 0;
  const initials = name ? getInitials(name) : '?';
  const displayAlt = alt || name || 'User avatar';

  const statusIndicator = status ? (
    <span
      className={`
        absolute rounded-full border-2 border-surface-base ${statusStyle}
        ${statusColors[status]}
      `}
      aria-label={`Status: ${status}`}
    />
  ) : null;

  return (
    <div className={`relative inline-flex shrink-0 ${container} ${shapeStyles[shape]} ${className}`}>
      {hasImage ? (
        <img
          src={src}
          alt={displayAlt}
          className={`w-full h-full object-cover ${shapeStyles[shape]}`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`
            w-full h-full flex items-center justify-center bg-surface-elevated
            ${shapeStyles[shape]} ${text} font-medium text-text-secondary
          `}
          aria-label={displayAlt}
        >
          {initials}
        </div>
      )}
      {statusIndicator}
      {/* Fallback for broken images */}
      {!hasImage && name && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated">
          <User size={icon} className="text-text-tertiary" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  className?: string;
  size?: AvatarSize;
}

export function AvatarGroup({ children, max = 5, className = '', size = 'md' }: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children).filter(React.isValidElement);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`} role="group" aria-label={`${childrenArray.length} users`}>
      {visibleChildren.map((child, index) =>
        React.cloneElement(child as React.ReactElement<any>, {
          key: child.key || index,
          size,
          className: 'ring-2 ring-surface-base',
        })
      )}
      {remainingCount > 0 && (
        <div
          className={`
            flex items-center justify-center bg-surface-elevated border-2 border-surface-base
            ${sizeStyles[size].container} ${shapeStyles.circle}
            text-xs font-medium text-text-tertiary
          `}
          aria-label={`${remainingCount} more users`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}