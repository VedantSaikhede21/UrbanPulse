import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-lime text-background hover:bg-brand-lime-hover active:bg-brand-lime-active border border-transparent',
  secondary: 'bg-surface-card text-text-primary border-border-default hover:bg-surface-hover hover:border-border-hover',
  outline: 'bg-transparent text-brand-lime border border-brand-lime/50 hover:bg-brand-soft hover:border-brand-lime',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary',
  destructive: 'bg-status-escalated text-white hover:bg-status-escalated/90 border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-7 px-2 text-label gap-1.5',
  md: 'h-9 px-4 text-label gap-2',
  lg: 'h-11 px-6 text-body-sm gap-2',
};

const iconSize: Record<ButtonSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className = '',
    children,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        className={`
          inline-flex items-center justify-center font-semibold rounded-lg
          transition-all duration-150 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base
          disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
          ${fullWidth ? 'w-full' : ''}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 size={iconSize[size]} className="animate-spin" aria-hidden="true" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';