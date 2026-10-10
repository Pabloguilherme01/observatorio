import { observatorioData as d } from '../../../data/observatorioData';
import { indicatorReference } from '../../../lib/indicatorReference';

export function buildDataQualityModel() {
  const derived = d.indicators.filter(i => i.status === 'derived').length;
  const current = d.indicators.filter(i => i.status === 'published').length;
  const historical = d.indicators.filter(i => i.status === 'historical').length;
  const officialSources = d.sources.filter(source => source.nature === 'official').length;
  const secondarySources = d.sources.filter(source => source.nature === 'secondary').length;
  const snapshot = d.indicators.filter(i => i.status === 'snapshot').length;
  const planned = d.indicators.filter(i => i.status === 'planned').length;
  const datedIndicators = d.indicators.filter(i => Boolean(indicatorReference(i, d.sources.find(source => source.id === i.sourceId)).key)).length;
  const datedCoverage = d.indicators.length ? (datedIndicators / d.indicators.length) * 100 : 0;
  const sourceLinkedIndicators = d.indicators.filter(indicator => {
    const source = d.sources.find(item => item.id === indicator.sourceId);
    return Boolean(source?.resourceUrl || source?.url);
  }).length;
  const missingDateIndicators = d.indicators.length - datedIndicators;
  const missingSourceIndicators = d.indicators.length - sourceLinkedIndicators;
  const indicatorsNeedingDocumentation = d.indicators.filter(indicator => {
    const source = d.sources.find(item => item.id === indicator.sourceId);
    const hasDate = Boolean(indicatorReference(indicator, source).key);
    const hasSourceLink = Boolean(source?.resourceUrl || source?.url);
    return !hasDate || !hasSourceLink;
  });
  const currentStatedBeds = d.health.currentStatedWardBeds + d.health.currentStatedIcuBeds;
  const planningBeds = d.health.plannedBeds ?? d.health.openingReportedBeds;
  const warnings = [
    d.education?.note ? 'Educação: a faixa do Ideb 2025 está marcada como pendente de conferência pontual no INEP.' : null,
    'Orçamento: organizações, unidades e funções são níveis de classificação diferentes e não devem ser somados entre si.',
    `Saúde: as referências de leitos — ${d.health.openingReportedBeds.toLocaleString('pt-BR')} na inauguração, ${currentStatedBeds.toLocaleString('pt-BR')} no portal institucional e ${planningBeds.toLocaleString('pt-BR')} no planejamento — têm naturezas distintas e não formam uma série contínua de capacidade instalada.`,
  ].filter(Boolean) as string[];

  return {
    derived,
    current,
    historical,
    officialSources,
    secondarySources,
    snapshot,
    planned,
    datedIndicators,
    datedCoverage,
    sourceLinkedIndicators,
    missingDateIndicators,
    missingSourceIndicators,
    indicatorsNeedingDocumentation,
    warnings,
  };
}
