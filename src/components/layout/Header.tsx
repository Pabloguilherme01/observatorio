import { CalendarDays, Code2, FileText, GraduationCap, Link2, List, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ContrastModeToggle } from './ContrastModeToggle';
import { useTheme } from '../../context/ThemeContext';
import { navigation } from '../../config/navigation';
import { LanguageModeToggle } from './LanguageModeToggle';
import { observatorioData as d } from '../../data/observatorioData';
import { formatDate } from '../../utils/formatters';
import { copyText } from '../../lib/clipboard';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { buildCanonicalUrl, urlParamKeys } from '../../lib/urlState';
import { DesktopHeaderNavigation } from './DesktopHeaderNavigation';

const SearchModal = lazy(() => import('./SearchModal').then(module => ({ default: module.SearchModal })));


export function Header() {
  const { theme, toggle } = useTheme();
  const { mode: languageMode, cycleMode } = useLanguageMode();
  const [activeSection, setActiveSection] = useState('dashboard');
  const activeSectionRef = useRef('dashboard');
  const pendingNavigationRef = useRef<string | null>(null);
  const pendingNavigationTimerRef = useRef<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutGuideOpen, setShortcutGuideOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [sectionLinkCopied, setSectionLinkCopied] = useState(false);
  const toolsButtonRef = useRef<HTMLButtonElement>(null);
  const toolsPanelRef = useRef<HTMLDivElement>(null);
  const copiedTimerRef = useRef<number | null>(null);
  const updatedAt = formatDate(d.meta.updatedAt);

  // Esta data descreve a versão local publicada, não a atualização das fontes originais.
  // Evita classificá-la como "recente" sem uma captura individual e verificável por indicador.


  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observedSections = new Set<Element>();
    let observeRaf = 0;

    const observer = new IntersectionObserver(entries => {
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      const pendingTarget = pendingNavigationRef.current;
      if (pendingTarget) {
        const pendingEntry = visibleEntries.find(entry => entry.target.id === pendingTarget);
        if (pendingEntry) {
          pendingNavigationRef.current = null;
          if (pendingNavigationTimerRef.current) {
            window.clearTimeout(pendingNavigationTimerRef.current);
            pendingNavigationTimerRef.current = null;
          }
        } else {
          return;
        }
      }

      const visible = visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) {
        activeSectionRef.current = visible.target.id;
        setActiveSection(visible.target.id);
      }
    }, { rootMargin: '-16% 0px -70% 0px', threshold: [0.1, 0.25, 0.5] });

    const observeSections = () => {
      navigation.forEach(item => {
        const node = document.getElementById(item.id);
        if (!node || observedSections.has(node)) return;
        observer.observe(node);
        observedSections.add(node);
      });
    };

    const scheduleObserveSections = () => {
      if (observeRaf) return;
      observeRaf = window.requestAnimationFrame(() => {
        observeRaf = 0;
        observeSections();
      });
    };

    observeSections();
    const onNavigate = (event: Event) => {
      const targetId = (event as CustomEvent<string>).detail;
      if (targetId && navigation.some(item => item.id === targetId)) {
        pendingNavigationRef.current = targetId;
        activeSectionRef.current = targetId;
        setActiveSection(targetId);
        if (pendingNavigationTimerRef.current) window.clearTimeout(pendingNavigationTimerRef.current);
        pendingNavigationTimerRef.current = window.setTimeout(() => {
          pendingNavigationRef.current = null;
          pendingNavigationTimerRef.current = null;
        }, 1400);
      }
      scheduleObserveSections();
    };
    const root = document.getElementById('main-content') ?? document.body;
    const mutationObserver = typeof MutationObserver === 'undefined' ? null : new MutationObserver(scheduleObserveSections);
    mutationObserver?.observe(root, { childList: true, subtree: true });

    window.addEventListener('observatorio:navigate', onNavigate);
    return () => {
      observer.disconnect();
      mutationObserver?.disconnect();
      if (observeRaf) window.cancelAnimationFrame(observeRaf);
      observedSections.clear();
      if (pendingNavigationTimerRef.current) window.clearTimeout(pendingNavigationTimerRef.current);
      pendingNavigationTimerRef.current = null;
      pendingNavigationRef.current = null;
      window.removeEventListener('observatorio:navigate', onNavigate);
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

  const closeTools = (restoreFocus = true) => {
    setToolsOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => toolsButtonRef.current?.focus());
  };

  const copyCurrentSectionLink = async () => {
    const url = buildCanonicalUrl(
      { [urlParamKeys.readingMode]: languageMode },
      activeSectionRef.current,
    );
    const copied = await copyText(url);
    if (!copied) return;

    setSectionLinkCopied(true);
    if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = window.setTimeout(() => {
      copiedTimerRef.current = null;
      setSectionLinkCopied(false);
    }, 1800);
  };

  useEffect(() => () => {
    if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
  }, []);

  return (
    <>
      <header className="site-header sticky top-0 z-40 border-b border-white/10 bg-[#0b1117]/90 backdrop-blur-xl light:bg-[#f5f7fa]/95" data-theme={theme}>
        <div className="site-header-inner mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <a href="#descubra" className="site-brand min-w-0 flex-1 md:flex-none" aria-label="Observatório, início">
            <span className="block truncate text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">Águas Lindas de Goiás</span>
            <span className="my-1 block h-px w-8 bg-slate-600/70" aria-hidden="true" />
            <span className="block truncate text-[15px] font-black tracking-tight text-white light:text-slate-900">Observatório</span>
          </a>

          <DesktopHeaderNavigation activeSection={activeSection} />

          <div
            className="site-header-status hidden items-center gap-1.5 rounded-full border border-slate-300/20 bg-slate-300/[0.06] px-2.5 py-1.5 text-[10px] font-bold text-slate-200 lg:flex"
            aria-label={'Versão local do conjunto publicada em ' + updatedAt + '; cada indicador pode ter data-base própria'}
            title="Data da versão local do conjunto; consulte a data-base e a captura informada para cada fonte"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" aria-hidden="true" />
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Versão {updatedAt}</span>
          </div>

          <div className="site-header-actions ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={cycleMode}
              className={'site-mode-shortcut md:hidden mode-' + languageMode}
              aria-label={'Modo de leitura atual: ' + (languageMode === 'summary' ? 'Resumo. Toque para mudar para Explicado.' : languageMode === 'simple' ? 'Explicado. Toque para mudar para Guiado.' : languageMode === 'guided' ? 'Guiado. Toque para mudar para Detalhado.' : 'Detalhado. Toque para mudar para Resumo.')}
              title="Mudar modo de leitura"
            >
              {languageMode === 'summary' ? <List aria-hidden="true" /> : languageMode === 'simple' ? <FileText aria-hidden="true" /> : languageMode === 'guided' ? <GraduationCap aria-hidden="true" /> : <Code2 aria-hidden="true" />}
              <span>{languageMode === 'summary' ? 'Resumo' : languageMode === 'simple' ? 'Explicado' : languageMode === 'guided' ? 'Guiado' : 'Detalhado'}</span>
            </button>
            <button type="button" onClick={() => { setShortcutGuideOpen(false); setSearchOpen(true); }} className="site-icon-button min-h-11 min-w-11 rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white light:text-slate-600 light:hover:bg-slate-900/5 light:hover:text-slate-900" aria-label="Buscar no observatório" aria-keyshortcuts="/ Control+K" data-search-trigger="primary">
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="hidden xl:block"><ContrastModeToggle /></div>
            <button type="button" onClick={toggle} className="site-icon-button desktop-theme-toggle min-h-11 min-w-11 rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white light:text-slate-600 light:hover:bg-slate-900/5 light:hover:text-slate-900" aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}>
              {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button ref={toolsButtonRef} type="button" onClick={() => setToolsOpen(value => !value)} className="site-tools-button min-h-11 min-w-11 rounded-xl border border-white/10 bg-white/[0.025] p-2 text-slate-300 hover:bg-white/5 md:hidden" aria-expanded={toolsOpen} aria-controls="mobile-tools" aria-label={toolsOpen ? 'Fechar menu' : 'Abrir menu'}>
              {toolsOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div className="header-reading-mode civic-reading-row hidden md:block"><span className="civic-reading-caption">Como você quer ler?</span><LanguageModeToggle /></div>

        {toolsOpen && (
          <div ref={toolsPanelRef} id="mobile-tools" className="mobile-tools-sheet border-t border-white/10 px-4 py-3 md:hidden" role="dialog" aria-modal="false" aria-label="Menu e ferramentas">
            <div className="mobile-tools-grid">
              <div className="mobile-tools-mode">
                <div className="mobile-tools-meta">
                  <span className="mobile-tools-label">Leitura</span>
                  <span className="mobile-tools-updated">
                    <CalendarDays className="h-3 w-3" aria-hidden="true" />
                    Versão local · {updatedAt}
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
                <button type="button" onClick={() => { window.dispatchEvent(new CustomEvent('observatorio:search')); closeTools(false); }} className="mobile-tool-action">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span>Buscar áreas</span>
                </button>
                <button type="button" onClick={copyCurrentSectionLink} className="mobile-tool-action">
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                  <span>{sectionLinkCopied ? 'Link copiado' : 'Copiar link da seção'}</span>
                </button>
                <span className="sr-only" aria-live="polite">{sectionLinkCopied ? 'Link da seção copiado' : ''}</span>
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
