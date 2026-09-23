import { Suspense, lazy } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ScrollTopButton } from '../components/layout/ScrollTopButton';
import { HeroCountdown } from '../components/sections/HeroCountdown';
import { DashboardMetrics } from '../components/sections/DashboardMetrics';
import { DataExportActions } from '../components/DataExportActions';
import { ThemeProvider } from '../context/ThemeContext';
import { DataInspector } from '../components/DataInspector';
import { ExperienceShell } from '../components/ExperienceShell';
import { ExecutiveSummary } from '../components/sections/ExecutiveSummary';
import { FreshnessBanner } from '../components/sections/FreshnessBanner';
import { LanguageModeProvider } from '../context/LanguageModeContext';

const ElectoralProfile = lazy(() => import('../components/sections/ElectoralProfile').then((m) => ({ default: m.ElectoralProfile })));
const TransportCalculator = lazy(() => import('../components/TransportCalculator').then((m) => ({ default: m.TransportCalculator })));
const SanitationHealthSection = lazy(() => import('../components/sections/SanitationHealthSection').then((m) => ({ default: m.SanitationHealthSection })));
const PoliticalRadar = lazy(() => import('../components/sections/PoliticalRadar').then((m) => ({ default: m.PoliticalRadar })));
const PoliticalResearch = lazy(() => import('../components/sections/PoliticalResearch').then((m) => ({ default: m.PoliticalResearch })));
const Central2026 = lazy(() => import('../components/sections/Central2026').then((m) => ({ default: m.Central2026 })));
const DataQualityPanel = lazy(() => import('../components/sections/DataQualityPanel').then((m) => ({ default: m.DataQualityPanel })));
const BudgetSection = lazy(() => import('../components/sections/BudgetSection').then((m) => ({ default: m.BudgetSection })));
const EvidenceMap = lazy(() => import('../components/sections/EvidenceMap').then((m) => ({ default: m.EvidenceMap })));
const DataInsights = lazy(() => import('../components/sections/DataInsights').then((m) => ({ default: m.DataInsights })));
const PublicDataPulse = lazy(() => import('../components/sections/PublicDataPulse').then((m) => ({ default: m.PublicDataPulse })));
const Electoral360 = lazy(() => import('../components/sections/Electoral360').then((m) => ({ default: m.Electoral360 })));
const SnapshotChanges = lazy(() => import('../components/sections/SnapshotChanges').then((m) => ({ default: m.SnapshotChanges })));
const ElectionTimeline = lazy(() => import('../components/sections/ElectionTimeline').then((m) => ({ default: m.ElectionTimeline })));
const DemographicDynamic = lazy(() => import('../components/sections/DemographicDynamic').then((m) => ({ default: m.DemographicDynamic })));
const BudgetImpact = lazy(() => import('../components/sections/BudgetImpact').then((m) => ({ default: m.BudgetImpact })));
const ResultsLiveBanner = lazy(() => import('../components/sections/ResultsLiveBanner').then((m) => ({ default: m.ResultsLiveBanner })));
const EvidenceChain = lazy(() => import('../components/sections/EvidenceChain').then((m) => ({ default: m.EvidenceChain })));
const ContextComparison = lazy(() => import('../components/sections/ContextComparison').then((m) => ({ default: m.ContextComparison })));
const CivicActionHub = lazy(() => import('../components/sections/CivicActionHub').then((m) => ({ default: m.CivicActionHub })));
const AudienceHub = lazy(() => import('../components/AudienceHub').then((m) => ({ default: m.AudienceHub })));
const QuickQuiz = lazy(() => import('../components/sections/QuickQuiz').then((m) => ({ default: m.QuickQuiz })));
const InstagramSyncHub = lazy(() => import('../components/InstagramSyncHub').then((m) => ({ default: m.InstagramSyncHub })));
const ProjectTrustPanel = lazy(() => import('../components/ProjectTrustPanel').then((m) => ({ default: m.ProjectTrustPanel })));

function SectionFallback() {
  return (
    <div aria-hidden="true" className="mx-auto my-8 h-40 max-w-7xl animate-pulse rounded-xl bg-white/[0.03]" />
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
            <Suspense fallback={<SectionFallback />}>
            <AudienceHub />
            <QuickQuiz />
            <ProjectTrustPanel />
            <ExecutiveSummary />
            <FreshnessBanner />
            <SnapshotChanges />
            <ResultsLiveBanner />
            <DashboardMetrics />
            <ContextComparison />
            <ElectoralProfile />
            <DemographicDynamic />
            <TransportCalculator />
            <DataInsights />
            <SanitationHealthSection />
            <PoliticalRadar />
            <PoliticalResearch />
            <ElectionTimeline />
            <Electoral360 />
            <CivicActionHub />
            <BudgetSection />
            <BudgetImpact />
            <Central2026 />
            <PublicDataPulse />
            <InstagramSyncHub />
            <DataQualityPanel />
            <EvidenceChain />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><DataExportActions /></div>
            <EvidenceMap />
                      </Suspense>
          </main>
          <Footer />
          <ScrollTopButton />
          <DataInspector />
        </ExperienceShell>
      </ThemeProvider>
    </LanguageModeProvider>
  );
}
