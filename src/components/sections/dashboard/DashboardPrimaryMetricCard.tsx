import type { LucideIcon } from 'lucide-react';
import { dispatchInspect, inspectDataId } from '../../../lib/dataInspectorEvents';

interface DashboardPrimaryMetricCardProps {
  readonly label: string;
  readonly value: string;
  readonly caption: string;
  readonly simpleExplanation: string;
  readonly icon: LucideIcon;
  readonly sourceId: string;
  readonly referenceDate?: string;
  readonly status?: string;
  readonly note?: string;
  readonly nature: string;
  readonly sourceLabel: string;
  readonly mode: string;
}

const formatReference = (date?: string, fallback = 'referência não informada') =>
  date ? date.split('-').reverse().join('/') : fallback;

export function DashboardPrimaryMetricCard({
  label,
  value,
  caption,
  simpleExplanation,
  icon: Icon,
  sourceId,
  referenceDate,
  status,
  note,
  nature,
  sourceLabel,
  mode,
}: DashboardPrimaryMetricCardProps) {
  const isSummary = mode === 'summary';
  const isGuided = mode === 'guided';
  const isExplained = mode === 'simple' || isGuided;

  return (
    <button
      type="button"
      data-inspect-id={inspectDataId({ label, sourceId })}
      onClick={() => dispatchInspect({
        label,
        value,
        sourceId,
        referenceDate,
        status,
        note,
        method: nature === 'Derivado' ? 'Cálculo derivado a partir das fontes e premissas exibidas.' : undefined,
      })}
      className="metric-interactive dashboard-kpi-card text-left"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-black text-white light:text-slate-900">{value}</div>
          <div className="mt-1 text-[10px] font-semibold text-sky-300/80 light:text-sky-700">{sourceLabel}</div>
          {isSummary ? (
            <div className="mt-1 text-[11px] leading-4 text-slate-500 light:text-slate-600">{caption}</div>
          ) : isExplained ? (
            <div className="simple-detail mt-2 text-[11px] leading-5 text-slate-400 light:text-slate-600">{simpleExplanation}</div>
          ) : (
            <>
              <div className="mt-1 text-xs text-slate-500">{caption}</div>
              <div className="technical-detail mt-2 text-[11px] leading-5 text-slate-400 light:text-slate-600">Fonte, data e método no inspetor.</div>
            </>
          )}
          <div className="dashboard-card-meta mt-3">
            <span className="dashboard-meta-chip" data-kind={nature === 'Derivado' ? 'derived' : 'observed'}>{nature}</span>
            {referenceDate && <span className="dashboard-meta-chip">ref. {formatReference(referenceDate)}</span>}
            <span className="dashboard-card-action">
              {isSummary ? 'Ver fonte' : isGuided ? 'Ver contexto e conferir fonte' : mode === 'simple' ? 'Conferir contexto' : 'Abrir método'}
            </span>
          </div>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
      </div>
    </button>
  );
}
