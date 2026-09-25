import { DataQualityPanel } from './DataQualityPanel';
import { EvidenceChain } from './EvidenceChain';
import { DataExportActions } from '../DataExportActions';
import { EvidenceMap } from './EvidenceMap';
import { Footer } from '../layout/Footer';

export default function DeferredEvidenceGroup() {
  return <>
    <div className="mode-evidence-content">
      <DataQualityPanel />
      <EvidenceChain />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><DataExportActions /></div>
      <EvidenceMap />
    </div>
    <Footer />
  </>;
}
