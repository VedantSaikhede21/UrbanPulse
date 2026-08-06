import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled, label, id }) => {
  const toggleId = id || `toggle-${Math.random().toString(36).slice(2)}`;
  return (
    <label htmlFor={toggleId} className="inline-flex items-center gap-3 cursor-pointer group">
      <button
        id={toggleId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d]
          ${checked ? 'bg-brand-lime' : 'bg-[#242424]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200
            ${checked ? 'translate-x-[18px]' : 'translate-x-[3px]'}
          `}
        />
      </button>
      {label && <span className="text-xs text-gray-400 group-hover:text-foreground transition-colors">{label}</span>}
    </label>
  );
};
