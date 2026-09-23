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
    if (anchorIds.includes(initialHash)) setReady(true);
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '900px 0px' },
    );
    observer.observe(node);

    const onNavigate = (event: Event) => {
      const targetId = (event as CustomEvent<string>).detail;
      if (anchorIds.includes(targetId)) setReady(true);
    };
    window.addEventListener('observatorio:navigate', onNavigate);
    return () => {
      observer.disconnect();
      window.removeEventListener('observatorio:navigate', onNavigate);
    };
  }, [anchorIds]);

  useEffect(() => {
    if (!ready) return;
    const hash = window.location.hash.slice(1);
    if (!anchorIds.includes(hash)) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: document.documentElement.classList.contains('reduced-motion')
          || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [ready, anchorIds]);

  if (!ready) return <div ref={ref} className="min-h-24" aria-hidden="true" />;

  const Component = useMemo(() => lazy(loader), [loader]);
  return (
    <div ref={ref}>
      <Deferred><Component /></Deferred>
    </div>
  );
}

export function App() {
  return (
    <LanguageModeProvider>
      <ThemeProvider>
        <ExperienceShell>
          <Header />
          <HeroCountdown />
          <main id="main-content">
            <AudienceHub />
            <ExecutiveSummary />
            <DashboardMetrics />
            <DeferredBlock loader={loadContextGroup} anchorIds={['contexto', 'eleitorado', 'demografia', 'transporte', 'saude', 'insights', 'rotas', 'healgo', 'heal-beds', 'perfil-etario', 'quiz']} />
            <DeferredBlock loader={loadCivicGroup} anchorIds={['politica', 'candidaturas', 'linha-do-tempo', 'eleitoral360', 'acao']} />
            <DeferredBlock loader={loadElectionGroup} anchorIds={['orcamento', 'orcamento-impacto']} />
            <DeferredBlock loader={loadPublicDataGroup} anchorIds={['dados', 'instagram']} />
            <DeferredBlock loader={loadTrustGroup} anchorIds={['principios']} />
            <DeferredBlock loader={loadEvidenceGroup} anchorIds={['qualidade', 'evidencias', 'fontes']} />
          </main>
          <ScrollTopButton />
          <DataInspector />
        </ExperienceShell>
      </ThemeProvider>
    </LanguageModeProvider>
  );
}
