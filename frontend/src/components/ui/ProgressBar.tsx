import React from 'react';

interface ProgressBarProps {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, indeterminate, size = 'md', label, className = '' }) => {
  const pct = value !== undefined ? Math.min(Math.max(0, (value / max) * 100), 100) : 0;
  const height = size === 'sm' ? 'h-1' : 'h-1.5';
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 bg-[#242424] rounded-full overflow-hidden ${height}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label || 'Progress'}>
        <div
          className={`h-full rounded-full bg-brand-lime transition-all duration-500 ease-out ${indeterminate ? 'w-1/2 animate-[shimmer_1.5s_ease-in-out_infinite]' : ''}`}
          style={indeterminate ? {} : { width: `${pct}%` }}
        />
      </div>
      {label && <span className="text-[11px] text-gray-500 font-mono whitespace-nowrap">{label}</span>}
    </div>
  );
};

interface StepIndicatorProps {
  steps: { label: string }[];
  currentStep: number;
  className?: string;
}

export const StepProgress: React.FC<StepIndicatorProps> = ({ steps, currentStep, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`} role="tablist" aria-label="Progress steps">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        const isPending = i > currentStep;
        return (
          <div key={i} className="flex items-center gap-1 flex-1">
            <div
              className={`
                flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold transition-all duration-200
                ${isCompleted ? 'bg-brand-lime text-background' : ''}
                ${isActive ? 'border-2 border-brand-lime text-brand-lime' : ''}
                ${isPending ? 'border border-[#262626] text-gray-600' : ''}
              `}
              role="tab"
              aria-selected={isActive}
              aria-label={`Step ${i + 1}: ${step.label}`}
            >
              {isCompleted ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] hidden sm:block ${isActive ? 'text-brand-lime' : 'text-gray-600'}`}>
              {step.label}
            </span>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${isCompleted ? 'bg-brand-lime' : 'bg-[#262626]'}`} />}
          </div>
        );
      })}
    </div>
  );
};
