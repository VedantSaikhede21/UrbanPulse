import type { Ward } from './types';

export function avgUhs(wards: Ward[]): number {
  if (!wards.length) return 0;
  return wards.reduce((s, w) => s + w.uhs_score, 0) / wards.length;
}