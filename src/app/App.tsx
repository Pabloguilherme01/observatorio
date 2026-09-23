import { lazy } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ScrollTopButton } from '../components/layout/ScrollTopButton';
import { HeroCountdown } from '../components/sections/HeroCountdown';
import { ThemeProvider } from '../context/ThemeContext';
import { DataInspector } from '../components/DataInspector';
import { ExperienceShell } from '../components/ExperienceShell';
import { LanguageModeProvider } from '../context/LanguageModeContext';
import { ProvenanceDrawer } from '../components/ProvenanceDrawer';
import { DataUpdateToast } from '../components/DataUpdateToast';
import { DeferredSection } from '../components/DeferredSection';

const LazyAudienceHub = lazy(() => import('../components/AudienceHub').then(module => ({ default: module.AudienceHub })));
const LazyQuickQuiz = lazy(() => import('../components/sections/QuickQuiz').then(module => ({ default: module.QuickQuiz })));
const LazyProjectTrustPanel = lazy(() => import('../components/ProjectTrustPanel').then(module => ({ default: module.ProjectTrustPanel })));
const LazyDataHealthPanel = lazy(() => import('../components/sections/DataHealthPanel').then(module => ({ default: module.DataHealthPanel })));
const LazyExecutiveSummary = lazy(() => import('../components/sections/ExecutiveSummary').then(module => ({ default: module.ExecutiveSummary })));
const LazyFreshnessBanner = lazy(() => import('../components/sections/FreshnessBanner').then(module => ({ default: module.FreshnessBanner })));
const LazySnapshotChanges = lazy(() => import('../components/sections/SnapshotChanges').then(module => ({ default: module.SnapshotChanges })));
const LazyResultsLiveBanner = lazy(() => import('../components/sections/ResultsLiveBanner').then(module => ({ default: module.ResultsLiveBanner })));
const LazyDashboardMetrics = lazy(() => import('../components/sections/DashboardMetrics').then(module => ({ default: module.DashboardMetrics })));
const LazyContextComparison = lazy(() => import('../components/sections/ContextComparison').then(module => ({ default: module.ContextComparison })));
const LazyElectoralProfile = lazy(() => import('../components/sections/ElectoralProfile').then(module => ({ default: module.ElectoralProfile })));
const LazyDemographicDynamic = lazy(() => import('../components/sections/DemographicDynamic').then(module => ({ default: module.DemographicDynamic })));
const LazyTransportCalculator = lazy(() => import('../components/TransportCalculator').then(module => ({ default: module.TransportCalculator })));
const LazyDataInsights = lazy(() => import('../components/sections/DataInsights').then(module => ({ default: module.DataInsights })));
const LazySanitationHealthSection = lazy(() => import('../components/sections/SanitationHealthSection').then(module => ({ default: module.SanitationHealthSection })));
const LazyPoliticalRadar = lazy(() => import('../components/sections/PoliticalRadar').then(module => ({ default: module.PoliticalRadar })));
const LazyPoliticalResearch = lazy(() => import('../components/sections/PoliticalResearch').then(module => ({ default: module.PoliticalResearch })));
const LazyElectionTimeline = lazy(() => import('../components/sections/ElectionTimeline').then(module => ({ default: module.ElectionTimeline })));
const LazyElectoral360 = lazy(() => import('../components/sections/Electoral360').then(module => ({ default: module.Electoral360 })));
const LazyCivicActionHub = lazy(() => import('../components/sections/CivicActionHub').then(module => ({ default: module.CivicActionHub })));
const LazyBudgetSection = lazy(() => import('../components/sections/BudgetSection').then(module => ({ default: module.BudgetSection })));
const LazyBudgetImpact = lazy(() => import('../components/sections/BudgetImpact').then(module => ({ default: module.BudgetImpact })));
const LazyCentral2026 = lazy(() => import('../components/sections/Central2026').then(module => ({ default: module.Central2026 })));
const LazyPublicDataPulse = lazy(() => import('../components/sections/PublicDataPulse').then(module => ({ default: module.PublicDataPulse })));
const LazyInstagramSyncHub = lazy(() => import('../components/InstagramSyncHub').then(module => ({ default: module.InstagramSyncHub })));
const LazyDataQualityPanel = lazy(() => import('../components/sections/DataQualityPanel').then(module => ({ default: module.DataQualityPanel })));
const LazyEvidenceChain = lazy(() => import('../components/sections/EvidenceChain').then(module => ({ default: module.EvidenceChain })));
const LazyDataExportActions = lazy(() => import('../components/DataExportActions').then(module => ({ default: module.DataExportActions })));
const LazyEvidenceMap = lazy(() => import('../components/sections/EvidenceMap').then(module => ({ default: module.EvidenceMap })));

