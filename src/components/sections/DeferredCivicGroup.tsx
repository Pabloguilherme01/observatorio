import { PoliticalRadar } from './PoliticalRadar';
import { PoliticalResearch } from './PoliticalResearch';
import { ElectionTimeline } from './ElectionTimeline';
import { Electoral360 } from './Electoral360';
import { CivicActionHub } from './CivicActionHub';
import { ElectoralOverview } from './ElectoralOverview';

export default function DeferredCivicGroup() {
  return <>
    <PoliticalRadar />
    <PoliticalResearch />
    <ElectoralOverview />
    <ElectionTimeline />
    <Electoral360 />
    <CivicActionHub />
  </>;
}
