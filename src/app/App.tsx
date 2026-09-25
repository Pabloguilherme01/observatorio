import { lazy, Suspense, type ComponentType, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '../components/layout/Header';
import { ScrollTopButton } from '../components/layout/ScrollTopButton';
import { HeroCountdown } from '../components/sections/HeroCountdown';
import { DashboardMetrics } from '../components/sections/DashboardMetrics';
import { ThemeProvider } from '../context/ThemeContext';
import { ContrastProvider } from '../context/ContrastContext';
import { ExperienceShell } from '../components/ExperienceShell';
import { LanguageModeProvider, useLanguageMode } from '../context/LanguageModeContext';
import { AudienceHub } from '../components/AudienceHub';
import { ExecutiveSummary } from '../components/sections/ExecutiveSummary';
import { DataInspector } from '../components/DataInspector';
import { SectionErrorBoundary } from '../components/system/SectionErrorBoundary';

const loadContextGroup = () => import('../components/sections/DeferredContextGroup');
const loadCivicGroup = () => import('../components/sections/DeferredCivicGroup');
const loadElectionGroup = () => import('../components/sections/DeferredElectionGroup');
const loadPublicDataGroup = () => import('../components/sections/DeferredPublicDataGroup');
const loadEvidenceGroup = () => import('../components/sections/DeferredEvidenceGroup');
const loadTrustGroup = () => import('../components/sections/DeferredTrustGroup');

function Deferred({ children }: { readonly children: ReactNode }) {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-hidden="true">
        <div className="h-28 animate-pulse rounded-2xl border border-white/8 bg-white/[0.025]" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

function navigateToHash(hash: string) {
  if (!hash) return;
  window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: hash }));
}

function performHashScroll(hash: string) {
  if (!hash) return false;
  const target = document.getElementById(hash);
  if (!target) return false;
  const reduceMotion = document.documentElement.classList.contains('reduced-motion')
    || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start',
  });
  if (target instanceof HTMLElement) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    window.setTimeout(() => target.focus({ preventScroll: true }), reduceMotion ? 0 : 180);
  }
  return true;
}

function scrollToHashWhenReady(hash: string) {
  if (!hash) return;
  if (performHashScroll(hash)) return;

  const root = document.getElementById('main-content') ?? document.body;
  let observer: MutationObserver | null = null;
  let timeoutId = 0;
  let checkRaf = 0;

  const cleanup = () => {
    observer?.disconnect();
    if (timeoutId) window.clearTimeout(timeoutId);
    if (checkRaf) window.cancelAnimationFrame(checkRaf);
  };

  const check = () => {
    checkRaf = 0;
    if (performHashScroll(hash)) cleanup();
  };

  const scheduleCheck = () => {
    if (checkRaf) return;
    checkRaf = window.requestAnimationFrame(check);
  };

  if (typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(scheduleCheck);
    observer.observe(root, { childList: true, subtree: true });
    timeoutId = window.setTimeout(cleanup, 4000);
  }

  scheduleCheck();
}

const TECHNICAL_ONLY_DESTINATIONS = new Set(['principios', 'qualidade', 'evidencias', 'fontes']);
const SUMMARY_DESTINATIONS = new Set(['resumo']);

function NavigationModeBridge() {
  const { mode, setMode } = useLanguageMode();

  useEffect(() => {
    const prepareMode = (target: string) => {
      if (!target || target === 'descubra' || target === 'dashboard') return;
      if (SUMMARY_DESTINATIONS.has(target)) {
        if (mode !== 'summary') setMode('summary');
        return;
      }
      if (TECHNICAL_ONLY_DESTINATIONS.has(target)) {
        if (mode !== 'technical') setMode('technical');
        return;
      }
      if (mode === 'summary') setMode('simple');
    };

    const onNavigate = (event: Event) => {
      prepareMode((event as CustomEvent<string>).detail ?? '');
    };
    const onHashChange = () => prepareMode(window.location.hash.slice(1));

    window.addEventListener('observatorio:navigate', onNavigate);
    window.addEventListener('hashchange', onHashChange);
    onHashChange();

    return () => {
      window.removeEventListener('observatorio:navigate', onNavigate);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [mode, setMode]);

  return null;
}

function DeferredBlock({
  loader,
  anchorIds,
}: {
  readonly loader: () => Promise<{ default: ComponentType }>;
  readonly anchorIds: readonly string[];
  readonly errorLabel: string;
}) {
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialHash = window.location.hash.slice(1);
    let observer: IntersectionObserver | null = null;
    let active = false;

    const cleanup = () => {
      observer?.disconnect();
      observer = null;
      window.removeEventListener('observatorio:navigate', onNavigate);
    };

    const activate = () => {
      if (active) return;
      active = true;
      setReady(true);
      cleanup();
    };

    const onNavigate = (event: Event) => {
      const targetId = (event as CustomEvent<string>).detail;
      if (anchorIds.includes(targetId)) activate();
    };

    window.addEventListener('observatorio:navigate', onNavigate);

    if (anchorIds.includes(initialHash)) {
      activate();
    } else {
      const node = ref.current;
      if (!node || typeof IntersectionObserver === 'undefined') {
        activate();
      } else {
        observer = new IntersectionObserver(
          entries => {
            if (entries.some(entry => entry.isIntersecting)) activate();
          },
          { rootMargin: '320px 0px' },
        );
        observer.observe(node);
      }
    }

    return cleanup;
  }, [anchorIds]);

  const Component = useMemo(() => lazy(loader), [loader]);

  if (!ready) return <div ref={ref} className="min-h-24" aria-hidden="true" />;

  return (
    <div ref={ref} className="deferred-section">
      <SectionErrorBoundary label="Seção carregada">
        <Deferred><Component /></Deferred>
      </SectionErrorBoundary>
    </div>
  );
}

