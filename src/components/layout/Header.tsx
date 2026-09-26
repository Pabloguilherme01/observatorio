import { CalendarDays, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ContrastModeToggle } from './ContrastModeToggle';
import { useTheme } from '../../context/ThemeContext';
import { navigation } from '../../config/navigation';
import { LanguageModeToggle } from './LanguageModeToggle';
import { observatorioData as d } from '../../data/observatorioData';
import { formatDate } from '../../utils/formatters';

const SearchModal = lazy(() => import('./SearchModal').then(module => ({ default: module.SearchModal })));

const primaryNavigationIds = ['descubra', 'dashboard', 'eleitoral360'] as const;
const primaryNavigation = navigation.filter(item => primaryNavigationIds.includes(item.id as typeof primaryNavigationIds[number]));
const moreNavigation = navigation.filter(item => !primaryNavigationIds.includes(item.id as typeof primaryNavigationIds[number]));

export function Header() {
  const { theme, toggle } = useTheme();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutGuideOpen, setShortcutGuideOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreOpenRef = useRef(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const toolsButtonRef = useRef<HTMLButtonElement>(null);
  const toolsPanelRef = useRef<HTMLDivElement>(null);
  const updatedAt = formatDate(d.meta.updatedAt);
  const moreActive = moreNavigation.some(item => item.id === activeSection);

  const captureDate = new Date(d.meta.updatedAt);
  const now = new Date();
  const ageDays = Number.isFinite(captureDate.getTime())
    ? Math.max(0, Math.floor((now.getTime() - captureDate.getTime()) / 86400000))
    : 0;
  const updateState = ageDays === 0 ? 'today' : ageDays <= 7 ? 'recent' : 'stale';
  const freshnessLabel = updateState === 'today'
    ? 'Captura hoje'
    : updateState === 'recent'
      ? 'Captura recente · ' + ageDays + (ageDays === 1 ? ' dia' : ' dias')
      : 'Captura desatualizada · ' + ageDays + ' dias';

  useEffect(() => {
    moreOpenRef.current = moreOpen;
  }, [moreOpen]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-16% 0px -70% 0px', threshold: [0.1, 0.25, 0.5] });

    const observeSections = () => {
      navigation.forEach(item => {
        const node = document.getElementById(item.id);
        if (node) observer.observe(node);
      });
    };

    observeSections();
    const onNavigate = (event: Event) => {
      const targetId = (event as CustomEvent<string>).detail;
      if (targetId && navigation.some(item => item.id === targetId)) setActiveSection(targetId);
      window.requestAnimationFrame(observeSections);
    };
    const root = document.getElementById('main-content') ?? document.body;
    const mutationObserver = typeof MutationObserver === 'undefined' ? null : new MutationObserver(() => observeSections());
    mutationObserver?.observe(root, { childList: true, subtree: true });

    window.addEventListener('observatorio:navigate', onNavigate);
    return () => {
      observer.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('observatorio:navigate', onNavigate);
    };
  }, []);

  useEffect(() => {
    const onDocumentPointer = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      const target = event.target as HTMLElement;
      if (moreOpenRef.current && !target.closest('[aria-haspopup="menu"]') && !target.closest('[role="menu"]')) {
        setMoreOpen(false);
        window.requestAnimationFrame(() => moreButtonRef.current?.focus());
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!moreOpenRef.current) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMoreOpen(false);
        window.requestAnimationFrame(() => moreButtonRef.current?.focus());
        return;
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const items = Array.from(document.querySelectorAll<HTMLElement>('#desktop-more-menu [role="menuitem"]'));
      if (!items.length) return;
      event.preventDefault();
      const current = items.indexOf(document.activeElement as HTMLElement);
      const next = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    };

    document.addEventListener('mousedown', onDocumentPointer);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocumentPointer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    const openSearch = () => {
      setShortcutGuideOpen(false);
      setSearchOpen(true);
    };
    const openShortcutHelp = () => {
      setShortcutGuideOpen(true);
      setSearchOpen(true);
    };
    window.addEventListener('observatorio:search', openSearch);
    window.addEventListener('observatorio:shortcut-help', openShortcutHelp);
    return () => {
      window.removeEventListener('observatorio:search', openSearch);
      window.removeEventListener('observatorio:shortcut-help', openShortcutHelp);
    };
  }, []);

  useEffect(() => {
    if (!toolsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setToolsOpen(false);
        window.requestAnimationFrame(() => toolsButtonRef.current?.focus());
      }
    };
    document.addEventListener('keydown', onKeyDown);
    window.requestAnimationFrame(() => toolsPanelRef.current?.querySelector<HTMLElement>('a,button')?.focus());
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [toolsOpen]);

  const closeTools = () => {
    setToolsOpen(false);
    window.requestAnimationFrame(() => toolsButtonRef.current?.focus());
  };

  return (
    <>
      <header className="site-header sticky top-0 z-40 border-b border-white/10 bg-[#0b1117]/90 backdrop-blur-xl light:bg-[#f5f7fa]/95" data-theme={theme}>
        <div className="site-header-inner mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <a href="#dashboard" className="site-brand min-w-0 flex-1 md:flex-none" aria-label="Observatório, início">
            <span className="block truncate text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">Águas Lindas · 2026</span>
            <span className="my-1 block h-px w-8 bg-slate-600/70" aria-hidden="true" />
            <span className="block truncate text-[15px] font-black tracking-tight text-white light:text-slate-900">Observatório</span>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex" aria-label="Navegação principal">
            {primaryNavigation.map(item => (
              <a
                key={item.id}
                href={'#' + item.id}
                className={'rounded-xl px-3 py-2 text-xs font-semibold transition ' + (activeSection === item.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white')}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                {item.shortLabel}
              </a>
            ))}
            <div className="relative">
              <button
                ref={moreButtonRef}
                type="button"
                onClick={() => setMoreOpen(value => !value)}
                onKeyDown={(event) => {
                  if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    if (moreOpen) return;
                    event.preventDefault();
                  } else {
                    event.preventDefault();
                  }
                  setMoreOpen(true);
                  window.requestAnimationFrame(() => {
                    const items = Array.from(document.querySelectorAll<HTMLElement>('#desktop-more-menu [role="menuitem"]'));
                    (event.key === 'ArrowUp' ? items.at(-1) : items[0])?.focus();
                  });
                }}
                className={'rounded-xl px-3 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-sky-300 focus-visible:outline-offset-2 ' + (moreActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white')}
                aria-expanded={moreOpen}
                aria-current={moreActive ? 'page' : undefined}
                aria-haspopup="menu"
                aria-controls="desktop-more-menu"
              >
                Mais
              </button>
              {moreOpen && (
                <div id="desktop-more-menu" className="absolute right-0 top-full z-50 mt-2 grid max-h-[min(70vh,560px)] w-64 gap-1 overflow-auto rounded-2xl border border-white/10 bg-[#0f1822]/98 p-2 shadow-2xl" role="menu" aria-label="Mais áreas do observatório">
                  {moreNavigation.map(item => (
                    <a
                      key={item.id}
                      href={'#' + item.id}
                      role="menuitem"
                      onClick={() => setMoreOpen(false)}
                      className={'rounded-xl px-3 py-2.5 text-left text-xs transition focus-visible:outline-2 focus-visible:outline-sky-300 focus-visible:outline-offset-2 ' + (activeSection === item.id ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white')}
                      aria-current={activeSection === item.id ? 'page' : undefined}
                    >
                      <span className="block font-bold">{item.shortLabel}</span>
                      <span className="mt-0.5 block text-[10px] text-slate-500">{item.description}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div
            className={'site-header-status hidden items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold lg:flex ' + (updateState === 'today'
              ? 'border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200'
              : updateState === 'recent'
                ? 'border-sky-300/20 bg-sky-300/[0.06] text-sky-200'
                : 'border-amber-300/25 bg-amber-300/[0.06] text-amber-200')}
            aria-label={'Captura local do conjunto principal em ' + updatedAt + (updateState === 'today' ? '; captura de hoje' : updateState === 'recent' ? '; captura dos últimos 7 dias' : '; captura com mais de 7 dias')}
            title="Data da captura local do conjunto principal; cada indicador pode ter data-base própria"
          >
            <span className={'h-1.5 w-1.5 rounded-full ' + (updateState === 'today' ? 'bg-emerald-300' : updateState === 'recent' ? 'bg-sky-300' : 'bg-amber-300')} aria-hidden="true" />
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Captura {updatedAt}</span>
          </div>

          <div className="site-header-actions ml-auto flex items-center gap-1">
            <button type="button" onClick={() => { setShortcutGuideOpen(false); setSearchOpen(true); }} className="site-icon-button min-h-11 min-w-11 rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white light:hover:bg-slate-900/5 light:hover:text-slate-900" aria-label="Buscar no observatório" aria-keyshortcuts="/ Control+K">
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="header-reading-mode hidden md:block"><LanguageModeToggle /></div>
            <div className="hidden xl:block"><ContrastModeToggle /></div>
            <button type="button" onClick={toggle} className="site-icon-button desktop-theme-toggle min-h-11 min-w-11 rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white light:hover:bg-slate-900/5 light:hover:text-slate-900" aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}>
              {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button ref={toolsButtonRef} type="button" onClick={() => setToolsOpen(value => !value)} className="site-tools-button min-h-11 min-w-11 rounded-xl border border-white/10 bg-white/[0.025] p-2 text-slate-300 hover:bg-white/5 md:hidden" aria-expanded={toolsOpen} aria-controls="mobile-tools" aria-label={toolsOpen ? 'Fechar menu' : 'Abrir menu'}>
              {toolsOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {toolsOpen && (
          <div ref={toolsPanelRef} id="mobile-tools" className="mobile-tools-sheet border-t border-white/10 px-4 py-3 md:hidden" role="dialog" aria-modal="false" aria-label="Menu e ferramentas">
            <div className="mobile-tools-grid">
              <div className="mobile-tools-mode">
                <div className="mobile-tools-meta">
                  <span className="mobile-tools-label">Leitura</span>
                  <span className="mobile-tools-updated">
                    <CalendarDays className="h-3 w-3" aria-hidden="true" />
                    {freshnessLabel} · {updatedAt}
                  </span>
                </div>
                <LanguageModeToggle />
              </div>
              <div className="mobile-tools-contrast"><ContrastModeToggle /></div>
              <div className="mobile-tools-actions">
                <button type="button" onClick={() => { toggle(); closeTools(); }} className="mobile-tool-action">
                  {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                  <span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>
                </button>
                <button type="button" onClick={() => { window.dispatchEvent(new CustomEvent('observatorio:search')); closeTools(); }} className="mobile-tool-action">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span>Buscar áreas</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      <Suspense fallback={null}>
        <SearchModal open={searchOpen} initialShortcutGuideOpen={shortcutGuideOpen} onClose={() => { setSearchOpen(false); setShortcutGuideOpen(false); }} />
      </Suspense>
    </>
  );
}
