import { DataQualityPanel } from './DataQualityPanel';
import { EvidenceChain } from './EvidenceChain';
import { DataExportActions } from '../DataExportActions';
import { EvidenceMap } from './EvidenceMap';
import { Footer } from '../layout/Footer';

const evidenceModules = [
  DataQualityPanel,
  EvidenceChain,
  EvidenceMap,
];

export default function DeferredEvidenceGroup() {
  return <>
    {evidenceModules.map((Module, index) => <Module key={index} />)}
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <DataExportActions />
    </div>
    <Footer />
  </>;
}
