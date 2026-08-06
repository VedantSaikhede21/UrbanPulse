import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  showOnline?: boolean;
  className?: string;
}

const sizeMap = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };
const dotSizeMap = { sm: 'w-1.5 h-1.5', md: 'w-2 h-2', lg: 'w-2.5 h-2.5' };

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, name, size = 'md', showOnline, className = '' }) => {
  const [imgError, setImgError] = React.useState(false);
  return (
    <div className={`relative inline-flex items-center justify-center ${sizeMap[size]} rounded-full bg-[#242424] text-gray-400 font-semibold overflow-hidden flex-shrink-0 ${className}`}>
      {src && !imgError ? (
        <img src={src} alt={alt || name || 'Avatar'} onError={() => setImgError(true)} className="w-full h-full object-cover" />
      ) : (
        <span>{name ? getInitials(name) : '?'}</span>
      )}
      {showOnline && <span className={`absolute -bottom-0.5 -right-0.5 ${dotSizeMap[size]} rounded-full bg-[#10b981] ring-2 ring-[#0d0d0d]`} />}
    </div>
  );
};
