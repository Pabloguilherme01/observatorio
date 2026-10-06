import { observatorioData as d } from '../../../data/observatorioData';
import { formatIndicatorStatus } from '../../../utils/dataLabels';

export function formatSummaryBrl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function buildExecutiveSummaryModel() {
  const electorate = d.electoral;
  const populationPoint = [...d.populationSeries]
    .filter(point => point.kind === 'estimate')
    .sort((a, b) => b.year - a.year)[0] ?? d.populationSeries[d.populationSeries.length - 1];
  const population = populationPoint?.value ?? 0;
  const populationIndicator = populationPoint
    ? d.indicators.find(item => item.id === `population-${populationPoint.year}`)
    : undefined;
  const populationSource = d.sources.find(sourceItem => sourceItem.id === (populationIndicator?.sourceId ?? populationPoint?.sourceId));
  const populationReferenceDate = populationIndicator?.referenceDate ?? populationPoint?.referenceDate ?? populationSource?.referenceDate;
  const sanitationPct = d.sanitation.publicSewerServicePct;
  const sanitationIndicator = d.indicators
    .filter(item => item.id.startsWith('public-sewer-service-') && item.sourceId === d.sanitation.sourceId)
    .sort((a, b) => (b.referenceDate ?? '').localeCompare(a.referenceDate ?? ''))[0];
  const sanitationSource = d.sources.find(sourceItem => sourceItem.id === (sanitationIndicator?.sourceId ?? d.sanitation.sourceId));
  const sanitationReferenceDate = sanitationIndicator?.referenceDate ?? sanitationSource?.referenceDate;
  const budget = d.budget.totalBrl;
  const budgetPerCapitaIndicator = d.indicators.find(item => item.id === `budget-per-capita-${d.budget.year}`);
  const budgetPerCapita = Number(budgetPerCapitaIndicator?.value ?? (population > 0 ? budget / population : 0));
  const budgetSource = d.sources.find(sourceItem => sourceItem.id === d.budget.sourceId);
  const budgetPerCapitaReferenceDate = budgetPerCapitaIndicator?.referenceDate ?? budgetSource?.referenceDate;

  const publicFacts = [
    {
      id: 'populacao',
      label: 'População estimada',
      value: population.toLocaleString('pt-BR') + ' hab.',
      note: populationIndicator?.note ?? 'Estimativa populacional; confira a data de referência antes de comparar com censos.',
      source: populationSource?.label ?? 'IBGE',
      badge: formatIndicatorStatus(populationIndicator?.status, 'Fonte pública'),
      status: populationIndicator?.status ?? 'current',
      referenceDate: populationReferenceDate,
      target: 'dashboard',
      guidedQuestion: 'É uma estimativa populacional ou um valor de censo?',
    },
    {
      id: 'eleitorado',
      label: 'Eleitorado',
      value: electorate.electorate.toLocaleString('pt-BR') + ' eleitores',
      note: 'Registro do eleitorado no recorte indicado; não representa comparecimento nem população total.',
      source: d.sources.find(sourceItem => sourceItem.id === electorate.sourceId)?.label ?? 'TSE',
      badge: formatIndicatorStatus('snapshot', 'Fonte pública'),
      status: 'snapshot',
      referenceDate: electorate.snapshotDate,
      target: 'eleitorado',
      guidedQuestion: 'Este total representa eleitorado, população ou comparecimento?',
    },
    {
      id: 'orcamento-per-capita',
      label: 'Orçamento planejado por habitante',
      value: formatSummaryBrl(budgetPerCapita) + '/ano',
      note: budgetPerCapitaIndicator?.note ?? 'Razão de planejamento; não representa gasto executado por pessoa.',
      source: d.sources.find(sourceItem => sourceItem.id === budgetPerCapitaIndicator?.sourceId)?.label ?? budgetSource?.label ?? 'LOA municipal',
      badge: formatIndicatorStatus(budgetPerCapitaIndicator?.status, 'Fonte pública'),
      status: budgetPerCapitaIndicator?.status ?? 'derived',
      referenceDate: budgetPerCapitaReferenceDate,
      target: 'orcamento',
      guidedQuestion: 'Este valor representa planejamento autorizado ou execução financeira?',
    },
    {
      id: 'saneamento',
      label: 'Atendimento de esgoto · serviço público',
      value: sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%',
      note: sanitationIndicator?.note ?? 'Cobertura do serviço público; não representa automaticamente coleta ou tratamento.',
      source: sanitationSource?.label ?? 'Fonte de saneamento',
      badge: formatIndicatorStatus(sanitationIndicator?.status, 'Fonte pública'),
      status: sanitationIndicator?.status ?? 'historical',
      referenceDate: sanitationReferenceDate,
      target: 'saude',
      guidedQuestion: 'Este percentual mede qual etapa do serviço de esgotamento?',
    },
  ] as const;

  const topics = [
    { id: 'eleitoral', label: 'Eleitoral', target: 'eleitoral360', caption: 'eleitorado, participação e candidaturas' },
    { id: 'cidade', label: 'Cidade', target: 'dashboard', caption: 'população e indicadores municipais' },
    { id: 'servicos', label: 'Serviços públicos', target: 'acao', caption: 'saúde, saneamento e canais oficiais' },
    { id: 'recursos', label: 'Orçamento', target: 'orcamento', caption: 'planejamento, funções e alterações' },
  ] as const;

  return {
    electorate,
    population,
    populationReferenceDate,
    sanitationPct,
    sanitationReferenceDate,
    budget,
    budgetSource,
    budgetPerCapita,
    budgetPerCapitaReferenceDate,
    publicFacts,
    topics,
  };
}
