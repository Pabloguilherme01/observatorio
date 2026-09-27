export type SectionNavigationOptions = {
  readonly state?: unknown;
  readonly replace?: boolean;
  readonly searchParams?: Readonly<Record<string, string | null | undefined>>;
};

export function navigateToSection(id: string, options: SectionNavigationOptions = {}) {
  const target = id.trim().replace(/^#/, '');
  if (!target) return;

  const hash = '#' + target;
  const nextUrl = new URL(window.location.href);
  nextUrl.hash = hash;
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value === null || value === undefined || value === '') nextUrl.searchParams.delete(key);
      else nextUrl.searchParams.set(key, value);
    }
  }

  const nextRelativeUrl = nextUrl.pathname + nextUrl.search + nextUrl.hash;
  const sameTarget = window.location.hash === hash;
  const hasState = Object.prototype.hasOwnProperty.call(options, 'state');
  const hasSearchParams = Boolean(options.searchParams && Object.keys(options.searchParams).length);

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
