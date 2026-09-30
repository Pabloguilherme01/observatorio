import { STORAGE_NAMESPACE } from '../config/version';

const STORAGE_KEY = `${STORAGE_NAMESPACE}-saved-indicators`;
const MAX_SAVED_INDICATORS = 12;

export interface SavedIndicator {
  readonly id: string;
  readonly title: string;
  readonly url: string;
}

export function getSavedIndicators(): SavedIndicator[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.filter((item): item is SavedIndicator => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Partial<SavedIndicator>;
      if (typeof candidate.id !== 'string' || typeof candidate.title !== 'string' || typeof candidate.url !== 'string') return false;
      let url: URL;
      try { url = new URL(candidate.url, window.location.origin); } catch { return false; }
      if (url.origin !== window.location.origin) return false;
      if (seen.has(candidate.id)) return false;
      seen.add(candidate.id);
      return true;
    }).slice(0, MAX_SAVED_INDICATORS);
  } catch {
    return [];
  }
}

export function isIndicatorSaved(id: string) {
  return getSavedIndicators().some(item => item.id === id);
}

export function toggleSavedIndicator(indicator: SavedIndicator) {
  const current = getSavedIndicators();
  const next = current.some(item => item.id === indicator.id)
    ? current.filter(item => item.id !== indicator.id)
    : [indicator, ...current].slice(0, MAX_SAVED_INDICATORS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return current;
  }
  return next;
}

export function clearSavedIndicators() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}