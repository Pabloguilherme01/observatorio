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
import { DiscoveryHub } from '../components/DiscoveryHub';

export function App() {
  return (
    <ThemeProvider>
      <ExperienceShell>
        <Header />
        <HeroCountdown />
        <main id="main-content">
          <DiscoveryHub />
          <DashboardMetrics />
          <ElectoralProfile />
          <TransportCalculator />
          <DataInsights />
          <SanitationHealthSection />
          <PoliticalRadar />
          <PoliticalResearch />
          <ElectionTimeline />
          <SnapshotChanges />
          <Electoral360 />
          <BudgetSection />
          <Central2026 />
          <PublicDataPulse />
          <DataQualityPanel />
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><DataExportActions /></div>
          <EvidenceMap />
        </main>
        <Footer />
        <ScrollTopButton />
        <DataInspector />
      </ExperienceShell>
    </ThemeProvider>
  );
}
