import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  onChange?: (step: number) => void;
  className?: string;
}

interface StepState {
  label: string;
  index: number;
  status: 'completed' | 'active' | 'upcoming';
  isLast: boolean;
}

const getStates = (steps: string[], current: number): StepState[] =>
  steps.map((label, i) => ({
    label,
    index: i + 1,
    status: i + 1 < current ? 'completed' : i + 1 === current ? 'active' : 'upcoming',
    isLast: i === steps.length - 1,
  }));

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onChange,
  className = '',
}) => {
  const states = getStates(steps, currentStep);

  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center w-full">
        {states.map(s => (
          <li
            key={s.index}
            className={`flex items-center ${s.isLast ? '' : 'flex-1'}`}
          >
            <button
              type="button"
              onClick={() => onChange?.(s.index)}
              disabled={!onChange}
              aria-current={s.status === 'active' ? 'step' : undefined}
              className={`
                flex items-center gap-2 group
                ${onChange ? 'cursor-pointer' : 'cursor-default'}
                focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-lime rounded
              `}
            >
              <span
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold font-mono border-2 transition-all duration-300 shrink-0
                  ${s.status === 'completed'
                    ? 'bg-brand-lime border-brand-lime text-background'
                    : s.status === 'active'
                      ? 'border-brand-lime text-brand-lime bg-brand-soft'
                      : 'border-gray-700 text-gray-500 bg-transparent'
                  }
                `}
                aria-hidden="true"
              >
                {s.status === 'completed' ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  s.index
                )}
              </span>
              <span
                className={`
                  text-xs font-mono hidden sm:inline transition-colors duration-200
                  ${s.status === 'completed'
                    ? 'text-brand-lime'
                    : s.status === 'active'
                      ? 'text-foreground font-semibold'
                      : 'text-gray-600'
                  }
                `}
              >
                {s.label}
              </span>
            </button>
            {!s.isLast && (
              <div
                className={`
                  flex-1 h-0.5 mx-3 transition-colors duration-300
                  ${s.status === 'completed' ? 'bg-brand-lime' : 'bg-gray-800'}
                `}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
