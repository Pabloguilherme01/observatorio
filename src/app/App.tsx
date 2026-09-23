import { lazy, Suspense, type ComponentType, useEffect, useRef, useState } from 'react';
import { Header } from '../components/layout/Header';
import { ScrollTopButton } from '../components/layout/ScrollTopButton';
import { HeroCountdown } from '../components/sections/HeroCountdown';
import { DashboardMetrics } from '../components/sections/DashboardMetrics';
import { ThemeProvider } from '../context/ThemeContext';
import { ExperienceShell } from '../components/ExperienceShell';
import { LanguageModeProvider } from '../context/LanguageModeContext';
import { AudienceHub } from '../components/AudienceHub';
import { QuickQuiz } from '../components/sections/QuickQuiz';
import { ProjectTrustPanel } from '../components/ProjectTrustPanel';
import { ExecutiveSummary } from '../components/sections/ExecutiveSummary';
import { DataInspector } from '../components/DataInspector';

const loadContextGroup = () => import('../components/sections/DeferredContextGroup');
const loadCivicGroup = () => import('../components/sections/DeferredCivicGroup');
const loadElectionGroup = () => import('../components/sections/DeferredElectionGroup');
const loadPublicDataGroup = () => import('../components/sections/DeferredPublicDataGroup');
const loadEvidenceGroup = () => import('../components/sections/DeferredEvidenceGroup');

function Deferred({ children }: { readonly children: React.ReactNode }) {
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
}: {
  readonly loader: () => Promise<{ default: ComponentType }>;
}) {
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    return () => observer.disconnect();
  }, []);

  if (!ready) return <div ref={ref} className="min-h-24" aria-hidden="true" />;

  const Component = lazy(loader);
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
            <QuickQuiz />
            <ProjectTrustPanel />
            <ExecutiveSummary />
            <DashboardMetrics />
            <DeferredBlock loader={loadContextGroup} />
            <DeferredBlock loader={loadCivicGroup} />
            <DeferredBlock loader={loadElectionGroup} />
            <DeferredBlock loader={loadPublicDataGroup} />
            <DeferredBlock loader={loadEvidenceGroup} />
          </main>
          <ScrollTopButton />
          <DataInspector />
        </ExperienceShell>
      </ThemeProvider>
    </LanguageModeProvider>
  );
}
