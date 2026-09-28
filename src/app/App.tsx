import { lazy, Suspense, type ComponentType, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { DashboardMetrics } from '../components/sections/DashboardMetrics';
import { Header } from '../components/layout/Header';
import { ScrollTopButton } from '../components/layout/ScrollTopButton';
import { HeroCountdown } from '../components/sections/HeroCountdown';
import { ResultsLiveBanner } from '../components/sections/ResultsLiveBanner';
import { ThemeProvider } from '../context/ThemeContext';
import { ContrastProvider } from '../context/ContrastContext';
import { ExperienceShell } from '../components/ExperienceShell';
import { LanguageModeProvider, useLanguageMode } from '../context/LanguageModeContext';
import { AudienceHub } from '../components/AudienceHub';
import { ExecutiveSummary } from '../components/sections/ExecutiveSummary';
import { GuidedLearningPanel } from '../components/sections/GuidedLearningPanel';
import { PublicUtilityGuide } from '../components/sections/PublicUtilityGuide';
import { DataInspector } from '../components/DataInspector';
import DeferredEvidenceGroup from '../components/sections/DeferredEvidenceGroup';
import { Footer } from '../components/layout/Footer';
import { SectionErrorBoundary } from '../components/system/SectionErrorBoundary';
import '../assets/styles/final-ui.css';
import '../assets/styles/responsive-type.css';
import '../assets/styles/guided-mode.css';
import { modeForDestination } from '../config/readingModes';
import { getReadingModeParam, getSearchParam, urlParamKeys } from '../lib/urlState';

const loadContextGroup = () => import('../components/sections/DeferredContextGroup');
const loadCivicGroup = () => import('../components/sections/DeferredCivicGroup');
const loadElectionGroup = () => import('../components/sections/DeferredElectionGroup');
const loadPublicDataGroup = () => import('../components/sections/DeferredPublicDataGroup');

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

function performHashScroll(hash: string, behaviorOverride?: ScrollBehavior) {
  if (!hash) return false;
  const target = document.getElementById(hash);
  if (!target) return false;
  const reduceMotion = document.documentElement.classList.contains('reduced-motion')
    || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({
    behavior: behaviorOverride ?? (reduceMotion ? 'auto' : 'smooth'),
    block: 'start',
  });
  if (target instanceof HTMLElement) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    window.setTimeout(() => {
      const active = document.activeElement;
      const focusIsUnclaimed = !active || active === document.body || active === document.documentElement || active === target;
      if (focusIsUnclaimed) target.focus({ preventScroll: true });
    }, behaviorOverride === 'auto' || reduceMotion ? 0 : 180);
  }
  return true;
}

function stabilizeHistoryScroll(hash: string) {
  if (!hash) return;
  scrollToHashWhenReady(hash);

  const align = () => {
    if (window.location.hash.slice(1) !== hash) return;
    performHashScroll(hash, 'auto');
  };

  window.requestAnimationFrame(() => window.requestAnimationFrame(align));
  window.setTimeout(align, 360);
  window.setTimeout(align, 900);
}

