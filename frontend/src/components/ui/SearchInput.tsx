import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  autoFocus,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative ${className}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        data-search-input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full h-9 pl-9 pr-8 bg-surface-raised border border-border-default rounded-lg text-xs text-text-primary placeholder:text-text-quaternary focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all duration-150"
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={() => { onChange(''); inputRef.current?.focus(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors p-0.5 rounded focus-ring"
          aria-label="Clear search"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};
