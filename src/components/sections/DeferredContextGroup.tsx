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

  return <>
    <FreshnessBanner />
    {mode === 'technical' && <SnapshotChanges />}
    <ResultsLiveBanner />
    <ContextComparison />
    <ElectoralProfile />
    <DemographicDynamic />
    <TransportCalculator />
    <SanitationHealthSection />
    <QuickQuiz />
  </>;
}
