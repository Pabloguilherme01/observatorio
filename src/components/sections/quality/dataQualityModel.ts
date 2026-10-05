import { observatorioData as d } from '../../../data/observatorioData';
import generated from '../../../data/generated/tse2026-candidates.json';

export function buildDataQualityModel() {
  const derived = d.indicators.filter(i => i.status === 'derived').length;
  const current = d.indicators.filter(i => i.status === 'current').length;
  const historical = d.indicators.filter(i => i.status === 'historical').length;
  const officialSources = d.sources.filter(source => source.nature === 'official').length;
  const secondarySources = d.sources.filter(source => source.nature === 'secondary').length;
  const snapshot = d.indicators.filter(i => i.status === 'snapshot').length;
  const planned = d.indicators.filter(i => i.status === 'planned').length;
  const datedIndicators = d.indicators.filter(i => Boolean(i.referenceDate) || Boolean(d.sources.find(source => source.id === i.sourceId)?.referenceDate)).length;
  const datedCoverage = d.indicators.length ? (datedIndicators / d.indicators.length) * 100 : 0;
  const sourceLinkedIndicators = d.indicators.filter(indicator => {
    const source = d.sources.find(item => item.id === indicator.sourceId);
    return Boolean(source?.resourceUrl || source?.url);
  }).length;
  const missingDateIndicators = d.indicators.length - datedIndicators;
  const missingSourceIndicators = d.indicators.length - sourceLinkedIndicators;
  const indicatorsNeedingDocumentation = d.indicators.filter(indicator => {
    const source = d.sources.find(item => item.id === indicator.sourceId);
    const hasDate = Boolean(indicator.referenceDate || source?.referenceDate);
    const hasSourceLink = Boolean(source?.resourceUrl || source?.url);
    return !hasDate || !hasSourceLink;
  });
  const poll = d.polls[0];
  const pollNamedPct = poll.results.reduce((sum, result) => sum + result.percentage, 0);
  const pollCoveredPct = pollNamedPct + (poll.nonePct ?? 0) + (poll.notSurePct ?? 0);
  const pollGapPct = Math.max(0, 100 - pollCoveredPct);
  const tseState = generated.meta.state;
  const tsePresentation = {
    first_capture: { label: 'Capturado', tone: 'text-emerald-300' },
    synced: { label: 'Sincronizado', tone: 'text-emerald-300' },
    unchanged: { label: 'Sem alterações', tone: 'text-emerald-300' },
    changed: { label: 'Alterado', tone: 'text-amber-300' },
    stale: { label: 'Desatualizado', tone: 'text-amber-300' },
    local_filter_pending: { label: 'Validação municipal pendente', tone: 'text-amber-300' },
    failed: { label: 'Falha na sincronização', tone: 'text-rose-300' },
    not_synced: { label: 'Aguardando captura', tone: 'text-amber-300' },
  } as const;
  const tseStatus = tsePresentation[tseState as keyof typeof tsePresentation] ?? { label: 'Estado desconhecido', tone: 'text-slate-300' };
  const tseCapturedAt = generated.meta.downloadedAt ? new Date(generated.meta.downloadedAt) : null;
  const resultsSource = d.sources.find(source => source.id === 'tse-resultados-2026');
  const unresolved = generated.diff?.unresolved ?? 0;
  const currentStatedBeds = d.health.currentStatedWardBeds + d.health.currentStatedIcuBeds;
  const planningBeds = d.health.plannedBeds ?? d.health.openingReportedBeds;
  const warnings = [
    pollGapPct > 0 ? 'Pesquisa: ' + pollGapPct.toFixed(2).replace('.', ',') + ' p.p. estão fora das categorias publicadas.' : null,
    d.education?.note ? 'Educação: a faixa do Ideb 2025 está marcada como pendente de conferência pontual no INEP.' : null,
    'Orçamento: organizações, unidades e funções são níveis de classificação diferentes e não devem ser somados entre si.',
    `Saúde: as referências de leitos — ${d.health.openingReportedBeds.toLocaleString('pt-BR')} na inauguração, ${currentStatedBeds.toLocaleString('pt-BR')} no portal atual e ${planningBeds.toLocaleString('pt-BR')} no planejamento — têm naturezas distintas e não formam uma série contínua de capacidade instalada.`,
    'Candidaturas: a captura estadual foi registrada, mas o recorte local atual é documental e não equivale ao universo municipal completo.',
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
    pollGapPct,
    tseStatus,
    tseCapturedAt,
    resultsSource,
    unresolved,
    warnings,
  };
}
