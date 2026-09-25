import { useLanguageMode } from '../../context/LanguageModeContext';
import { ProjectTrustPanel } from '../ProjectTrustPanel';
import { DataQualityPanel } from './DataQualityPanel';
import { EvidenceChain } from './EvidenceChain';
import { DataExportActions } from '../DataExportActions';
import { EvidenceMap } from './EvidenceMap';

export default function DeferredEvidenceGroup() {
  const { mode } = useLanguageMode();
  const technical = mode === 'technical';

  return (
    <div className="mode-evidence-content">
      <ProjectTrustPanel />
      {technical && <DataQualityPanel />}
      {technical && <EvidenceChain />}
      {technical && <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><DataExportActions /></div>}
      {technical && <EvidenceMap />}
    </div>
  );
}
