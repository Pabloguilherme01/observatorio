import { lazy, Suspense, type ComponentType, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '../components/layout/Header';
import { ScrollTopButton } from '../components/layout/ScrollTopButton';
import { HeroCountdown } from '../components/sections/HeroCountdown';
import { DashboardMetrics } from '../components/sections/DashboardMetrics';
import { ThemeProvider } from '../context/ThemeContext';
import { ExperienceShell } from '../components/ExperienceShell';
import { LanguageModeProvider } from '../context/LanguageModeContext';
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
  return true;
}

function navigateToHash(hash: string) {
  if (!hash) return;
  window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: hash }));
  window.requestAnimationFrame(() => {
    performHashScroll(hash);
  });
}

function DeferredBlock({
  loader,
  anchorIds,
}: {
  readonly loader: () => Promise<{ default: ComponentType }>;
  readonly anchorIds: readonly string[];
}) {
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialHash = window.location.hash.slice(1);
    const activate = () => setReady(true);
    if (anchorIds.includes(initialHash)) activate();

    const onNavigate = (event: Event) => {
      const targetId = (event as CustomEvent<string>).detail;
      if (anchorIds.includes(targetId)) activate();
    };

    window.addEventListener('observatorio:navigate', onNavigate);

    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      activate();
    } else {
      const observer = new IntersectionObserver(
        entries => {
          if (entries.some(entry => entry.isIntersecting)) {
            activate();
            observer.disconnect();
          }
        },
        { rootMargin: '320px 0px' },
      );
      observer.observe(node);
      return () => {
        observer.disconnect();
        window.removeEventListener('observatorio:navigate', onNavigate);
      };
    }

    return () => window.removeEventListener('observatorio:navigate', onNavigate);
  }, [anchorIds]);

  useEffect(() => {
    if (!ready) return;
    const hash = window.location.hash.slice(1);
    if (!anchorIds.includes(hash)) return;
    const frame = window.requestAnimationFrame(() => {
      // O App já anunciou a navegação. Quando o bloco tardio monta, apenas
      // completa a rolagem, sem disparar o evento novamente.
      performHashScroll(hash);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [ready, anchorIds]);

  const Component = useMemo(() => lazy(loader), [loader]);

  if (!ready) return <div ref={ref} className="min-h-24" aria-hidden="true" />;

  return (
    <div ref={ref}>
      <Deferred><Component /></Deferred>
    </div>
  );
}

export function App() {
  useEffect(() => {
    const navigateFromLocation = () => {
      const hash = window.location.hash.slice(1);
      if (hash) navigateToHash(hash);
    };
    navigateFromLocation();
    window.addEventListener('hashchange', navigateFromLocation);
    return () => window.removeEventListener('hashchange', navigateFromLocation);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">Pular para o conteúdo principal</a>
      <LanguageModeProvider>
      <ThemeProvider>
        <ExperienceShell>
          <SectionErrorBoundary label="Cabeçalho"><Header /></SectionErrorBoundary>
          <SectionErrorBoundary label="Resumo inicial"><HeroCountdown /></SectionErrorBoundary>
          <main id="main-content">
            <SectionErrorBoundary label="Exploração"><AudienceHub /></SectionErrorBoundary>
            <SectionErrorBoundary label="Resumo executivo"><ExecutiveSummary /></SectionErrorBoundary>
            <SectionErrorBoundary label="Dashboard"><div id="analise" className="scroll-mt-24"><DashboardMetrics /></div></SectionErrorBoundary>
            <DeferredBlock loader={loadContextGroup} anchorIds={['contexto', 'eleitorado', 'demografia', 'transporte', 'saude', 'insights', 'rotas', 'healgo', 'heal-beds', 'perfil-etario', 'quiz']} />
            <DeferredBlock loader={loadCivicGroup} anchorIds={['politica', 'candidaturas', 'linha-do-tempo', 'eleitoral360', 'acao']} />
            <DeferredBlock loader={loadElectionGroup} anchorIds={['orcamento', 'orcamento-impacto']} />
            <DeferredBlock loader={loadPublicDataGroup} anchorIds={['dados', 'instagram']} />
            <DeferredBlock loader={loadTrustGroup} anchorIds={['principios']} />
            <DeferredBlock loader={loadEvidenceGroup} anchorIds={['qualidade', 'evidencias', 'fontes']} />
          </main>
          <SectionErrorBoundary label="Controles de navegação"><ScrollTopButton /></SectionErrorBoundary>
          <SectionErrorBoundary label="Inspetor de dados"><DataInspector /></SectionErrorBoundary>
        </ExperienceShell>
      </ThemeProvider>
      </LanguageModeProvider>
    </>
  );
}
