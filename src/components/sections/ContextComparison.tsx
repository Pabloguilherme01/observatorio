import { ExternalLink, MapPin, Users, Maximize2, Search, RotateCcw, Gauge, TrendingUp } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { contextualMetrics, contextualMunicipalities, type ContextMetricId } from '../../data/contextualComparison';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { PremiumInfoCard } from '../ui/PremiumInfoCard';

function formatValue(id: ContextMetricId, value: number) {
  if (id === 'population') return value.toLocaleString('pt-BR');
  if (id === 'populationGrowth') return (value >= 0 ? '+' : '') + value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
  if (id === 'density') return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' hab/km²';
  if (id === 'schooling') return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  if (id === 'infantMortality') return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '‰';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
}

function formatDifferenceValue(id: ContextMetricId, value: number) {
  if (id === 'populationGrowth') {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
  }
  return formatValue(id, value);
}

function formatSignedDifference(id: ContextMetricId, difference: number) {
  const sign = difference > 0 ? '+' : difference < 0 ? '−' : '';
  return sign + formatDifferenceValue(id, Math.abs(difference));
}

const normalizeCityQuery = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

export function ContextComparison() {
  const [metricId, setMetricId] = useState<ContextMetricId>('population');
  const [cityQuery, setCityQuery] = useState('');
  const metric = contextualMetrics.find(item => item.id === metricId)!;
  const normalizedQuery = normalizeCityQuery(cityQuery);
  const visibleMunicipalities = normalizedQuery
    ? contextualMunicipalities.filter(place => normalizeCityQuery(place.name).includes(normalizedQuery))
    : contextualMunicipalities;

  const referenceMunicipality = contextualMunicipalities.find(place => place.name === 'Águas Lindas de Goiás');
  const referenceValue = referenceMunicipality?.values[metricId] ?? 0;
  const formatPopulation = (value: number) => value.toLocaleString('pt-BR');
  const formatArea = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' km²';

  const handleMetricKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentId: ContextMetricId) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    const currentIndex = contextualMetrics.findIndex(item => item.id === currentId);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % contextualMetrics.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + contextualMetrics.length) % contextualMetrics.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = contextualMetrics.length - 1;

    const nextMetric = contextualMetrics[nextIndex];
    if (!nextMetric) return;
    setMetricId(nextMetric.id);
    document.getElementById(`context-metric-tab-${nextMetric.id}`)?.focus();
  };

  return (
    <section id="contexto" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14" aria-labelledby="context-title">
      <SectionHeader
        titleId="context-title"
        eyebrow="Contexto"
        title="Compare sem transformar em ranking"
        description={`A comparação serve para dar escala aos números de Águas Lindas. São ${contextualMunicipalities.length} municípios de referência e ${contextualMetrics.length} indicadores; cada um mantém seu ano-base, unidade e definição. Crescimento e densidade de 2026 são cálculos derivados, sem nota, posição ou ranking.`}
      />
      <div className="context-comparison-shell rounded-3xl border border-white/10 bg-white/[0.025] p-4 light:border-slate-200 light:bg-slate-50/70 sm:p-6">
        <div className="context-comparison-meta">
          <span><Users aria-hidden="true" /> {contextualMunicipalities.length} municípios</span>
          <span><MapPin aria-hidden="true" /> Referências de Goiás</span>
          <span><Maximize2 aria-hidden="true" /> {contextualMetrics.length} indicadores</span>
        </div>

        <div className="context-city-toolbar" aria-label="Ferramentas da comparação municipal">
          <label className="context-city-search">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Buscar município</span>
            <input
              type="search"
              value={cityQuery}
              onChange={event => setCityQuery(event.target.value)}
              placeholder="Buscar município"
              autoComplete="off"
            />
          </label>
          <span className="context-city-count" aria-live="polite">
            {visibleMunicipalities.length} de {contextualMunicipalities.length} cidades
          </span>
          {cityQuery && (
            <button type="button" className="context-city-reset" onClick={() => setCityQuery('')}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Limpar
            </button>
          )}
        </div>

        <div className="context-comparison-tabs" role="tablist" aria-label="Indicador para comparação contextual">
          {contextualMetrics.map(item => (
            <button
              key={item.id}
              id={`context-metric-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={metricId === item.id}
              aria-controls="context-metric-panel"
              tabIndex={metricId === item.id ? 0 : -1}
              onClick={() => setMetricId(item.id)}
              onKeyDown={event => handleMetricKeyDown(event, item.id)}
              className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-bold transition ${metricId === item.id
                ? 'border-sky-300/30 bg-sky-300/10 text-sky-200 light:border-slate-300 light:bg-white light:text-slate-800'
                : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-slate-200 light:border-slate-200 light:bg-white light:text-slate-600'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          id="context-metric-panel"
          role="tabpanel"
          aria-labelledby={`context-metric-tab-${metric.id}`}
          tabIndex={0}
          className="mt-4 rounded-2xl border border-white/8 bg-black/10 p-4 light:border-slate-200 light:bg-white"
        >
          <div className="text-sm font-bold text-white light:text-slate-900">{metric.label}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{metric.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="dashboard-meta-chip" data-kind={metric.nature === 'derived' ? 'derived' : 'current'}>{metric.nature === 'derived' ? 'Derivado' : 'Publicado'}</span>
            <span className="dashboard-meta-chip">ano-base {metric.year}</span>
            <span className="dashboard-meta-chip">{metric.unit}</span>
          </div>
        </div>

        <div className="context-comparison-cards mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {visibleMunicipalities.map(place => {
            const estimatedPopulation = place.values.population;
            const growthPct = place.census2022Population
              ? ((estimatedPopulation - place.census2022Population) / place.census2022Population) * 100
              : 0;
            const density2026 = place.areaKm2 ? estimatedPopulation / place.areaKm2 : 0;
            const isReference = place.name === 'Águas Lindas de Goiás';
            const differenceFromReference = place.values[metricId] - referenceValue;

            return (
            <Card key={place.ibgeCode} className={`context-comparison-card p-4 sm:p-5 ${isReference ? 'ring-1 ring-sky-300/30' : ''}`}>
              <div className="context-city-head">
                <div>
                  <div className="context-city-name">{place.name}</div>
                  <div className="context-city-code">IBGE · {place.ibgeCode}{isReference ? ' · município de referência' : ''}</div>
                </div>
                <span className="context-city-badge">GO</span>
              </div>
              <div className="context-city-value">{formatValue(metric.id, place.values[metric.id])}</div>
              <div className="context-city-source">IBGE · ano-base {metric.year}</div>
              {!isReference && (
                <div className="mt-2 text-[11px] leading-4 text-slate-500" aria-label={`Diferença descritiva em relação a Águas Lindas: ${formatSignedDifference(metric.id, differenceFromReference)}`}>
                  Diferença numérica para Águas Lindas: {formatSignedDifference(metric.id, differenceFromReference)}
                </div>
              )}
              <div className="context-city-details context-city-fact-grid">
                <span className="context-city-fact-card"><strong>População 2026</strong>{formatPopulation(estimatedPopulation)} hab.</span>
                <span className="context-city-fact-card"><strong>Censo 2022</strong>{formatPopulation(place.census2022Population)} hab.</span>
                <span className="context-city-fact-card"><strong>Área territorial</strong>{formatArea(place.areaKm2)}</span>
                <span className="context-city-fact-card">
                  <strong><TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> Variação 2022→2026</strong>
                  {growthPct >= 0 ? '+' : ''}{growthPct.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                </span>
                <span className="context-city-fact-card context-city-fact-wide">
                  <strong><Gauge className="h-3.5 w-3.5" aria-hidden="true" /> Densidade 2026 derivada</strong>
                  {density2026.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} hab/km²
                </span>
              </div>
              <a href={place.url} target="_blank" rel="noopener noreferrer" className="context-city-link" aria-label={`Abrir ficha de ${place.name} no IBGE em nova aba`}>
                Conferir ficha no IBGE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </Card>
            );
          })}
          {visibleMunicipalities.length === 0 && (
            <div className="context-city-empty sm:col-span-2 xl:col-span-4" role="status">
              Nenhum município encontrado para “{cityQuery}”. Ajuste ou limpe a busca para ver os {contextualMunicipalities.length} municípios de referência.
            </div>
          )}
        </div>

        <PremiumInfoCard
          compact
          tone="sky"
          icon={Maximize2}
          eyebrow="Como ler"
          title="Comparação oferece contexto — não ranking"
          className="context-comparison-note mt-4"
        >
          Águas Lindas aparece como referência local; nos demais cartões, a diferença mostra apenas a distância numérica no indicador selecionado. O sinal positivo ou negativo indica direção matemática, não avaliação. Crescimento populacional e densidade 2026 são derivados dos valores publicados pelo IBGE.
        </PremiumInfoCard>
      </div>
    </section>
  );
}
