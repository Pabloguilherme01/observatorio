import { observatorioData as d } from '../../../data/observatorioData';
import { indicatorReference } from '../../../lib/indicatorReference';
import { formatIndicatorStatus } from '../../../utils/dataLabels';
import { formatBudgetCurrency, formatNumber, formatPercent } from '../../../utils/formatters';

export function buildExecutiveSummaryModel() {
  const choices = [
    { id:'populacao', indicatorId:'population-'+[...d.populationSeries].sort((a,b) => b.year-a.year)[0]?.year, label:'População estimada', target:'dashboard' },
    { id:'agua', prefix:'water-access-', label:'Acesso à água', target:'saude' },
    { id:'orcamento-per-capita', indicatorId:'budget-per-capita-'+d.budget.year, label:'Orçamento planejado por habitante', target:'orcamento' },
    { id:'saneamento', prefix:'public-sewer-service-', label:'Atendimento de esgoto · serviço público', target:'saude' },
  ];
  const publicFacts = choices.flatMap(choice => {
    const item = d.indicators.find(item => choice.indicatorId ? item.id === choice.indicatorId : item.id.startsWith(choice.prefix!));
    if (!item) return [];
    const source = d.sources.find(source => source.id === item.sourceId);
    const value = typeof item.value === 'string' ? item.value : item.unit === '%' ? formatPercent(item.value,1) : item.unit.startsWith('BRL') ? formatBudgetCurrency(item.value) : formatNumber(item.value)+' hab.';
    return [{ ...choice, value, note:item.note ?? 'Confira a definição na fonte.', source:source?.label ?? 'Fonte não informada', badge:formatIndicatorStatus(item.status), referenceLabel:indicatorReference(item,source).label, target:choice.target }];
  });
  return { publicFacts };
}
