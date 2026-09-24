import React, { forwardRef } from 'react';

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { track: 'w-8 h-5', handle: 'w-4 h-4', translateOn: 'translate-x-3' },
  md: { track: 'w-9 h-5', handle: 'w-4 h-4', translateOn: 'translate-x-4' },
  lg: { track: 'w-10 h-6', handle: 'w-5 h-5', translateOn: 'translate-x-5' },
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, size = 'md', disabled, id, className = '', ...props }, ref) => {
    const toggleId = id || `toggle-${React.useId()}`;
    const { track, handle, translateOn } = sizeStyles[size];

    return (
      <label className={`inline-flex items-start gap-3 cursor-pointer ${className}`}>
        <div className="relative flex items-center" style={{ minWidth: track.width, minHeight: track.height }}>
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            role="switch"
            disabled={disabled}
            className="sr-only peer"
            aria-checked={props.checked}
            {...props}
          />
          <span
            className={`
              relative inline-block rounded-full transition-all duration-200 ease-out
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2
              peer-checked:bg-brand-lime peer-checked:border-brand-lime
              peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
              ${track}
              bg-surface-elevated border border-border-default
            `}
            aria-hidden="true"
          >
            <span
              className={`
                absolute top-1/2 left-1 -translate-y-1/2 rounded-full bg-white shadow-sm
                transition-transform duration-200 ease-out
                peer-checked:${translateOn}
                ${handle}
              `}
              aria-hidden="true"
            />
          </span>
          {/* Touch target expansion for accessibility */}
          <span className="absolute inset-0 -inset-2" aria-hidden="true" />
        </div>
        {(label || description) && (
          <div className="flex flex-col leading-tight pt-0.5">
            {label && (
              <span className={`text-body-sm font-medium ${disabled ? 'text-text-tertiary' : 'text-text-primary'}`}>
                {label}
              </span>
            )}
            {description && (
              <span className="text-caption text-text-tertiary">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';