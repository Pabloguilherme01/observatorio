import { FreshnessBanner } from './FreshnessBanner';
import { SnapshotChanges } from './SnapshotChanges';
import { ResultsLiveBanner } from './ResultsLiveBanner';
import { ContextComparison } from './ContextComparison';
import { ElectoralProfile } from './ElectoralProfile';
import { DemographicDynamic } from './DemographicDynamic';
import { TransportCalculator } from '../TransportCalculator';
import { DataInsights } from './DataInsights';
import { SanitationHealthSection } from './SanitationHealthSection';

const contextSections = [
  FreshnessBanner,
  SnapshotChanges,
  ResultsLiveBanner,
  ContextComparison,
  ElectoralProfile,
  DemographicDynamic,
  TransportCalculator,
  DataInsights,
  SanitationHealthSection,
];

export default function DeferredContextGroup() {
  return (
    <>
      {contextSections.map((Section) => (
        <Section key={Section.name} />
      ))}
    </>
  );
}
