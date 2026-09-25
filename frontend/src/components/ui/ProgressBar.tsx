import { Check } from 'lucide-react';

type ProgressVariant = 'determinate' | 'indeterminate' | 'steps';
type ProgressSize = 'sm' | 'md' | 'lg';

/**
 * Fill tone. `brand` (lime) is the DESIGN default and is reserved for genuine
 * progress/primary signals; the semantic tones exist so a *bad* value never
 * renders in the brand colour.
 */
export type ProgressAccent = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const ACCENT_FILL: Record<ProgressAccent, string> = {
  brand: 'bg-brand-lime',
  success: 'bg-status-resolved',
  warning: 'bg-status-progress',
  danger: 'bg-status-escalated',
  info: 'bg-status-new',
  neutral: 'bg-text-tertiary',
};

const ACCENT_STROKE: Record<ProgressAccent, string> = {
  brand: 'text-brand-lime',
  success: 'text-status-resolved',
  warning: 'text-status-progress',
  danger: 'text-status-escalated',
  info: 'text-status-new',
  neutral: 'text-text-tertiary',
};

export interface ProgressBarProps {
  value?: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  className?: string;
  showLabel?: boolean;
  label?: string;
  accent?: ProgressAccent;
  // For steps variant
  steps?: Array<{ label: string; completed?: boolean; active?: boolean }>;
}

const sizeStyles: Record<ProgressSize, { height: string; stepSize: string }> = {
  sm: { height: 'h-2', stepSize: 'w-6 h-6' },
  md: { height: 'h-3', stepSize: 'w-8 h-8' },
  lg: { height: 'h-4', stepSize: 'w-10 h-10' },
};

export function ProgressBar({
  value = 0,
  max = 100,
  variant = 'determinate',
  size = 'md',
  className = '',
  showLabel = false,
  label,
  accent = 'brand',
  steps,
}: ProgressBarProps) {
  const { height, stepSize } = sizeStyles[size];
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  if (variant === 'steps' && steps) {
    return (
      <div className={`flex items-center gap-2 ${className}`} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.completed;
          const isActive = step.active && !isCompleted;

          return (
            <div key={index} className="flex flex-col items-center gap-1.5">
              <div className="relative flex items-center">
                {!isLast && (
                  <div className={`absolute top-1/2 left-full -translate-y-1/2 w-4 h-0.5 ${isCompleted ? 'bg-brand-lime' : 'bg-border-default'}`} aria-hidden="true" />
                )}
                <div
                  className={`
                    flex items-center justify-center ${stepSize} rounded-full border-2 transition-all duration-300
                    ${isCompleted
                      ? 'bg-brand-lime border-brand-lime text-background'
                      : isActive
                      ? 'bg-transparent border-brand-lime text-brand-lime animate-pulse'
                      : 'bg-transparent border-border-default text-text-tertiary'}
                  `}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? <Check size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} /> : index + 1}
                </div>
              </div>
              <span className={`text-caption text-center max-w-[80px] ${isActive ? 'font-medium text-text-primary' : 'text-text-tertiary'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-body-sm font-medium text-text-primary">{label || `${Math.round(percentage)}%`}</span>
          {showLabel && <span className="text-caption text-text-tertiary font-mono tabular-nums">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`relative w-full ${height} bg-surface-elevated rounded-full overflow-hidden`}>
        {variant === 'indeterminate' ? (
          <div
            className={`absolute inset-0 ${ACCENT_FILL[accent]} animate-pulse`}
            style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
            aria-hidden="true"
          />
        ) : (
          <div
            className={`absolute top-0 left-0 h-full ${ACCENT_FILL[accent]} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${percentage}%` }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  accent?: ProgressAccent;
}

export function CircularProgress({
  value = 0,
  max = 100,
  size = 48,
  strokeWidth = 4,
  className = '',
  showLabel = true,
  accent = 'brand',
}: CircularProgressProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex ${className}`} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-elevated"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${ACCENT_STROKE[accent]} transition-all duration-500 ease-out`}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-body-sm font-bold text-text-primary">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}