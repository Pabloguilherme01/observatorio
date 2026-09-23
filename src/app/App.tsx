import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ScrollTopButton } from '../components/layout/ScrollTopButton';
import { HeroCountdown } from '../components/sections/HeroCountdown';
import { DashboardMetrics } from '../components/sections/DashboardMetrics';
import { ElectoralProfile } from '../components/sections/ElectoralProfile';
import { TransportCalculator } from '../components/TransportCalculator';
import { SanitationHealthSection } from '../components/sections/SanitationHealthSection';
import { PoliticalRadar } from '../components/sections/PoliticalRadar';
import { PoliticalResearch } from '../components/sections/PoliticalResearch';
import { Central2026 } from '../components/sections/Central2026';
import { DataQualityPanel } from '../components/sections/DataQualityPanel';
import { BudgetSection } from '../components/sections/BudgetSection';
import { DataExportActions } from '../components/DataExportActions';
import { EvidenceMap } from '../components/sections/EvidenceMap';
import { ThemeProvider } from '../context/ThemeContext';
import { DataInsights } from '../components/sections/DataInsights';
import { PublicDataPulse } from '../components/sections/PublicDataPulse';
import { Electoral360 } from '../components/sections/Electoral360';
import { SnapshotChanges } from '../components/sections/SnapshotChanges';
import { ElectionTimeline } from '../components/sections/ElectionTimeline';
import { DataInspector } from '../components/DataInspector';
import { ExperienceShell } from '../components/ExperienceShell';
import { DemographicDynamic } from '../components/sections/DemographicDynamic';
import { BudgetImpact } from '../components/sections/BudgetImpact';
import { ExecutiveSummary } from '../components/sections/ExecutiveSummary';
import { FreshnessBanner } from '../components/sections/FreshnessBanner';
import { ResultsLiveBanner } from '../components/sections/ResultsLiveBanner';
import { EvidenceChain } from '../components/sections/EvidenceChain';
import { ContextComparison } from '../components/sections/ContextComparison';
import { CivicActionHub } from '../components/sections/CivicActionHub';
import { LanguageModeProvider } from '../context/LanguageModeContext';
import { AudienceHub } from '../components/AudienceHub';
import { InstagramSyncHub } from '../components/InstagramSyncHub';

export function App() {
  return (
    <LanguageModeProvider>
      <ThemeProvider>
        <ExperienceShell>
          <Header />
          <HeroCountdown />
          <main id="main-content">
            <AudienceHub />
            <InstagramSyncHub />
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
            <DataQualityPanel />
            <EvidenceChain />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><DataExportActions /></div>
            <EvidenceMap />
          </main>
          <Footer />
          <ScrollTopButton />
          <DataInspector />
        </ExperienceShell>
      </ThemeProvider>
    </LanguageModeProvider>
  );
}
