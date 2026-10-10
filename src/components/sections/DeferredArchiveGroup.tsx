import { useLanguageMode } from '../../context/LanguageModeContext';
import { ResultsLiveBanner } from './ResultsLiveBanner';
import { ElectoralProfile } from './ElectoralProfile';
import { PoliticalResearch } from './PoliticalResearch';
import { ElectionTimeline } from './ElectionTimeline';
import { Electoral360 } from './Electoral360';

export default function DeferredArchiveGroup() {
  const { mode } = useLanguageMode();
  return <div className="city-reference-content">
    <ResultsLiveBanner />
    {mode !== 'summary' && <><ElectoralProfile /><Electoral360 /></>}
    {mode === 'technical' && <><ElectionTimeline /><PoliticalResearch /></>}
  </div>;
}
