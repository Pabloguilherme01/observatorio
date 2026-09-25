import { useLanguageMode } from '../../context/LanguageModeContext';
import { PoliticalResearch } from './PoliticalResearch';
import { ElectionTimeline } from './ElectionTimeline';
import { Electoral360 } from './Electoral360';
import { CivicActionHub } from './CivicActionHub';

export default function DeferredCivicGroup() {
  const { mode } = useLanguageMode();
  const technical = mode === 'technical';

  return <>
    <ElectionTimeline />
    <CivicActionHub />
    {technical && <PoliticalResearch />}
    {technical && <Electoral360 />}
  </>;
}
