import { Activity, Gauge, Map, Users, WalletCards, ArrowUpRight, CalendarDays, Database, Info, Table2, AlertCircle } from 'lucide-react';
import { HistoricalTrendChart } from './HistoricalTrendChart';
import { observatorioData as d } from '../../data/observatorioData';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { dispatchInspect } from '../DataInspector';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { useLanguageMode } from '../../context/LanguageModeContext';

interface MetricDetail { readonly label: string; readonly value: string; readonly caption: string; readonly simpleExplanation: string; readonly icon: typeof Users; readonly sourceId: string; readonly referenceDate?: string; readonly status?: string; readonly note?: string; readonly nature: string; readonly sourceLabel: string; }

export function DashboardMetrics() {
  const { mode: languageMode } = useLanguageMode();
  const density = Number(d.indicators.find(i => i.id === 'density')?.value ?? 0);
  const area = Number(d.indicators.find(i => i.id === 'area')?.value ?? 0);
  const population2022 = d.populationSeries.find(p => p.year === 2022)?.value ?? 0;
  const population2026 = d.populationSeries.find(p => p.year === 2026)?.value ?? 0;
  const populationGrowthPct = population2022 ? ((population2026 - population2022) / population2022) * 100 : 0;
  const electorateShare = population2026 ? (d.electoral.electorate / population2026) * 100 : 0;
  const inclusionCount = d.electoral.socialNameCount ?? 0;
  const municipalIndicator = (id: string) => d.indicators.find(i => i.id === id)?.value ?? 0;
  const populationDelta = population2026 - population2022;
  const plannedBudgetPerCapita = population2026 > 0 ? d.budget.totalBrl / population2026 : 0;
  const metricDetails: readonly MetricDetail[] = [
    { label: 'População 2026', value: formatNumber(population2026), caption: 'estimativa IBGE', simpleExplanation: 'Quantas pessoas moram na cidade, segundo a estimativa usada.', icon: Users, sourceId: 'ibge-estimativas-2026', referenceDate: '2026-07-01', nature: 'Estimativa', sourceLabel: 'IBGE · estimativa 2026' },
    { label: 'Eleitorado 2026', value: formatNumber(d.electoral.electorate), caption: 'snapshot TSE', simpleExplanation: 'Quantidade de eleitores neste recorte.', icon: Activity, sourceId: 'tse-eleitorado-2026', referenceDate: d.electoral.snapshotDate, nature: 'Snapshot', sourceLabel: 'TSE · snapshot 2026' },
    { label: 'Orçamento 2026', value: formatCurrency(d.budget.totalBrl), caption: 'LOA 2026', simpleExplanation: 'Valor total previsto na LOA para o exercício de 2026.', icon: WalletCards, sourceId: d.budget.sourceId, referenceDate: '2026-01-01', nature: 'Orçamento', sourceLabel: 'LOA municipal · 2026' },
    { label: 'Orçamento planejado por habitante', value: formatCurrency(plannedBudgetPerCapita), caption: 'LOA ÷ população estimada', simpleExplanation: 'Valor orçamentário planejado dividido pela população estimada. É uma razão de planejamento, não gasto efetivamente realizado.', icon: Gauge, sourceId: d.budget.sourceId, referenceDate: '2026-07-01', nature: 'Derivado', sourceLabel: 'Cálculo · LOA 2026 ÷ IBGE 2026' },
    { label: 'Densidade demográfica', value: formatNumber(density, 1) + ' hab/km²', caption: 'cálculo: população ÷ área', simpleExplanation: 'Média de habitantes por km².', icon: Map, sourceId: 'ibge-estimativas-2026', referenceDate: '2026-07-01', nature: 'Derivado', sourceLabel: 'Cálculo · IBGE 2026' },
  ];

  return (
    <section id="dashboard" className="dashboard-shell mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14" aria-labelledby="dashboard-title">
      <div className="dashboard-heading-card mb-6 rounded-[28px] border border-white/8 bg-white/[0.025] p-4 sm:p-5 light:border-slate-200 light:bg-slate-50/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            titleId="dashboard-title"
            eyebrow={languageMode === 'simple' ? 'Números da cidade' : 'Visão geral'}
            title={languageMode === 'simple' ? 'Os principais números' : 'Os números de referência'}
            description={languageMode === 'simple'
              ? 'Toque em um número para ver a fonte.'
              : 'Indicadores principais em uma camada enxuta. Clique em um número para abrir fonte, referência e metodologia.'}
          />
          <div className="flex flex-wrap items-center gap-2" aria-label="Estado do painel">
            <span className="dashboard-status-chip"><Database className="h-3.5 w-3.5" aria-hidden="true" /> Dados rastreáveis</span>
            <span className="dashboard-status-chip"><Info className="h-3.5 w-3.5" aria-hidden="true" /> Atualizado em {d.meta.updatedAt.split('-').reverse().join('/')}</span>
          </div>
        </div>
      </div>

      <div className="mb-3 rounded-2xl border border-amber-300/10 bg-amber-300/[0.025] p-4 light:border-amber-300/50 light:bg-amber-50/60">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200 light:text-amber-700" aria-hidden="true" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200/80 light:text-amber-700">O que merece atenção</div>
            <div className="mt-2 grid gap-2 text-xs leading-5 text-slate-400 sm:grid-cols-3 light:text-slate-600">
              <p>População: 2022 é Censo; 2025 e 2026 são estimativas do IBGE.</p>
              <p>Eleitorado: o valor de 2026 é um snapshot e tem data própria de referência.</p>
              <p>Indicadores do painel podem usar anos-base diferentes; compare sempre a referência.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{languageMode === 'simple' ? 'Resumo' : 'Indicadores principais'}</div>
          <p className="mt-1 text-xs text-slate-500">{languageMode === 'simple' ? 'Cinco números para começar.' : 'Cada KPI abre fonte, referência e metodologia.'}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metricDetails.map(({ label, value, caption, simpleExplanation, icon: Icon, sourceId, referenceDate, status, note, nature, sourceLabel }) => (
          <button key={label} type="button" onClick={() => dispatchInspect({ label, value, sourceId, referenceDate, status, note, method: nature === 'Derivado' ? 'Cálculo derivado a partir das fontes e premissas exibidas.' : undefined })} className="metric-interactive dashboard-kpi-card text-left">
            <Card className="dashboard-kpi-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{label}</div>
                  <div className="mt-2 text-3xl font-black text-white light:text-slate-900">{value}</div>
                  <div className="mt-1 text-[10px] font-semibold text-sky-300/80 light:text-sky-700">{sourceLabel}{referenceDate ? ' · ' + referenceDate.split('-').reverse().join('/') : ''}</div>
                  {languageMode === 'simple' ? (
                    <div className="simple-detail mt-2 text-[11px] leading-5 text-slate-400 light:text-slate-600">{simpleExplanation}</div>
                  ) : (
                    <>
                      <div className="mt-1 text-xs text-slate-500">{caption}</div>
                      <div className="technical-detail mt-2 text-[11px] leading-5 text-slate-400 light:text-slate-600">Fonte, data e método no inspetor.</div>
                    </>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="kpi-source-pill inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide">{nature}</span>
                    <span className="inline-flex items-center rounded-full border border-white/8 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 light:border-slate-200">
                      {languageMode === 'simple' ? 'Conferir' : 'Abrir'}
                    </span>
                  </div>
                  {languageMode === 'technical' && (
                    <span className="technical-detail mt-2 block text-[10px] text-slate-500">{referenceDate ? 'ref. ' + referenceDate.split('-').reverse().join('/') : 'sem referência'}</span>
                  )}
                </div>
                <Icon className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
              </div>
            </Card>
          </button>
        ))}
      </div>

      {languageMode === 'simple' ? (
        <div className="simple-detail mt-3 rounded-2xl border border-sky-300/10 bg-sky-300/[0.035] px-4 py-3 text-xs leading-5 text-slate-300 light:text-slate-600">
          Cada número tem sua própria data. Toque para conferir a fonte.
        </div>
      ) : (
        <div className="technical-detail mt-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs leading-5 text-slate-500 light:border-slate-200 light:bg-slate-50/70">
          <strong className="text-slate-300 light:text-slate-700">Antes de comparar:</strong> população e eleitorado são universos diferentes e podem ter datas de referência diferentes. A razão eleitorado/população é um cálculo estatístico; não mede comparecimento às urnas.
        </div>
      )}

      <HistoricalTrendChart />

      {languageMode === 'technical' && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button type="button" className="metric-interactive technical-mini-kpi text-left" onClick={() => dispatchInspect({ label: 'Mudança da população', value: '+' + formatPercent(populationGrowthPct, 2), sourceId: 'ibge-estimativas-2026', referenceDate: '2026-07-01', status: 'derivado' })}>
            <Card><div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">População</div><div className="mt-2 text-3xl font-black text-white light:text-slate-900">+{formatPercent(populationGrowthPct, 2)}</div><div className="mt-1 text-xs text-slate-500">mudança desde 2022</div></Card>
          </button>
          <button type="button" className="metric-interactive technical-mini-kpi text-left" onClick={() => dispatchInspect({ label: 'Relação eleitorado/população', value: formatPercent(electorateShare, 2), sourceId: 'tse-eleitorado-2026', referenceDate: d.electoral.snapshotDate, status: 'derivado' })}>
            <Card><div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Eleitorado</div><div className="mt-2 text-3xl font-black text-white light:text-slate-900">{formatPercent(electorateShare, 2)}</div><p className="mt-1 text-xs text-slate-500">relação estatística</p></Card>
          </button>
          <button type="button" className="metric-interactive technical-mini-kpi text-left" onClick={() => dispatchInspect({ label: 'Área territorial', value: formatNumber(area, 3) + ' km²', sourceId: 'ibge-cidades-2026', referenceDate: '2025-01-01' })}>
            <Card><div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Área</div><div className="mt-2 text-2xl font-black text-white light:text-slate-900">{formatNumber(area, 3)} km²</div><p className="mt-1 text-xs text-slate-500">base do cálculo de densidade</p></Card>
          </button>
        </div>
      )}
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
                ['Empresas ativas', formatNumber(Number(municipalIndicator('companies'))), 'snapshot 2026', 'caged-sebrae-2026'],
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
                <button key={label} type="button" onClick={() => dispatchInspect({ label, value, sourceId, referenceDate: year + '-12-31' })} className="metric-interactive rounded-2xl border border-white/8 bg-black/10 p-4 text-left hover:border-sky-300/20 light:bg-white">
                  <div className="text-xs font-semibold text-slate-500">{label}</div>
                  <div className="mt-2 text-xl font-black text-white light:text-slate-900">{value}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{year}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="technical-detail mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-sky-300/10 bg-sky-300/[0.03] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-300/80">Leitura metodológica</div>
              <p className="mt-2 text-xs leading-5 text-slate-400">Os valores podem vir de censo, estimativa, snapshot ou cálculo derivado. O inspetor informa a natureza de cada número para evitar comparações indevidas.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Eleitorado</div>
              <p className="mt-2 text-xs leading-5 text-slate-400">O recorte local registra 125.062 eleitores, enquanto o consolidado indicado no modelo é 125.501. A diferença é exibida como reconciliação, não como erro automático.</p>
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
            {[['Escolarização 6–14', formatPercent(Number(municipalIndicator('schooling-6-14')), 1), '2022', 'ibge-cidades-2026'],['Mortalidade infantil', formatNumber(Number(municipalIndicator('infant-mortality')), 2) + '‰', '2025', 'ibge-cidades-2026'],['Receitas brutas', 'R$ ' + (Number(municipalIndicator('revenue-2025')) / 1_000_000).toFixed(1).replace('.', ',') + ' mi', '2025', 'ibge-cidades-2026'],['PIB per capita', 'R$ ' + formatNumber(Number(municipalIndicator('gdp-per-capita-2023')), 2), '2023', 'ibge-cidades-2026'],['Área urbanizada', formatNumber(Number(municipalIndicator('urbanized-area')), 2) + ' km²', '2019', 'ibge-cidades-2026'],['Arborização viária', formatPercent(Number(municipalIndicator('street-arborization')), 2), '2022', 'ibge-cidades-2026'],['Esgotamento adequado', formatPercent(Number(municipalIndicator('adequate-sewerage')), 2), '2022', 'ibge-cidades-2026'],['Pessoal ocupado', formatNumber(Number(municipalIndicator('formal-workers'))) + ' pessoas', '2024', 'ibge-cidades-2026']].map(([label,value,year,sourceId]) => <button key={label} type="button" onClick={() => dispatchInspect({ label, value, sourceId, referenceDate: year + '-12-31' })} className="metric-interactive rounded-2xl border border-white/8 bg-black/10 p-4 text-left hover:border-sky-300/20 light:bg-white"><div className="text-xs font-semibold text-slate-500">{label}</div><div className="mt-2 text-xl font-black text-white light:text-slate-900">{value}</div><div className="mt-1 text-[11px] text-slate-500">ano-base {year}</div></button>)}
          </div>
        </div>
      )}
    </section>
  );
}
