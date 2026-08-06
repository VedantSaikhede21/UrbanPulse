import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-lime text-background hover:bg-brand-lime-hover',
  secondary:
    'bg-panel-card text-foreground border border-panel-border hover:bg-panel-hover',
  outline:
    'bg-transparent text-brand-lime border border-brand-lime/50 hover:bg-brand-soft',
  ghost:
    'bg-transparent text-gray-400 hover:text-foreground hover:bg-panel-hover',
  destructive:
    'bg-status-escalated text-white hover:bg-red-600',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-7 px-2 text-[11px]',
  md: 'h-9 px-4 text-[12px]',
  lg: 'h-11 px-6 text-[13px]',
};

const Spinner = () => (
  <svg
    className="animate-spin h-3.5 w-3.5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-lime active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Spinner />
        ) : (
          <>
            {leftIcon && <span className="mr-1.5">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-1.5">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