function openDeepLinkedInspectorWhenReady() {
  const inspectId = getSearchParam(urlParamKeys.inspector);
  if (!inspectId) return;

  const root = document.getElementById('main-content') ?? document.body;
  let observer: MutationObserver | null = null;
  let timeoutId = 0;
  let checkRaf = 0;
  let opened = false;

  const cleanup = () => {
    observer?.disconnect();
    if (timeoutId) window.clearTimeout(timeoutId);
    if (checkRaf) window.cancelAnimationFrame(checkRaf);
  };

  const check = () => {
    checkRaf = 0;
    if (opened) return;
    const target = Array.from(document.querySelectorAll<HTMLElement>('[data-inspect-id]'))
      .find(node => node.dataset.inspectId === inspectId);
    if (!target) return;
    opened = true;
    target.click();
    cleanup();
  };

  const scheduleCheck = () => {
    if (checkRaf || opened) return;
    checkRaf = window.requestAnimationFrame(check);
  };

  observer = typeof MutationObserver === 'undefined' ? null : new MutationObserver(scheduleCheck);
  observer?.observe(root, { childList: true, subtree: true });
  timeoutId = window.setTimeout(cleanup, 6000);
  scheduleCheck();
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

function NavigationModeBridge() {
  const { mode, setMode } = useLanguageMode();
  const initialSharedModeHandled = useRef(false);

  useEffect(() => {
    if (!initialSharedModeHandled.current) {
      initialSharedModeHandled.current = true;
      const requestedMode = getReadingModeParam();
      if (requestedMode && requestedMode !== mode) {
        setMode(requestedMode);
        return;
      }
    }

    const prepareMode = (target: string) => {
      if (!target) return;
      const nextMode = modeForDestination(target, mode);
      if (nextMode !== mode) setMode(nextMode);
    };

    const onNavigate = (event: Event) => {
      prepareMode((event as CustomEvent<string>).detail ?? '');
    };
    const restoreHistoryDestination = () => {
      const target = window.location.hash.slice(1);
      prepareMode(target);
      if (!target) return;
      // hashchange already dispatches observatorio:navigate for history entries.
      // Keep popstate responsible only for mode restoration and scrolling so
      // Back/Forward emits a single navigation event.
      stabilizeHistoryScroll(target);
    };

    window.addEventListener('observatorio:navigate', onNavigate);
    window.addEventListener('popstate', restoreHistoryDestination);
    restoreHistoryDestination();

    return () => {
      window.removeEventListener('observatorio:navigate', onNavigate);
      window.removeEventListener('popstate', restoreHistoryDestination);
    };
  }, [mode, setMode]);

  return null;
}

function DeferredBlock({
  loader,
  anchorIds,
  errorLabel,
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
      <SectionErrorBoundary label={errorLabel}>
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
    openDeepLinkedInspectorWhenReady();
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
            <SectionErrorBoundary label="Resultados oficiais"><ResultsLiveBanner /></SectionErrorBoundary>
            <SectionErrorBoundary label="Resumo principal"><ExecutiveSummary /></SectionErrorBoundary>
            <SectionErrorBoundary label="Aprendizado guiado"><GuidedLearningPanel /></SectionErrorBoundary>
            <SectionErrorBoundary label="Guia de utilidade pública"><PublicUtilityGuide /></SectionErrorBoundary>
            <SectionErrorBoundary label="Exploração"><AudienceHub /></SectionErrorBoundary>
            <div id="analise" className="min-h-24"><SectionErrorBoundary label="Dashboard"><DashboardMetrics /></SectionErrorBoundary></div>
            <div className="mode-scope mode-scope-context"><DeferredBlock loader={loadContextGroup} errorLabel="Contexto, eleitorado e ferramentas" anchorIds={['contexto', 'eleitorado', 'demografia', 'transporte', 'saude', 'quiz']} /></div>
            <div className="mode-scope mode-scope-civic"><DeferredBlock loader={loadCivicGroup} errorLabel="Eleitoral e participação" anchorIds={['politica', 'candidaturas', 'linha-do-tempo', 'eleitoral360', 'acao']} /></div>
            <div className="mode-scope mode-scope-election"><DeferredBlock loader={loadElectionGroup} errorLabel="Orçamento e impacto fiscal" anchorIds={['orcamento', 'orcamento-impacto']} /></div>
            <div className="mode-scope mode-scope-public"><DeferredBlock loader={loadPublicDataGroup} errorLabel="Dados públicos" anchorIds={['dados']} /></div>
            <div className="mode-scope mode-scope-evidence"><SectionErrorBoundary label="Qualidade e evidências"><DeferredEvidenceGroup /></SectionErrorBoundary></div>
          </main>
          <SectionErrorBoundary label="Controles de navegação"><ScrollTopButton /></SectionErrorBoundary>
          <SectionErrorBoundary label="Inspetor de dados"><DataInspector /></SectionErrorBoundary>
          <Footer />
        </ExperienceShell>
        </ContrastProvider>
      </ThemeProvider>
      </LanguageModeProvider>
    </>
  );
}
