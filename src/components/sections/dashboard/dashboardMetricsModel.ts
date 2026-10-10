import { Droplets, Gauge, Map, Users } from 'lucide-react';
import { indicatorReference } from '../../../lib/indicatorReference';
import { observatorioData as d } from '../../../data/observatorioData';
import { formatBudgetCurrency, formatNumber, formatPercent } from '../../../utils/formatters';

interface MetricDetail {
  readonly label: string;
  readonly value: string;
  readonly caption: string;
  readonly simpleExplanation: string;
  readonly icon: typeof Users;
  readonly sourceId: string;
  readonly referenceDate?: string;
  readonly referenceLabel?: string;
  readonly status?: string;
  readonly note?: string;
  readonly nature: string;
  readonly sourceLabel: string;
}

export function buildDashboardMetricsModel() {
  const density = Number(d.indicators.find(i => i.id === 'density')?.value ?? 0);
  const area = Number(d.indicators.find(i => i.id === 'area')?.value ?? 0);
  const population2022 = d.populationSeries.find(p => p.year === 2022)?.value ?? 0;
  const population2026 = d.populationSeries.find(p => p.year === 2026)?.value ?? 0;
  const populationGrowthPct = population2022 ? ((population2026 - population2022) / population2022) * 100 : 0;
  const municipalIndicator = (id: string) => d.indicators.find(i => i.id === id)?.value ?? 0;
  const indicatorMeta = (id: string) => d.indicators.find(i => i.id === id);
  const sourceMeta = (id: string) => d.sources.find(source => source.id === id);
  const sourceReferenceDate = (id: string) => sourceMeta(id)?.referenceDate;
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

  const metricDetails: readonly MetricDetail[] = [
    { label: 'Variação da população', value: '+' + formatPercent(populationGrowthPct, 2), caption: formatNumber(population2022) + ' → ' + formatNumber(population2026), simpleExplanation: 'Mudança percentual da população entre 2022 e 2026.', icon: Users, sourceId: 'ibge-estimativas-2026', referenceDate: sourceReferenceDate('ibge-estimativas-2026'), nature: 'Derivado', sourceLabel: 'Cálculo · IBGE 2022 → 2026' },
    ...['water-access-2024', 'public-sewer-service-2024'].flatMap(id => {
      const item = indicatorMeta(id);
      if (!item) return [];
      const source = sourceMeta(item.sourceId);
      return [{ label: item.label, value: formatPercent(Number(item.value), 1), caption: 'percentual publicado pelo SINISA', simpleExplanation: id.startsWith('water') ? 'Acesso à água no ano-base publicado. Não informa a continuidade do abastecimento.' : 'Acesso ao serviço público de esgoto. Não equivale a percentual de esgoto tratado.', icon: Droplets, sourceId: item.sourceId, referenceDate: item.referenceDate, referenceLabel: indicatorReference(item, source).label, status: item.status, note: item.note, nature: 'Observação', sourceLabel: source?.label ?? 'Fonte não informada' }];
    }),
    { label: 'Densidade demográfica', value: formatNumber(density, 1) + ' hab/km²', caption: 'população ÷ área', simpleExplanation: 'Média estimada de habitantes por quilômetro quadrado.', icon: Gauge, sourceId: 'ibge-estimativas-2026', referenceDate: sourceReferenceDate('ibge-estimativas-2026'), nature: 'Derivado', sourceLabel: 'Cálculo · IBGE 2026' },
    { label: 'Área territorial', value: formatNumber(area, 3) + ' km²', caption: 'base territorial', simpleExplanation: 'Área usada nos cálculos de densidade e contexto municipal.', icon: Map, sourceId: 'ibge-cidades-2026', referenceDate: indicatorMeta('area')?.referenceDate ?? sourceReferenceDate('ibge-cidades-2026'), nature: 'Observação', sourceLabel: 'IBGE · perfil municipal' },
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

  const technicalIndicators = [
    ...thematicIndicators,
    { id: 'basic-enrollments-2025', label: 'Matrículas básicas', value: formatNumber(Number(municipalIndicator('basic-enrollments-2025'))), fallbackReference: '2025', fallbackSourceId: 'pee-go-educacao-2025' },
    { id: 'municipal-enrollments-2025', label: 'Matrículas municipais', value: formatNumber(Number(municipalIndicator('municipal-enrollments-2025'))), fallbackReference: '2025', fallbackSourceId: 'pee-go-educacao-2025' },
    { id: 'ept-technical-2025', label: 'EPT técnica', value: formatNumber(Number(municipalIndicator('ept-technical-2025'))), fallbackReference: '2025', fallbackSourceId: 'pee-go-ept-2025' },
    { id: 'expenses-2025', label: 'Despesa bruta empenhada', value: 'R$ ' + (Number(municipalIndicator('expenses-2025')) / 1_000_000).toFixed(1).replace('.', ',') + ' mi', fallbackReference: '2025', fallbackSourceId: 'ibge-cidades-2026' },
  ] as const;

  const ibgeProfileIndicators = [
    { id: 'schooling-6-14', label: 'Escolarização 6–14', value: formatPercent(Number(municipalIndicator('schooling-6-14')), 1), fallbackReference: '2022', fallbackSourceId: 'ibge-cidades-2026' },
    { id: 'infant-mortality', label: 'Mortalidade infantil', value: formatNumber(Number(municipalIndicator('infant-mortality')), 2) + '‰', fallbackReference: '2025', fallbackSourceId: 'ibge-cidades-2026' },
    { id: 'revenue-2025', label: 'Receitas brutas', value: 'R$ ' + (Number(municipalIndicator('revenue-2025')) / 1_000_000).toFixed(1).replace('.', ',') + ' mi', fallbackReference: '2025', fallbackSourceId: 'ibge-cidades-2026' },
    { id: 'gdp-per-capita-2023', label: 'PIB per capita', value: 'R$ ' + formatNumber(Number(municipalIndicator('gdp-per-capita-2023')), 2), fallbackReference: '2023', fallbackSourceId: 'ibge-cidades-2026' },
    { id: 'urbanized-area', label: 'Área urbanizada', value: formatNumber(Number(municipalIndicator('urbanized-area')), 2) + ' km²', fallbackReference: '2019', fallbackSourceId: 'ibge-cidades-2026' },
    { id: 'street-arborization', label: 'Arborização viária', value: formatPercent(Number(municipalIndicator('street-arborization')), 2), fallbackReference: '2022', fallbackSourceId: 'ibge-cidades-2026' },
    { id: 'adequate-sewerage', label: 'Esgotamento adequado', value: formatPercent(Number(municipalIndicator('adequate-sewerage')), 2), fallbackReference: '2022', fallbackSourceId: 'ibge-cidades-2026' },
    { id: 'formal-workers', label: 'Pessoal ocupado', value: formatNumber(Number(municipalIndicator('formal-workers'))) + ' pessoas', fallbackReference: '2024', fallbackSourceId: 'ibge-cidades-2026' },
  ] as const;

  return {
    comparisonDetails,
    metricDetails,
    thematicIndicators,
    technicalIndicators,
    ibgeProfileIndicators,
  };
}
