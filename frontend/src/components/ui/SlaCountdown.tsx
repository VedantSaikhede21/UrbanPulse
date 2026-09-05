import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export type SlaTone = 'on-track' | 'at-risk' | 'overdue' | 'met' | 'unknown';

export interface SlaCountdownProps {
  /** ISO 8601 string from the backend serializer. */
  expectedResolutionAt: string | null | undefined;
  /** Ticket status — 'verified'/'resolved' short-circuits to "met". */
  status?: string;
  /** Visual density — `compact` is for inline use on ticket cards. */
  variant?: 'compact' | 'full';
  /** Override the "now" clock (test-only seam). */
  now?: Date;
}

/**
 * Renders an expected-resolution deadline with live colour-coded urgency:
 *  - on-track: > 25% of the budget remains
 *  - at-risk:  <= 25% remains, or <= 6h remain on a multi-day SLA
 *  - overdue:  deadline is in the past
 *  - met:      ticket is in a terminal status
 *  - unknown:  backend has not set the deadline
 *
 * Updates every 30s so the urgency tone shifts on a long-running queue
 * without forcing a refetch.
 */
export const SlaCountdown: React.FC<SlaCountdownProps> = ({
  expectedResolutionAt,
  status,
  variant = 'compact',
  now,
}) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const current = now ?? new Date();
  // `tick` is intentionally read so React re-renders on the interval.
  void tick;

  const tone = computeTone(expectedResolutionAt, status, current);
  const remaining = expectedResolutionAt ? remainingLabel(expectedResolutionAt, current) : '';

  if (tone === 'unknown') {
    return variant === 'full' ? (
      <div className="text-[10px] font-mono uppercase tracking-wider text-text-quaternary flex items-center gap-1">
        <Clock size={11} /> No SLA set
      </div>
    ) : null;
  }

  if (tone === 'met') {
    return (
      <div className={`inline-flex items-center gap-1 font-mono ${variant === 'full' ? 'text-xs' : 'text-[10px]'} text-emerald-400`}>
        <CheckCircle2 size={variant === 'full' ? 12 : 10} />
        <span>Resolved within SLA</span>
      </div>
    );
  }

  const styles = TONE_STYLES[tone];
  const Icon = tone === 'overdue' ? AlertTriangle : Clock;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="sla-countdown"
      data-tone={tone}
      className={`inline-flex items-center gap-1 font-mono ${variant === 'full' ? 'text-xs' : 'text-[10px]'} ${styles.text}`}
    >
      <Icon size={variant === 'full' ? 12 : 10} />
      {tone === 'overdue' ? (
        <span>Overdue by {remaining}</span>
      ) : (
        <span>Due in {remaining}</span>
      )}
    </div>
  );
};

const TONE_STYLES: Record<Exclude<SlaTone, 'unknown' | 'met'>, { text: string }> = {
  'on-track': { text: 'text-text-tertiary' },
  'at-risk': { text: 'text-amber-300' },
  'overdue': { text: 'text-red-300' },
};

export function computeTone(
  expectedResolutionAt: string | null | undefined,
  status: string | undefined,
  now: Date,
): SlaTone {
  if (!expectedResolutionAt) return 'unknown';
  if (status === 'resolved' || status === 'verified') return 'met';
  const deadline = new Date(expectedResolutionAt);
  if (Number.isNaN(deadline.getTime())) return 'unknown';
  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs <= 0) return 'overdue';
  // Window length is unknown (category-specific), so we approximate urgency
  // by absolute horizon: <= 6h on any SLA is at-risk, > 6h is on-track.
  // The visual still reads "due in 3h 12m" so the officer knows the budget.
  if (diffMs <= 6 * 60 * 60 * 1000) return 'at-risk';
  return 'on-track';
}

export function remainingLabel(expectedResolutionAt: string, now: Date): string {
  const deadline = new Date(expectedResolutionAt);
  const diffMs = Math.abs(deadline.getTime() - now.getTime());
  const totalMins = Math.floor(diffMs / 60_000);
  if (totalMins < 60) return `${totalMins}m`;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours < 24) return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours === 0 ? `${days}d` : `${days}d ${remHours}h`;
}
