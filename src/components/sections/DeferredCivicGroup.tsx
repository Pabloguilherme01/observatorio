import { useLanguageMode } from '../../context/LanguageModeContext';
import { PoliticalResearch } from './PoliticalResearch';
import { ElectionTimeline } from './ElectionTimeline';
import { Electoral360 } from './Electoral360';
import { CivicActionHub } from './CivicActionHub';

export default function DeferredCivicGroup() {
  const { mode } = useLanguageMode();
  const technical = mode === 'technical';
  const summary = mode === 'summary';

  return <>
    {technical && <ElectionTimeline />}
    <CivicActionHub />
    {technical && <PoliticalResearch />}
    {!summary && <Electoral360 />}
  </>;
}
