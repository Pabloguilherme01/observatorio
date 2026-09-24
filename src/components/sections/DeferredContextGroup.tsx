import { FreshnessBanner } from './FreshnessBanner';
import { SnapshotChanges } from './SnapshotChanges';
import { ResultsLiveBanner } from './ResultsLiveBanner';
import { ContextComparison } from './ContextComparison';
import { ElectoralProfile } from './ElectoralProfile';
import { DemographicDynamic } from './DemographicDynamic';
import { TransportCalculator } from '../TransportCalculator';
import { DataInsights } from './DataInsights';
import { SanitationHealthSection } from './SanitationHealthSection';
import { QuickQuiz } from './QuickQuiz';

export default function DeferredContextGroup() {
  return <>
    <FreshnessBanner />
    <SnapshotChanges />
    <ResultsLiveBanner />
    <ContextComparison />
    <ElectoralProfile />
    <DemographicDynamic />
    <TransportCalculator />
    <DataInsights />
    <SanitationHealthSection />
    <section id="quiz" className="scroll-mt-24">
      <QuickQuiz />
    </section>
  </>;
}
