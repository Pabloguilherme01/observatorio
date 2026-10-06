import { observatorioData as d } from '../../../data/observatorioData';
import { dispatchInspect, inspectDataId } from '../../../lib/dataInspectorEvents';
import { formatNumber } from '../../../utils/formatters';

const formatReference = (date?: string, fallback = 'referência não informada') =>
  date ? date.split('-').reverse().join('/') : fallback;

interface ElectorateReconciliationPanelProps {
  readonly consolidatedElectorate: number;
}

export function ElectorateReconciliationPanel({ consolidatedElectorate }: ElectorateReconciliationPanelProps) {
  return (
    <section
      id="eleitorado-reconciliacao"
      className="mt-5 rounded-3xl border border-amber-300/15 bg-amber-300/[0.035] p-4 light:border-amber-200 light:bg-amber-50/70 sm:p-5"
      aria-labelledby="electorate-reconciliation-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300/80 light:text-amber-700">
            Reconciliação do eleitorado
          </div>
          <h3 id="electorate-reconciliation-title" className="mt-1 text-base font-black text-white light:text-slate-900">
            Dois cortes de eleitorado, não dois resultados concorrentes
          </h3>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
            O Observatório preserva o registro local da 28ª Zona e o consolidado TSE separadamente porque os universos administrativos ainda não estão documentalmente reconciliados.
          </p>
        </div>
        <button
          type="button"
          data-inspect-id={inspectDataId({ label: 'Reconciliação do eleitorado', sourceId: d.electoral.consolidatedSourceId ?? d.electoral.sourceId })}
          onClick={() => dispatchInspect({
            label: 'Reconciliação do eleitorado 2026',
            value: formatNumber(d.electoral.electorate) + ' na 28ª Zona · ' + formatNumber(consolidatedElectorate) + ' no consolidado TSE',
            sourceId: d.electoral.consolidatedSourceId ?? d.electoral.sourceId,
            referenceDate: d.electoral.snapshotDate,
            status: 'snapshot',
            note: d.sources.find(source => source.id === d.electoral.consolidatedSourceId)?.note,
            method: 'Comparação editorial entre dois cortes de eleitorado preservados separadamente; não é uma nova base oficial.',
          })}
          className="shrink-0 rounded-xl border border-amber-300/15 px-3 py-2 text-xs font-bold text-amber-200 transition hover:border-amber-300/35 light:border-amber-300 light:text-amber-800"
        >
          Ver proveniência
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-black/10 p-4 light:border-slate-200 light:bg-white">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">28ª Zona · snapshot local</div>
          <div className="mt-1 text-2xl font-black text-white light:text-slate-900">{formatNumber(d.electoral.electorate)}</div>
          <div className="mt-1 text-[11px] text-slate-500">referência {formatReference(d.electoral.snapshotDate)}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/10 p-4 light:border-slate-200 light:bg-white">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Consolidado TSE</div>
          <div className="mt-1 text-2xl font-black text-white light:text-slate-900">{formatNumber(consolidatedElectorate)}</div>
          <div className="mt-1 text-[11px] text-slate-500">camada editorial de reconciliação</div>
        </div>
        <div className="rounded-2xl border border-amber-300/10 bg-amber-300/[0.025] p-4 light:border-amber-200 light:bg-amber-50/70">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/80">Diferença preservada</div>
          <div className="mt-1 text-2xl font-black text-amber-100 light:text-amber-900">{formatNumber(Math.abs(consolidatedElectorate - d.electoral.electorate))}</div>
          <div className="mt-1 text-[11px] leading-4 text-slate-500">não é erro automaticamente; os cortes ainda precisam ser conciliados documentalmente.</div>
        </div>
      </div>
    </section>
  );
}
