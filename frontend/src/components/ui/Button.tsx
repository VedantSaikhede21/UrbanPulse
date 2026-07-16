import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-brand-lime rounded px-4 py-2 text-sm disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-brand-lime text-background hover:bg-brand-dim hover:shadow-[0_0_12px_rgba(198,241,53,0.3)]',
    secondary: 'bg-panel-card text-foreground border border-panel-border hover:bg-panel-hover hover:border-gray-600',
    outline: 'border border-brand-lime text-brand-lime hover:bg-brand-soft',
    ghost: 'text-foreground hover:bg-panel-card',
    destructive: 'bg-status-escalated text-foreground hover:bg-red-600 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
