import { formatIndicatorStatus } from '../../../utils/dataLabels';
import { dispatchInspect, inspectDataId } from '../../../lib/dataInspectorEvents';

interface DashboardSecondaryIndicatorCardProps {
  readonly label: string;
  readonly value: string;
  readonly sourceId: string;
  readonly reference: string;
  readonly referenceDate?: string;
  readonly status?: string;
  readonly note?: string;
  readonly actionLabel: string;
  readonly accent?: 'sky' | 'emerald';
}

export function DashboardSecondaryIndicatorCard({
  label,
  value,
  sourceId,
  reference,
  referenceDate,
  status,
  note,
  actionLabel,
  accent = 'sky',
}: DashboardSecondaryIndicatorCardProps) {
  const nature = formatIndicatorStatus(status, 'Dado público') ?? 'Dado público';
  const hoverClass = accent === 'emerald' ? 'hover:border-emerald-300/20' : 'hover:border-sky-300/20';

  return (
    <button
      type="button"
      data-inspect-id={inspectDataId({ label, sourceId })}
      onClick={() => dispatchInspect({ label, value, sourceId, referenceDate, status, note })}
      className={'metric-interactive dashboard-secondary-card rounded-2xl border border-white/8 bg-black/10 p-4 text-left light:bg-white ' + hoverClass}
    >
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-black text-white light:text-slate-900">{value}</div>
      <div className="dashboard-card-meta mt-3">
        <span className="dashboard-meta-chip" data-kind={status}>{nature}</span>
        <span className="dashboard-meta-chip">ref. {reference}</span>
      </div>
      <div className="dashboard-card-action mt-3">{actionLabel}</div>
    </button>
  );
}