export function App() {
  return (
    <LanguageModeProvider>
      <ThemeProvider>
        <ExperienceShell>
          <Header />
          <HeroCountdown />
          <main id="main-content" data-app-ready="true">
            <DeferredSection id="descubra" label="Descoberta" component={LazyAudienceHub} minHeight={360} />
            <DeferredSection label="Quiz rápido" component={LazyQuickQuiz} minHeight={420} />
            <DeferredSection label="Confiança do projeto" component={LazyProjectTrustPanel} minHeight={420} />
            <DeferredSection label="Saúde dos dados" component={LazyDataHealthPanel} minHeight={420} />
            <DeferredSection label="Resumo executivo" component={LazyExecutiveSummary} minHeight={640} />
            <DeferredSection label="Atualidade dos dados" component={LazyFreshnessBanner} minHeight={240} />
            <DeferredSection label="Mudanças do snapshot" component={LazySnapshotChanges} minHeight={420} />
            <DeferredSection label="Resultados ao vivo" component={LazyResultsLiveBanner} minHeight={260} />
            <DeferredSection id="dashboard" label="Painel de indicadores" component={LazyDashboardMetrics} minHeight={900} />
            <DeferredSection id="contexto" label="Comparador contextual" component={LazyContextComparison} minHeight={820} />
            <DeferredSection id="perfil" label="Perfil eleitoral" component={LazyElectoralProfile} minHeight={420} />
            <DeferredSection label="Dinâmica demográfica" component={LazyDemographicDynamic} minHeight={520} />
            <DeferredSection label="Mobilidade e transporte" component={LazyTransportCalculator} minHeight={520} />
            <DeferredSection id="dados" label="Insights de dados" component={LazyDataInsights} minHeight={520} />
            <DeferredSection label="Saúde" component={LazySanitationHealthSection} minHeight={520} />
            <DeferredSection label="Radar político" component={LazyPoliticalRadar} minHeight={520} />
            <DeferredSection label="Pesquisa política" component={LazyPoliticalResearch} minHeight={520} />
            <DeferredSection label="Linha do tempo eleitoral" component={LazyElectionTimeline} minHeight={520} />
            <DeferredSection id="eleitoral360" label="Eleitoral 360°" component={LazyElectoral360} minHeight={1400} />
            <DeferredSection id="acao" label="Ações cívicas" component={LazyCivicActionHub} minHeight={520} />
            <DeferredSection id="orcamento" label="Orçamento" component={LazyBudgetSection} minHeight={760} />
            <DeferredSection label="Impacto orçamentário" component={LazyBudgetImpact} minHeight={620} />
            <DeferredSection label="Central 2026" component={LazyCentral2026} minHeight={620} />
            <DeferredSection label="Pulso de dados públicos" component={LazyPublicDataPulse} minHeight={520} />
            <DeferredSection label="Integração social" component={LazyInstagramSyncHub} minHeight={440} />
            <DeferredSection id="qualidade" label="Qualidade dos dados" component={LazyDataQualityPanel} minHeight={520} />
            <DeferredSection id="evidencias" label="Cadeia de evidências" component={LazyEvidenceChain} minHeight={520} />
            <DeferredSection label="Exportação de dados" component={LazyDataExportActions} minHeight={280} />
            <DeferredSection label="Mapa de evidências" component={LazyEvidenceMap} minHeight={520} />
          </main>
          <Footer />
          <ScrollTopButton />
          <DataInspector />
          <ProvenanceDrawer />
          <DataUpdateToast />
        </ExperienceShell>
      </ThemeProvider>
    </LanguageModeProvider>
  );
}
