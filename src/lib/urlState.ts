export const urlParamKeys = {
  publicService: 'servico',
  inspector: 'dado',
  readingMode: 'leitura',
} as const;

export type UrlReadingMode = 'summary' | 'simple' | 'guided' | 'technical';

export type SearchParamUpdates = Readonly<Record<string, string | null | undefined>>;

function normalizeHash(hash: string) {
  const target = hash.trim();
  if (!target) return '';
  return '#' + target.replace(/^#+/, '');
}

export function getSearchParam(key: string, search?: string) {
  const source = search ?? (typeof window === 'undefined' ? '' : window.location.search);
  return new URLSearchParams(source).get(key);
}

export function getReadingModeParam(search?: string): UrlReadingMode | null {
  const value = getSearchParam(urlParamKeys.readingMode, search);
  return value === 'summary' || value === 'simple' || value === 'guided' || value === 'technical' ? value : null;
}

export function getPublicServiceQuery() {
  if (typeof window === 'undefined') return '';
  const fromUrl = getSearchParam(urlParamKeys.publicService);
  if (fromUrl) return fromUrl;
  return typeof window.history.state?.publicServiceQuery === 'string'
    ? window.history.state.publicServiceQuery
    : '';
}

export function applySearchParamUpdates(url: URL, updates?: SearchParamUpdates) {
  if (!updates) return url;
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === '') url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  return url;
}

export function toRelativeUrl(url: URL) {
  return url.pathname + url.search + url.hash;
}

export function replaceCurrentUrl(
  updates: SearchParamUpdates,
  options: { readonly state?: unknown; readonly hash?: string } = {},
) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  applySearchParamUpdates(url, updates);
  if (options.hash !== undefined) url.hash = normalizeHash(options.hash);

  const hasState = Object.prototype.hasOwnProperty.call(options, 'state');
  const state = hasState ? (options.state ?? null) : window.history.state;
  window.history.replaceState(state, '', toRelativeUrl(url));
}

export function buildCanonicalUrl(updates: SearchParamUpdates = {}, hash = '') {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);
  applySearchParamUpdates(url, updates);
  url.hash = normalizeHash(hash);
  return url.toString();
}
