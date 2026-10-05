import { resolvePrimaryQuickAnswer } from './searchQuickAnswer/primary';
import { resolveCivicQuickAnswer } from './searchQuickAnswer/civic';
import { resolveProfileQuickAnswer } from './searchQuickAnswer/profile';
import type { QuickAnswer } from './searchQuickAnswer/types';

export type { QuickAnswer } from './searchQuickAnswer/types';

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const normalizeSearchQuery = (value: string) => normalize(value).replace(/\s+/g, ' ');

export function resolveQuickAnswer(query: string): QuickAnswer | null {
  const q = normalizeSearchQuery(query);
  if (!q || q.length < 4) return null;

  return resolvePrimaryQuickAnswer(q)
    ?? resolveCivicQuickAnswer(q)
    ?? resolveProfileQuickAnswer(q);
}
