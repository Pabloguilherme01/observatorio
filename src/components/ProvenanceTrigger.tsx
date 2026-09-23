import { Info } from 'lucide-react';
import { dispatchProvenance, type ProvenanceRequest } from './ProvenanceDrawer';

interface ProvenanceTriggerProps {
  readonly valueId: string;
  readonly label?: string;
  readonly compact?: boolean;
  readonly fallback?: ProvenanceRequest['fallback'];
}

export function ProvenanceTrigger({ valueId, label = 'De onde vem?', compact = false, fallback }: ProvenanceTriggerProps) {
  return (
    <button
      type="button"
      data-testid="provenance-trigger"
      onClick={() => dispatchProvenance({ valueId, fallback })}
      className={
        compact
          ? 'inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/8 px-2.5 py-1.5 text-[10px] font-bold text-slate-400 hover:border-sky-300/20 hover:text-sky-200'
          : 'inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs font-bold text-slate-300 hover:border-sky-300/20 hover:text-white'
      }
      aria-label={label + ': ' + valueId}
    >
      <Info className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
      {label}
    </button>
  );
}
