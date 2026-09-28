import { applySearchParamUpdates, toRelativeUrl } from './urlState';

export type SectionNavigationOptions = {
  readonly state?: unknown;
  readonly replace?: boolean;
  readonly clearSearch?: boolean;
  readonly searchParams?: Readonly<Record<string, string | null | undefined>>;
};

export function navigateToSection(id: string, options: SectionNavigationOptions = {}) {
  const target = id.trim().replace(/^#/, '');
  if (!target) return;

  const hash = '#' + target;
  const nextUrl = new URL(window.location.href);
  if (options.clearSearch) nextUrl.search = '';
  nextUrl.hash = hash;
  applySearchParamUpdates(nextUrl, options.searchParams);

  const nextRelativeUrl = toRelativeUrl(nextUrl);
  const sameTarget = window.location.hash === hash;
  const hasState = Object.prototype.hasOwnProperty.call(options, 'state');
  const hasSearchParams = Boolean(options.clearSearch || (options.searchParams && Object.keys(options.searchParams).length));

  if (!sameTarget) {
    const state = hasState ? (options.state ?? null) : null;
    if (options.replace) window.history.replaceState(state, '', nextRelativeUrl);
    else window.history.pushState(state, '', nextRelativeUrl);
  } else if (hasState || hasSearchParams) {
    const state = hasState ? (options.state ?? null) : window.history.state;
    window.history.replaceState(state, '', nextRelativeUrl);
  }

  window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: target }));
}


export function navigateToCleanSection(id: string) {
  navigateToSection(id, { replace: true, clearSearch: true });
}
