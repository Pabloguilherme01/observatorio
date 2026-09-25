import { useLanguageMode } from '../../context/LanguageModeContext';
import { FreshnessBanner } from './FreshnessBanner';
import { SnapshotChanges } from './SnapshotChanges';
import { ResultsLiveBanner } from './ResultsLiveBanner';
import { ContextComparison } from './ContextComparison';
import { ElectoralProfile } from './ElectoralProfile';
import { DemographicDynamic } from './DemographicDynamic';
import { TransportCalculator } from '../TransportCalculator';
import { SanitationHealthSection } from './SanitationHealthSection';
import { QuickQuiz } from './QuickQuiz';

export default function DeferredContextGroup() {
  const { mode } = useLanguageMode();
  const technical = mode === 'technical';
  const summary = mode === 'summary';

  return <>
    <FreshnessBanner />
    <ResultsLiveBanner />

    {!summary && <DemographicDynamic />}
    {!summary && <TransportCalculator />}
    {!summary && <SanitationHealthSection />}
    {!summary && <QuickQuiz />}

    {technical && <SnapshotChanges />}
    {technical && <ContextComparison />}
    {technical && <ElectoralProfile />}
  </>;
}