export function App() {
  useEffect(() => {
    const navigateFromLocation = () => {
      const hash = window.location.hash.slice(1);
      if (hash) navigateToHash(hash);
    };
    const onNavigate = (event: Event) => {
      const hash = (event as CustomEvent<string>).detail;
      if (hash) scrollToHashWhenReady(hash);
    };
    const onSameHashAnchor = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      const target = href.slice(1);
      if (!target || window.location.hash !== '#' + target) return;
      event.preventDefault();
      navigateToHash(target);
      scrollToHashWhenReady(target);
    };

    navigateFromLocation();
    window.addEventListener('hashchange', navigateFromLocation);
    window.addEventListener('observatorio:navigate', onNavigate);
    document.addEventListener('click', onSameHashAnchor);
    return () => {
      window.removeEventListener('hashchange', navigateFromLocation);
      window.removeEventListener('observatorio:navigate', onNavigate);
      document.removeEventListener('click', onSameHashAnchor);
    };
  }, []);

  return (
    <>
      <LanguageModeProvider>
      <NavigationModeBridge />
      <ThemeProvider>
        <ContrastProvider>
        <ExperienceShell>
          <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>
          <SectionErrorBoundary label="Cabeçalho"><Header /></SectionErrorBoundary>
          <SectionErrorBoundary label="Resumo inicial"><HeroCountdown /></SectionErrorBoundary>
          <main id="main-content">
            <SectionErrorBoundary label="Resumo executivo"><ExecutiveSummary /></SectionErrorBoundary>
            <SectionErrorBoundary label="Exploração"><AudienceHub /></SectionErrorBoundary>
            <SectionErrorBoundary label="Dashboard"><div><div id="analise"><DashboardMetrics /></div></div></SectionErrorBoundary>
            <div className="mode-scope mode-scope-context"><DeferredBlock loader={loadContextGroup} errorLabel="Contexto, eleitorado e ferramentas" anchorIds={['contexto', 'eleitorado', 'demografia', 'transporte', 'saude', 'insights', 'rotas', 'healgo', 'heal-beds', 'perfil-etario', 'quiz']} /></div>
            <div className="mode-scope mode-scope-civic"><DeferredBlock loader={loadCivicGroup} errorLabel="Eleitoral e participação" anchorIds={['politica', 'candidaturas', 'linha-do-tempo', 'eleitoral360', 'acao']} /></div>
            <div className="mode-scope mode-scope-election"><DeferredBlock loader={loadElectionGroup} errorLabel="Orçamento e impacto fiscal" anchorIds={['orcamento', 'orcamento-impacto']} /></div>
            <div className="mode-scope mode-scope-public"><DeferredBlock loader={loadPublicDataGroup} errorLabel="Dados públicos e exportação" anchorIds={['dados', 'instagram', 'exportacao']} /></div>
            <div className="mode-scope mode-scope-trust"><DeferredBlock loader={loadTrustGroup} errorLabel="Princípios e governança" anchorIds={['principios']} /></div>
            <div className="mode-scope mode-scope-evidence"><DeferredBlock loader={loadEvidenceGroup} errorLabel="Qualidade e evidências" anchorIds={['qualidade', 'evidencias', 'fontes']} /></div>
          </main>
          <SectionErrorBoundary label="Controles de navegação"><ScrollTopButton /></SectionErrorBoundary>
          <SectionErrorBoundary label="Inspetor de dados"><DataInspector /></SectionErrorBoundary>
        </ExperienceShell>
        </ContrastProvider>
      </ThemeProvider>
      </LanguageModeProvider>
    </>
  );
}
