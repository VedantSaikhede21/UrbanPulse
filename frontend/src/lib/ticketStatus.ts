/**
 * Canonical ticket-status vocabulary.
 *
 * Status maps used to be duplicated in five page components. They drifted:
 * `needs_review` — a real status the pipeline writes when it will not auto-
 * classify a report — existed only in CitizenDashboard, so analytics rendered
 * the raw snake_case string and, worse, PublicMap had no colour, label or
 * radius for it, which meant those tickets drew no dot on the public map at all.
 *
 * One source of truth for the label, badge value, map colour and map radius.
 */

/** Statuses that still need work. `needs_review` is open: it awaits a human. */
export const OPEN_TICKET_STATUSES = [
  'reported',
  'assigned',
  'in_progress',
  'needs_review',
] as const;

/** Statuses that are closed. */
export const RESOLVED_TICKET_STATUSES = ['resolved', 'verified'] as const;

const DISPLAY: Record<string, string> = {
  reported: 'Reported',
  assigned: 'Assigned',
  in_progress: 'In progress',
  needs_review: 'Needs review',
  resolved: 'Resolved',
  verified: 'Verified',
};

/** Values the <Badge type="status"> component understands. */
const BADGE: Record<string, string> = {
  reported: 'new',
  assigned: 'new',
  in_progress: 'progress',
  needs_review: 'progress',
  resolved: 'resolved',
  verified: 'verified',
};

/** Map dot colours, kept in sync with the Tailwind status tokens. */
const MAP_COLOR: Record<string, string> = {
  reported: '#3b82f6',
  assigned: '#3b82f6',
  in_progress: '#f59e0b',
  needs_review: '#f59e0b',
  resolved: '#10b981',
  verified: '#8b5cf6',
};

/** Map dot radius in px. Open work reads larger than closed history. */
const MAP_RADIUS: Record<string, number> = {
  reported: 9,
  assigned: 11,
  in_progress: 13,
  needs_review: 11,
  resolved: 8,
  verified: 6,
};

/** Human label, e.g. "Needs review". Never returns an empty string. */
export function statusLabel(status: string): string {
  return DISPLAY[status] ?? status ?? 'Unknown';
}

/** Label used by the public map, where a new report reads better than "Reported". */
export function mapStatusLabel(status: string): string {
  return status === 'reported' ? 'New' : statusLabel(status);
}

export function statusBadgeValue(status: string): string {
  return BADGE[status] ?? 'new';
}

export function statusMapColor(status: string): string {
  return MAP_COLOR[status] ?? '#6b7280';
}

export function statusMapRadius(status: string): number {
  return MAP_RADIUS[status] ?? 8;
}

export function isOpenStatus(status: string): boolean {
  return (OPEN_TICKET_STATUSES as readonly string[]).includes(status);
}

export function isResolvedStatus(status: string): boolean {
  return (RESOLVED_TICKET_STATUSES as readonly string[]).includes(status);
}
