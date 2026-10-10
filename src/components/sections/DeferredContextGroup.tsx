import { useLanguageMode } from '../../context/LanguageModeContext';
import { FreshnessBanner } from './FreshnessBanner';
import { ContextComparison } from './ContextComparison';
import { DemographicDynamic } from './DemographicDynamic';
import { TransportCalculator } from '../TransportCalculator';
import { SanitationHealthSection } from './SanitationHealthSection';

export default function DeferredContextGroup() {
  const { mode } = useLanguageMode();
  const technical = mode === 'technical';
  const summary = mode === 'summary';

  return <>
    <FreshnessBanner />
    {!summary && <DemographicDynamic />}
    {!summary && <TransportCalculator />}
    {!summary && <SanitationHealthSection />}

    {technical && <ContextComparison />}
  </>;
}
