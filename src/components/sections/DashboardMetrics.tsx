import { Activity, Gauge, Map, Users, Database, Info, AlertCircle } from 'lucide-react';
import { lazy, Suspense } from 'react';
const HistoricalTrendChart = lazy(() => import('./HistoricalTrendChart').then(module => ({ default: module.HistoricalTrendChart })));
import { observatorioData as d } from '../../data/observatorioData';
import { formatBudgetCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { dispatchInspect, inspectDataId } from '../DataInspector';
import { SectionHeader } from '../ui/SectionHeader';
import { useLanguageMode } from '../../context/LanguageModeContext';

interface MetricDetail { readonly label: string; readonly value: string; readonly caption: string; readonly simpleExplanation: string; readonly icon: typeof Users; readonly sourceId: string; readonly referenceDate?: string; readonly status?: string; readonly note?: string; readonly nature: string; readonly sourceLabel: string; }

export function DashboardMetrics() {
  const { mode: languageMode } = useLanguageMode();
  const isSummary = languageMode === 'summary';
  const density = Number(d.indicators.find(i => i.id === 'density')?.value ?? 0);
  const area = Number(d.indicators.find(i => i.id === 'area')?.value ?? 0);
  const population2022 = d.populationSeries.find(p => p.year === 2022)?.value ?? 0;
  const population2026 = d.populationSeries.find(p => p.year === 2026)?.value ?? 0;
  const populationGrowthPct = population2022 ? ((population2026 - population2022) / population2022) * 100 : 0;
  const electorateShare = population2026 ? (d.electoral.electorate / population2026) * 100 : 0;
  const electorate2022 = d.electoral.electorate2022 ?? 0;
  const electorate2026 = d.electoral.electorate;
  const electorateGrowthPct = electorate2022 ? ((electorate2026 - electorate2022) / electorate2022) * 100 : 0;
  const consolidatedElectorate = d.electoral.tseConsolidated ?? null;
  const municipalIndicator = (id: string) => d.indicators.find(i => i.id === id)?.value ?? 0;
  const indicatorMeta = (id: string) => d.indicators.find(i => i.id === id);
  const formatReference = (date?: string, fallback = 'referência não informada') =>
    date ? date.split('-').reverse().join('/') : fallback;
  const statusLabel = (status?: string) => ({
    current: 'Atual',
    historical: 'Histórico',
    derived: 'Derivado',
    snapshot: 'Registro',
    planned: 'Planejado',
  } as Record<string, string>)[status ?? ''] ?? 'Dado público';
  const budgetFunctionAmount = (id: string) => d.budget.functions.find(item => item.id === id)?.amountBrl ?? 0;
  const budgetTotal = d.budget.totalBrl;
  const comparisonDetails = [
    {
      label: 'Educação na LOA 2026',
      value: formatPercent(Number(municipalIndicator('budget-education-share-2026')), 1),
      caption: `${formatBudgetCurrency(budgetFunctionAmount('educacao-f'))} de ${formatBudgetCurrency(budgetTotal)}`,
      indicatorId: 'budget-education-share-2026',
      fallbackSourceId: 'loa-2026',
      method: 'Função Educação ÷ total da LOA 2026.',
    },
    {
      label: 'Saúde na LOA 2026',
      value: formatPercent(Number(municipalIndicator('budget-health-share-2026')), 1),
      caption: `${formatBudgetCurrency(budgetFunctionAmount('saude-f'))} de ${formatBudgetCurrency(budgetTotal)}`,
      indicatorId: 'budget-health-share-2026',
      fallbackSourceId: 'loa-2026',
      method: 'Função Saúde ÷ total da LOA 2026.',
    },
    {
      label: 'Saneamento na LOA 2026',
      value: formatPercent(Number(municipalIndicator('budget-sanitation-share-2026')), 1),
      caption: `${formatBudgetCurrency(budgetFunctionAmount('saneamento-f'))} de ${formatBudgetCurrency(budgetTotal)}`,
      indicatorId: 'budget-sanitation-share-2026',
      fallbackSourceId: 'loa-2026',
      method: 'Função Saneamento ÷ total da LOA 2026.',
    },
    {
      label: 'Matrículas municipais na educação básica',
      value: formatPercent(Number(municipalIndicator('municipal-enrollment-share-2025')), 1),
      caption: `${formatNumber(Number(municipalIndicator('municipal-enrollments-2025')))} de ${formatNumber(Number(municipalIndicator('basic-enrollments-2025')))} matrículas em 2025`,
      indicatorId: 'municipal-enrollment-share-2025',
      fallbackSourceId: 'pee-go-educacao-2025',
      method: 'Matrículas municipais ÷ matrículas totais da educação básica no mesmo ano-base.',
    },
    {
      label: 'Receitas realizadas − despesas empenhadas',
      value: formatBudgetCurrency(Number(municipalIndicator('revenue-expense-difference-2025'))),
      caption: 'diferença entre os dois totais publicados em 2025',
      indicatorId: 'revenue-expense-difference-2025',
      fallbackSourceId: 'ibge-cidades-2026',
      method: 'Receitas brutas realizadas menos despesas brutas empenhadas. Não equivale automaticamente a superávit fiscal.',
    },
  ] as const;
  const visibleComparisons = isSummary ? comparisonDetails.slice(0, 2) : comparisonDetails;
  const metricDetails: readonly MetricDetail[] = [
    { label: 'Variação da população', value: '+' + formatPercent(populationGrowthPct, 2), caption: formatNumber(population2022) + ' → ' + formatNumber(population2026), simpleExplanation: 'Mudança percentual da população entre 2022 e 2026.', icon: Users, sourceId: 'ibge-estimativas-2026', referenceDate: '2026-07-01', nature: 'Derivado', sourceLabel: 'Cálculo · IBGE 2022 → 2026' },
    { label: 'Variação do eleitorado', value: '+' + formatPercent(electorateGrowthPct, 2), caption: formatNumber(electorate2022) + ' → ' + formatNumber(electorate2026), simpleExplanation: 'Mudança percentual do eleitorado entre os registros disponíveis.', icon: Activity, sourceId: 'tse-eleitorado-2026', referenceDate: d.electoral.snapshotDate, nature: 'Derivado', sourceLabel: 'Cálculo · TSE 2022 → 2026' },
    { label: 'Eleitorado / população', value: formatPercent(electorateShare, 2), caption: 'relação estatística', simpleExplanation: 'Razão entre o eleitorado registrado e a população estimada. Não mede comparecimento.', icon: Activity, sourceId: 'tse-eleitorado-2026', referenceDate: d.electoral.snapshotDate, nature: 'Derivado', sourceLabel: 'Cálculo · TSE ÷ IBGE' },
    { label: 'Densidade demográfica', value: formatNumber(density, 1) + ' hab/km²', caption: 'população ÷ área', simpleExplanation: 'Média estimada de habitantes por quilômetro quadrado.', icon: Gauge, sourceId: 'ibge-estimativas-2026', referenceDate: '2026-07-01', nature: 'Derivado', sourceLabel: 'Cálculo · IBGE 2026' },
    { label: 'Área territorial', value: formatNumber(area, 3) + ' km²', caption: 'base territorial', simpleExplanation: 'Área usada nos cálculos de densidade e contexto municipal.', icon: Map, sourceId: 'ibge-cidades-2026', referenceDate: '2025-01-01', nature: 'Observação', sourceLabel: 'IBGE · perfil municipal' },
  ];
  const thematicIndicators = [
    { id: 'companies', label: 'Empresas ativas', value: formatNumber(Number(municipalIndicator('companies'))), fallbackReference: 'registro 2026', fallbackSourceId: 'caged-sebrae-2026' },
    { id: 'cagedBalance', label: 'Saldo celetista', value: formatNumber(Number(municipalIndicator('cagedBalance'))) + ' postos', fallbackReference: 'até jul/2026', fallbackSourceId: 'caged-sebrae-2026' },
    { id: 'idebInitial', label: 'IDEB anos iniciais', value: formatNumber(Number(municipalIndicator('idebInitial')), 1), fallbackReference: '2023', fallbackSourceId: 'inep-2023' },
    { id: 'idebFinal', label: 'IDEB anos finais', value: formatNumber(Number(municipalIndicator('idebFinal')), 1), fallbackReference: '2023', fallbackSourceId: 'inep-2023' },
    { id: 'formal-salary', label: 'Salário formal médio', value: formatNumber(Number(municipalIndicator('formal-salary')), 1) + ' salários mínimos', fallbackReference: '2024', fallbackSourceId: 'ibge-cidades-2026' },
    { id: 'sanitation-investment', label: 'Investimento em saneamento', value: 'R$ ' + (Number(municipalIndicator('sanitation-investment')) / 1_000_000).toFixed(1).replace('.', ',') + ' mi', fallbackReference: '2024', fallbackSourceId: 'sinisa-2024' },
    { id: 'water-related-hospitalizations', label: 'Internações ligadas à água', value: formatNumber(Number(municipalIndicator('water-related-hospitalizations'))), fallbackReference: '2024', fallbackSourceId: 'sinisa-2024' },
    { id: 'water-related-deaths', label: 'Óbitos ligados à água', value: formatNumber(Number(municipalIndicator('water-related-deaths'))), fallbackReference: '2024', fallbackSourceId: 'sinisa-2024' },
  ] as const;

  return (
    <section id="dashboard" className="dashboard-shell mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14" aria-labelledby="dashboard-title">
      <div className="dashboard-heading-card mb-6 rounded-[28px] border border-white/8 bg-white/[0.025] p-4 sm:p-5 light:border-slate-200 light:bg-slate-50/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            titleId="dashboard-title"
            eyebrow={isSummary ? 'Leitura rápida' : languageMode === 'simple' ? 'Leitura explicada' : 'Fonte e método'}
            title={isSummary ? 'Cinco indicadores para começar' : languageMode === 'simple' ? 'Cinco indicadores explicados' : 'Indicadores com fonte, data e método'}
            description={isSummary
              ? 'Uma leitura curta dos principais indicadores, com origem e referência acessíveis em cada card.'
              : languageMode === 'simple'
                ? 'Cada número vem acompanhado de uma explicação curta; toque para abrir a fonte e continuar a leitura.'
                : 'Cada indicador abre origem, referência, natureza e método para uma conferência completa.'}
          />
          <div className="flex flex-wrap items-center gap-2" aria-label="Estado do painel">
            {!isSummary && <span className="dashboard-status-chip"><Database className="h-3.5 w-3.5" aria-hidden="true" /> {languageMode === 'technical' ? 'Fonte e método disponíveis' : 'Fontes disponíveis'}</span>}
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
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{isSummary ? 'Em um olhar' : languageMode === 'simple' ? 'Leitura em contexto' : 'Indicadores principais'}</div>
          <p className="mt-1 text-xs text-slate-500">{isSummary ? 'Informação essencial, sem esconder a referência.' : languageMode === 'simple' ? 'Cinco indicadores com contexto e referência visível.' : 'Cada indicador abre fonte, data, natureza e método.'}</p>
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
                  ) : languageMode === 'simple' ? (
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
                    <span className="dashboard-card-action">{isSummary ? 'Ver fonte' : languageMode === 'simple' ? 'Conferir contexto' : 'Abrir método'}</span>
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
      ) : languageMode === 'simple' ? (
        <div className="simple-detail mt-3 rounded-2xl border border-sky-300/10 bg-sky-300/[0.035] px-4 py-3 text-xs leading-5 text-slate-300 light:text-slate-600">
          Contexto primeiro, fonte sempre acessível. Toque em qualquer indicador para conferir.
        </div>
      ) : (
        <div className="technical-detail mt-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs leading-5 text-slate-500 light:border-slate-200 light:bg-slate-50/70">
          <strong className="text-slate-300 light:text-slate-700">Antes de comparar:</strong> população e eleitorado são universos diferentes e podem ter datas de referência diferentes. A razão eleitorado/população é um cálculo estatístico; não mede comparecimento às urnas.
        </div>
      )}

      {languageMode === 'simple' && (
        <div className="mt-5 rounded-3xl border border-white/8 bg-white/[0.018] p-4 light:border-slate-200 light:bg-slate-50/70 sm:p-5" aria-label="Indicadores por tema">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300/80 light:text-emerald-700">Mais indicadores</div>
          <h3 className="mt-1 text-base font-black text-white light:text-slate-900">Economia, educação, saneamento e trabalho</h3>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">Valores do conjunto rastreável, organizados por tema. Cada card mostra a natureza do dado e a referência disponível.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {thematicIndicators.map(item => {
              const meta = indicatorMeta(item.id);
              const sourceId = meta?.sourceId ?? item.fallbackSourceId;
              const reference = formatReference(meta?.referenceDate, item.fallbackReference);
              const nature = statusLabel(meta?.status);
              return (
                <button
                  key={item.label}
                  type="button"
                  data-inspect-id={inspectDataId({ label: item.label, sourceId })}
                  onClick={() => dispatchInspect({
                    label: item.label,
                    value: item.value,
                    sourceId,
                    referenceDate: meta?.referenceDate,
                    status: meta?.status,
                    note: meta?.note,
                  })}
                  className="metric-interactive dashboard-secondary-card rounded-2xl border border-white/8 bg-black/10 p-4 text-left hover:border-emerald-300/20 light:bg-white"
                >
                  <div className="text-xs font-semibold text-slate-500">{item.label}</div>
                  <div className="mt-2 text-xl font-black text-white light:text-slate-900">{item.value}</div>
                  <div className="dashboard-card-meta mt-3">
                    <span className="dashboard-meta-chip" data-kind={meta?.status}>{nature}</span>
                    <span className="dashboard-meta-chip">ref. {reference}</span>
                  </div>
                  <div className="dashboard-card-action mt-3">Abrir fonte e contexto</div>
                </button>
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
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">Relações descritivas calculadas sobre bases identificadas. Confira fórmula e data antes de comparar.</p>
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
                <div className="dashboard-card-action mt-3">Abrir fórmula e fonte</div>
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
              {[
                ['Empresas ativas', formatNumber(Number(municipalIndicator('companies'))), 'registro 2026', 'caged-sebrae-2026'],
                ['Saldo celetista', formatNumber(Number(municipalIndicator('cagedBalance'))) + ' postos', 'até jul/2026', 'caged-sebrae-2026'],
                ['IDEB anos iniciais', formatNumber(Number(municipalIndicator('idebInitial')), 1), '2023', 'inep-2023'],
                ['IDEB anos finais', formatNumber(Number(municipalIndicator('idebFinal')), 1), '2023', 'inep-2023'],
                ['Salário formal médio', formatNumber(Number(municipalIndicator('formal-salary')), 1) + ' salários mínimos', '2024', 'ibge-cidades-2026'],
                ['Investimento em saneamento', 'R$ ' + (Number(municipalIndicator('sanitation-investment')) / 1_000_000).toFixed(1).replace('.', ',') + ' mi', '2024', 'sinisa-2024'],
                ['Internações ligadas à água', formatNumber(Number(municipalIndicator('water-related-hospitalizations'))), '2024', 'sinisa-2024'],
                ['Óbitos ligados à água', formatNumber(Number(municipalIndicator('water-related-deaths'))), '2024', 'sinisa-2024'],
                ['Matrículas básicas', formatNumber(Number(municipalIndicator('basic-enrollments-2025'))), '2025', 'pee-go-educacao-2025'],
                ['Matrículas municipais', formatNumber(Number(municipalIndicator('municipal-enrollments-2025'))), '2025', 'pee-go-educacao-2025'],
                ['EPT técnica', formatNumber(Number(municipalIndicator('ept-technical-2025'))), '2025', 'pee-go-ept-2025'],
                ['Despesa bruta empenhada', 'R$ ' + (Number(municipalIndicator('expenses-2025')) / 1_000_000).toFixed(1).replace('.', ',') + ' mi', '2025', 'ibge-cidades-2026'],
              ].map(([label,value,year,sourceId]) => (
                <button key={label} type="button" data-inspect-id={inspectDataId({ label, sourceId })} onClick={() => dispatchInspect({ label, value, sourceId })} className="metric-interactive dashboard-secondary-card rounded-2xl border border-white/8 bg-black/10 p-4 text-left hover:border-sky-300/20 light:bg-white">
                  <div className="text-xs font-semibold text-slate-500">{label}</div>
                  <div className="mt-2 text-xl font-black text-white light:text-slate-900">{value}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{year}</div>
                </button>
              ))}
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
            {[['Escolarização 6–14', formatPercent(Number(municipalIndicator('schooling-6-14')), 1), '2022', 'ibge-cidades-2026'],['Mortalidade infantil', formatNumber(Number(municipalIndicator('infant-mortality')), 2) + '‰', '2025', 'ibge-cidades-2026'],['Receitas brutas', 'R$ ' + (Number(municipalIndicator('revenue-2025')) / 1_000_000).toFixed(1).replace('.', ',') + ' mi', '2025', 'ibge-cidades-2026'],['PIB per capita', 'R$ ' + formatNumber(Number(municipalIndicator('gdp-per-capita-2023')), 2), '2023', 'ibge-cidades-2026'],['Área urbanizada', formatNumber(Number(municipalIndicator('urbanized-area')), 2) + ' km²', '2019', 'ibge-cidades-2026'],['Arborização viária', formatPercent(Number(municipalIndicator('street-arborization')), 2), '2022', 'ibge-cidades-2026'],['Esgotamento adequado', formatPercent(Number(municipalIndicator('adequate-sewerage')), 2), '2022', 'ibge-cidades-2026'],['Pessoal ocupado', formatNumber(Number(municipalIndicator('formal-workers'))) + ' pessoas', '2024', 'ibge-cidades-2026']].map(([label,value,year,sourceId]) => <button key={label} type="button" data-inspect-id={inspectDataId({ label, sourceId })} onClick={() => dispatchInspect({ label, value, sourceId })} className="metric-interactive dashboard-secondary-card rounded-2xl border border-white/8 bg-black/10 p-4 text-left hover:border-sky-300/20 light:bg-white"><div className="text-xs font-semibold text-slate-500">{label}</div><div className="mt-2 text-xl font-black text-white light:text-slate-900">{value}</div><div className="mt-1 text-[11px] text-slate-500">ano-base {year}</div></button>)}
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
