import { PoliticalResearch } from './PoliticalResearch';
import { ElectionTimeline } from './ElectionTimeline';
import { Electoral360 } from './Electoral360';
import { CivicActionHub } from './CivicActionHub';

export default function DeferredCivicGroup() {
  return <>
    <PoliticalResearch />
    <ElectionTimeline />
    <Electoral360 />
    <CivicActionHub />
  </>;
}
