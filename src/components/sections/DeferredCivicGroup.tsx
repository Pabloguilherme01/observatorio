import { PoliticalRadar } from './PoliticalRadar';
import { PoliticalResearch } from './PoliticalResearch';
import { ElectionTimeline } from './ElectionTimeline';
import { Electoral360 } from './Electoral360';
import { CivicActionHub } from './CivicActionHub';

const civicModules = [
  PoliticalRadar,
  PoliticalResearch,
  ElectionTimeline,
  Electoral360,
  CivicActionHub,
];

export default function DeferredCivicGroup() {
  return (
    <>
      {civicModules.map((Module) => (
        <Module key={Module.name} />
      ))}
    </>
  );
}
