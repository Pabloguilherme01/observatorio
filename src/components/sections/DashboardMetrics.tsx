import { Database, Info, AlertCircle } from 'lucide-react';
import { lazy, Suspense } from 'react';
const HistoricalTrendChart = lazy(() => import('./HistoricalTrendChart').then(module => ({ default: module.HistoricalTrendChart })));
import { observatorioData as d } from '../../data/observatorioData';
import { formatNumber } from '../../utils/formatters';
import { formatIndicatorStatus } from '../../utils/dataLabels';
import { dispatchInspect, inspectDataId } from '../../lib/dataInspectorEvents';
import { SectionHeader } from '../ui/SectionHeader';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { IndicatorComparator } from './IndicatorComparator';
import { DashboardSecondaryIndicatorCard } from './dashboard/DashboardSecondaryIndicatorCard';
import { buildDashboardMetricsModel } from './dashboard/dashboardMetricsModel';

export function DashboardMetrics() {
  const { mode: languageMode } = useLanguageMode();
  const isSummary = languageMode === 'summary';
  const isGuided = languageMode === 'guided';
  const isExplained = languageMode === 'simple' || isGuided;
  const {
    electorate2026,
    consolidatedElectorate,
    comparisonDetails,
    metricDetails,
    thematicIndicators,
    technicalIndicators,
    ibgeProfileIndicators,
  } = buildDashboardMetricsModel();
  const visibleComparisons = isSummary ? comparisonDetails.slice(0, 2) : comparisonDetails;
  const indicatorMeta = (id: string) => d.indicators.find(i => i.id === id);
  const formatReference = (date?: string, fallback = 'referência não informada') =>
    date ? date.split('-').reverse().join('/') : fallback;
  const statusLabel = (status?: string) => formatIndicatorStatus(status, 'Dado público') ?? 'Dado público';

  return (
    <section id="dashboard" className="dashboard-shell mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14" aria-labelledby="dashboard-title">
      <div className="dashboard-heading-card mb-6 rounded-[28px] border border-white/8 bg-white/[0.025] p-4 sm:p-5 light:border-slate-200 light:bg-slate-50/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            titleId="dashboard-title"
            eyebrow={isSummary ? 'Leitura rápida' : isGuided ? 'Aprendizado guiado' : languageMode === 'simple' ? 'Leitura explicada' : 'Fonte e método'}
            title={isSummary ? 'Cinco indicadores para começar' : isGuided ? 'Cinco indicadores para praticar a leitura' : languageMode === 'simple' ? 'Cinco indicadores explicados' : 'Indicadores com fonte, data e método'}
            description={isSummary
              ? 'Uma leitura curta dos principais indicadores, com origem e referência acessíveis em cada card.'
              : isGuided
                ? 'Use os cards para praticar a sequência do modo Guiado: valor, unidade, referência, natureza e fonte.'
                : languageMode === 'simple'
                  ? 'Cada número vem acompanhado de uma explicação curta; toque para abrir a fonte e continuar a leitura.'
                  : 'Cada indicador abre origem, referência, natureza e método para uma conferência completa.'}
          />
          <div className="flex flex-wrap items-center gap-2" aria-label="Estado do painel">
            {!isSummary && <span className="dashboard-status-chip"><Database className="h-3.5 w-3.5" aria-hidden="true" /> {languageMode === 'technical' ? 'Fonte e método disponíveis' : isGuided ? 'Fonte disponível para verificar' : 'Fontes disponíveis'}</span>}
            <span className="dashboard-status-chip"><Info className="h-3.5 w-3.5" aria-hidden="true" /> Atualizado em {d.meta.updatedAt.split('-').reverse().join('/')}</span>
          </div>
        </div>
      </div>

      {!isSummary && (
        <div className="mb-3 rounded-2xl border border-amber-300/10 bg-amber-300/[0.025] p-4 light:border-amber-300/50 light:bg-amber-50/60">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200 light:text-amber-700" aria-hidden="true" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200/80 light:text-amber-700">O que merece atenção</div>
              <div className="mt-2 grid gap-2 text-xs leading-5 text-slate-400 sm:grid-cols-3 light:text-slate-600">
                <p>População: 2022 é Censo; 2025 e 2026 são estimativas do IBGE.</p>
                <p>Eleitorado: o valor de 2026 é um registro com data própria de referência.</p>
                <p>Indicadores do painel podem usar anos-base diferentes; compare sempre a referência.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{isSummary ? 'Em um olhar' : isGuided ? 'Pratique a leitura' : languageMode === 'simple' ? 'Leitura em contexto' : 'Indicadores principais'}</div>
          <p className="mt-1 text-xs text-slate-500">{isSummary ? 'Informação essencial, sem esconder a referência.' : isGuided ? 'Leia valor, explicação, natureza e referência antes de abrir a fonte.' : languageMode === 'simple' ? 'Cinco indicadores com contexto e referência visível.' : 'Cada indicador abre fonte, data, natureza e método.'}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metricDetails.map(({ label, value, caption, simpleExplanation, icon: Icon, sourceId, referenceDate, status, note, nature, sourceLabel }) => (
          <button key={label} type="button" data-inspect-id={inspectDataId({ label, sourceId })} onClick={() => dispatchInspect({ label, value, sourceId, referenceDate, status, note, method: nature === 'Derivado' ? 'Cálculo derivado a partir das fontes e premissas exibidas.' : undefined })} className="metric-interactive dashboard-kpi-card text-left">

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
                    <span className="dashboard-card-action">{isSummary ? 'Ver fonte' : isGuided ? 'Ver contexto e conferir fonte' : languageMode === 'simple' ? 'Conferir contexto' : 'Abrir método'}</span>
                  </div>
                </div>
                <Icon className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
              </div>
          </button>
        ))}
      </div>

      {isSummary ? (
        <div className="dashboard-summary-note mt-3 rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] px-4 py-3 text-xs leading-5 text-slate-500 light:border-sky-200 light:bg-sky-50/70 light:text-slate-600">
          Cada número mantém sua referência. Toque para ver origem e detalhes sem sair da leitura.
        </div>
      ) : isExplained ? (
        <div className="simple-detail mt-3 rounded-2xl border border-sky-300/10 bg-sky-300/[0.035] px-4 py-3 text-xs leading-5 text-slate-300 light:text-slate-600">
          {isGuided
            ? 'Pergunta de prática: você consegue dizer o que o valor mede, de quando é e se é publicado ou derivado antes de abrir a fonte?'
            : 'Contexto primeiro, fonte sempre acessível. Toque em qualquer indicador para conferir.'}
        </div>
      ) : (
        <div className="technical-detail mt-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs leading-5 text-slate-500 light:border-slate-200 light:bg-slate-50/70">
          <strong className="text-slate-300 light:text-slate-700">Antes de comparar:</strong> população e eleitorado são universos diferentes e podem ter datas de referência diferentes. A razão eleitorado/população é um cálculo estatístico; não mede comparecimento às urnas.
        </div>
      )}

      {consolidatedElectorate && (
        <ElectorateReconciliationPanel consolidatedElectorate={consolidatedElectorate} />
      )}

      <IndicatorComparator />

      {isExplained && (
        <div className="mt-5 rounded-3xl border border-white/8 bg-white/[0.018] p-4 light:border-slate-200 light:bg-slate-50/70 sm:p-5" aria-label="Indicadores por tema">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300/80 light:text-emerald-700">{isGuided ? 'Prática por tema' : 'Mais indicadores'}</div>
          <h3 className="mt-1 text-base font-black text-white light:text-slate-900">{isGuided ? 'Aplique a mesma regra em outros temas' : 'Economia, educação, saneamento e trabalho'}</h3>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">{isGuided ? 'Pratique uma leitura consistente: identifique natureza e referência antes de abrir a fonte.' : 'Valores do conjunto rastreável, organizados por tema. Cada card mostra a natureza do dado e a referência disponível.'}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {thematicIndicators.map(item => {
              const meta = indicatorMeta(item.id);
              const sourceId = meta?.sourceId ?? item.fallbackSourceId;
              const reference = formatReference(meta?.referenceDate, item.fallbackReference);
              return (
                <DashboardSecondaryIndicatorCard
                  key={item.id}
                  label={item.label}
                  value={item.value}
                  sourceId={sourceId}
                  reference={reference}
                  referenceDate={meta?.referenceDate}
                  status={meta?.status}
                  note={meta?.note}
                  actionLabel={isGuided ? 'Confira natureza, data e fonte' : 'Abrir fonte e contexto'}
                  accent="emerald"
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 rounded-3xl border border-white/8 bg-white/[0.018] p-4 light:border-slate-200 light:bg-slate-50/70 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-300/80 light:text-sky-700">Comparativos úteis</div>
            <h3 className="mt-1 text-base font-black text-white light:text-slate-900">Comparativos com método explícito</h3>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">{isGuided ? 'Comece pela fórmula, depois confira período e base antes de usar o comparativo.' : 'Relações descritivas calculadas sobre bases identificadas. Confira fórmula e data antes de comparar.'}</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">{visibleComparisons.length} comparativos</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {visibleComparisons.map(item => {
            const meta = indicatorMeta(item.indicatorId);
            const sourceId = meta?.sourceId ?? item.fallbackSourceId;
            const source = d.sources.find(sourceItem => sourceItem.id === sourceId);
            const referenceDate = meta?.referenceDate ?? source?.referenceDate;
            const nature = statusLabel(meta?.status ?? 'derived');
            return (
              <button
                key={item.label}
                type="button"
                data-inspect-id={inspectDataId({ label: item.label, sourceId })}
                onClick={() => dispatchInspect({
                  label: item.label,
                  value: item.value,
                  sourceId,
                  referenceDate,
                  status: meta?.status ?? 'derived',
                  note: meta?.note,
                  method: item.method,
                })}
                className="metric-interactive dashboard-secondary-card rounded-2xl border border-white/8 bg-black/10 p-4 text-left hover:border-sky-300/20 light:bg-white"
              >
                <div className="text-xs font-semibold text-slate-500">{item.label}</div>
                <div className="mt-2 text-2xl font-black text-white light:text-slate-900">{item.value}</div>
                <div className="mt-1 text-[11px] leading-5 text-slate-500">{item.caption}</div>
                <div className="dashboard-card-meta mt-3">
                  <span className="dashboard-meta-chip" data-kind={meta?.status ?? 'derived'}>{nature}</span>
                  {referenceDate && <span className="dashboard-meta-chip">ref. {formatReference(referenceDate)}</span>}
                </div>
                <div className="dashboard-card-action mt-3">{isGuided ? 'Confira fórmula, período e base' : 'Abrir fórmula e fonte'}</div>
              </button>
            );
          })}
        </div>
      </div>

      <Suspense fallback={<div className="mt-4 min-h-[220px] rounded-3xl border border-white/8 bg-white/[0.02] p-5 light:border-slate-200 light:bg-slate-50/80" role="status" aria-live="polite">Carregando série histórica…</div>}>
        <HistoricalTrendChart />
      </Suspense>

      {languageMode === 'technical' && (
        <>
          <div className="technical-detail mt-4 rounded-3xl border border-white/10 bg-white/[0.02] p-5 light:border-slate-200 light:bg-slate-50/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/80">Contexto quantitativo</div>
                <h3 className="mt-1 text-lg font-black text-white light:text-slate-900">Indicadores adicionais</h3>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">Agrupados por tema para reduzir a carga visual. Cada valor mantém ano-base, fonte e inspetor.</p>
              </div>
              <div className="dashboard-technical-key" aria-label="Como interpretar os cartões">
                <span><i className="dashboard-dot" /> observação</span>
                <span><i className="dashboard-dot dashboard-dot-derived" /> derivação/cálculo</span>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {technicalIndicators.map(item => {
                const meta = indicatorMeta(item.id);
                const sourceId = meta?.sourceId ?? item.fallbackSourceId;
                const reference = formatReference(meta?.referenceDate, item.fallbackReference);
                return (
                  <DashboardSecondaryIndicatorCard
                    key={item.id}
                    label={item.label}
                    value={item.value}
                    sourceId={sourceId}
                    reference={reference}
                    referenceDate={meta?.referenceDate}
                    status={meta?.status}
                    note={meta?.note}
                    actionLabel="Abrir fonte e contexto"
                  />
                );
              })}
            </div>
          </div>
          <div className="technical-detail mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-sky-300/10 bg-sky-300/[0.03] p-4 light:border-sky-200 light:bg-sky-50/70">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-300/80">Leitura metodológica</div>
              <p className="mt-2 text-xs leading-5 text-slate-400 light:text-slate-600">Os valores podem vir de censo, estimativa, registro de uma data específica ou cálculo derivado. O inspetor informa a natureza de cada número para evitar comparações indevidas.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 light:border-slate-200 light:bg-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Eleitorado</div>
              <p className="mt-2 text-xs leading-5 text-slate-400 light:text-slate-600">{consolidatedElectorate === null ? <>O recorte local registra {formatNumber(electorate2026)} eleitores. Não há consolidado adicional registrado nesta versão do dataset; por isso nenhuma diferença entre recortes é inferida.</> : <ElectorateReconciliation local={electorate2026} consolidated={consolidatedElectorate} />}</p>
            </div>
          </div>
        </>
      )}
      {languageMode === 'technical' && (
        <div className="technical-detail mt-4 rounded-3xl border border-white/10 bg-white/[0.02] p-5 light:border-slate-200 light:bg-slate-50/70">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/80">Contexto municipal</div>
              <h3 className="mt-1 text-lg font-black text-white light:text-slate-900">Outros indicadores do perfil IBGE</h3>
            </div>
            <span className="text-xs text-slate-500">Clique em qualquer valor</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ibgeProfileIndicators.map(item => {
              const meta = indicatorMeta(item.id);
              const sourceId = meta?.sourceId ?? item.fallbackSourceId;
              const reference = formatReference(meta?.referenceDate, item.fallbackReference);
              return (
                <DashboardSecondaryIndicatorCard
                  key={item.id}
                  label={item.label}
                  value={item.value}
                  sourceId={sourceId}
                  reference={reference}
                  referenceDate={meta?.referenceDate}
                  status={meta?.status}
                  note={meta?.note}
                  actionLabel="Abrir fonte e contexto"
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}


function ElectorateReconciliation({ local, consolidated }: { readonly local: number; readonly consolidated: number }) {
  const difference = consolidated - local;
  return <>O recorte local registra {formatNumber(local)} eleitores e o consolidado disponível registra {formatNumber(consolidated)}. A diferença de {formatNumber(Math.abs(difference))} registros é mantida visível para reconciliação entre recortes, sem tratar bases de referência distintas como erro automático.</>;
}
