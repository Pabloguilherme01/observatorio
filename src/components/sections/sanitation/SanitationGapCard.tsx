import { observatorioData as d } from '../../../data/observatorioData';
import { dispatchInspect, inspectDataId } from '../../../lib/dataInspectorEvents';
import { formatDate, formatPercent } from '../../../utils/formatters';

interface SanitationGapCardProps {
  readonly label: string;
  readonly indicatorId: string;
}

export function SanitationGapCard({ label, indicatorId }: SanitationGapCardProps) {
  const indicator = d.indicators.find(item => item.id === indicatorId);

  return (
    <button
      type="button"
      className="metric-interactive dashboard-secondary-card rounded-2xl border border-white/8 bg-black/10 p-3 text-left hover:border-amber-300/20 light:bg-white"
      data-inspect-id={indicator ? inspectDataId({ label: indicator.label, sourceId: indicator.sourceId }) : undefined}
      onClick={() => indicator && dispatchInspect({
        label: indicator.label,
        value: formatPercent(Number(indicator.value), 1),
        sourceId: indicator.sourceId,
        referenceDate: indicator.referenceDate,
        note: indicator.note,
        method: 'Complemento calculado como 100% menos o indicador correspondente, preservando o mesmo denominador.',
      })}
    >
      <strong className="block text-xl font-black text-white light:text-slate-900">{formatPercent(Number(indicator?.value ?? 0), 1)}</strong>
      <span className="mt-1 block text-xs text-slate-500">{label}</span>
      <div className="dashboard-card-meta mt-3">
        <span className="dashboard-meta-chip" data-kind={indicator?.status}>Derivado</span>
        {indicator?.referenceDate && <span className="dashboard-meta-chip">ref. {formatDate(indicator.referenceDate)}</span>}
      </div>
      <div className="dashboard-card-action mt-3">Ver fonte e fórmula</div>
    </button>
  );
}
