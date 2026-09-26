export type SectionNavigationOptions = {
  readonly state?: unknown;
  readonly replace?: boolean;
};

export function navigateToSection(id: string, options: SectionNavigationOptions = {}) {
  const target = id.trim().replace(/^#/, '');
  if (!target) return;

  const hash = '#' + target;
  const sameTarget = window.location.hash === hash;
  const hasState = Object.prototype.hasOwnProperty.call(options, 'state');

  if (!sameTarget) {
    const state = hasState ? (options.state ?? null) : null;
    if (options.replace) window.history.replaceState(state, '', hash);
    else window.history.pushState(state, '', hash);
  } else if (hasState) {
    window.history.replaceState(options.state ?? null, '', hash);
  }

  window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: target }));
}
