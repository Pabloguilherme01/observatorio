import { indicatorReference } from '../../lib/indicatorReference';
import { CheckCircle2, Database, TriangleAlert } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { buildDataQualityModel } from './quality/dataQualityModel';

export function DataQualityPanel() {
  const {
    derived,
    current,
    historical,
    snapshot,
    planned,
    datedIndicators,
    datedCoverage,
    sourceLinkedIndicators,
    missingDateIndicators,
    missingSourceIndicators,
    indicatorsNeedingDocumentation,
    warnings,
  } = buildDataQualityModel();

  return (
    <section id="qualidade" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="quality-title">
      <SectionHeader
        titleId="quality-title"
        eyebrow="Como sabemos"
        title="Veja de onde vêm os dados e quais são os limites"
        description="O Observatório diferencia dado publicado, registro de uma data específica, histórico e cálculo feito a partir das fontes. Aqui você pode conferir atualização, método e limitações."
      />
      <div className="quality-overview mb-4 rounded-3xl border border-white/8 bg-white/[0.02] p-4 light:border-slate-200 light:bg-slate-50/70">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-300/80 light:text-sky-700">Cobertura documental</div><p className="mt-1 text-xs leading-5 text-slate-500">{datedIndicators} de {d.indicators.length} indicadores têm data própria ou período anual ou referência temporal da fonte.</p><p className="mt-1 text-[11px] leading-5 text-slate-500">Fonte com link: {sourceLinkedIndicators} de {d.indicators.length}. Para completar: {missingDateIndicators} sem referência temporal e {missingSourceIndicators} sem link de fonte.</p></div>
          <strong className="text-2xl font-black text-white light:text-slate-900">{datedCoverage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong>
        </div>
        <div className="quality-progress mt-3" aria-label={`Cobertura temporal ${datedCoverage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}><span style={{ width: `${Math.min(100, datedCoverage)}%` }} /></div>
        <details className="mt-3 rounded-2xl border border-white/8 bg-black/10 p-3 light:border-slate-200 light:bg-white">
          <summary className="min-h-10 cursor-pointer text-xs font-bold text-sky-200 light:text-sky-800">
            {indicatorsNeedingDocumentation.length
              ? `Ver ${indicatorsNeedingDocumentation.length} ficha${indicatorsNeedingDocumentation.length === 1 ? '' : 's'} para revisar`
              : 'Verificar fichas do conjunto'}
          </summary>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">A lista aponta campos não registrados nesta ficha; isso, por si só, não invalida o valor. Abra cada registro para conferir seu contexto e sugerir uma correção se necessário.</p>
          {indicatorsNeedingDocumentation.length ? (
            <ul className="mt-3 space-y-2">
              {indicatorsNeedingDocumentation.map(indicator => {
                const source = d.sources.find(item => item.id === indicator.sourceId);
                const hasDate = Boolean(indicatorReference(indicator, source).key);
                const hasSourceLink = Boolean(source?.resourceUrl || source?.url);
                const missingFields = [!hasDate ? 'referência temporal' : null, !hasSourceLink ? 'link da fonte' : null].filter(Boolean).join(' e ');
                return (
                  <li key={indicator.id} className="flex flex-col gap-2 rounded-xl border border-white/8 p-3 sm:flex-row sm:items-center sm:justify-between light:border-slate-200">
                    <span className="min-w-0"><strong className="block text-xs text-slate-200 light:text-slate-800">{indicator.label}</strong><small className="mt-1 block text-[10px] text-slate-500">{source?.label ?? 'Fonte não identificada'} · falta registrar {missingFields}</small></span>
                    <button
                      type="button"
                      className="min-h-10 shrink-0 rounded-xl border border-sky-300/20 px-3 text-xs font-bold text-sky-200 light:border-sky-200 light:text-sky-800"
                      onClick={() => window.dispatchEvent(new CustomEvent('observatorio:inspect-data', { detail: { label: indicator.label, value: String(indicator.value), sourceId: indicator.sourceId, status: indicator.status, referenceDate: indicator.referenceDate, note: indicator.note, sectionId: 'qualidade' } }))}
                    >
                      Abrir ficha
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : <p className="mt-3 text-xs text-slate-500">Não há lacunas de data ou link registradas nas fichas.</p>}
        </details>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white light:text-slate-900">{current}</div>
          <div className="text-xs text-slate-500">referências publicadas</div>
        </Card>
        <Card>
          <Database className="h-5 w-5 text-sky-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white light:text-slate-900">{derived}</div>
          <div className="text-xs text-slate-500">cálculos derivados</div>
        </Card>
        <Card>
          <TriangleAlert className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white light:text-slate-900">{historical}</div>
          <div className="text-xs text-slate-500">indicadores históricos</div>
        </Card>
        <Card>
          <Database className="h-5 w-5 text-violet-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white light:text-slate-900">{snapshot}</div>
          <div className="text-xs text-slate-500">registros datados</div>
        </Card>
        <Card>
          <CheckCircle2 className="h-5 w-5 text-cyan-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white light:text-slate-900">{planned}</div>
          <div className="text-xs text-slate-500">valores planejados</div>
        </Card>
      </div>

      <div className="mt-4 rounded-3xl border border-amber-400/15 bg-amber-400/[0.04] p-5 light:border-amber-300/50 light:bg-amber-50">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-200 light:text-amber-700">
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          Antes de comparar
        </div>
        <div className="mt-3 space-y-2">
          {warnings.map(warning => <p key={warning} className="text-xs leading-5 text-slate-400 light:text-slate-600">{warning}</p>)}
        </div>
      </div>

      </section>
  );
}
