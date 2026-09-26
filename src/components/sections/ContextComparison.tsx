import {
  Baby,
  BarChart3,
  ExternalLink,
  Gauge,
  GraduationCap,
  Map,
  MapPin,
  Maximize2,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  contextualMetrics,
  contextualMunicipalities,
  getContextMetricValue,
  type ContextMetricId,
} from '../../data/contextualComparison';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { PremiumInfoCard } from '../ui/PremiumInfoCard';

function formatValue(id: ContextMetricId, value: number) {
  if (id === 'population') return value.toLocaleString('pt-BR') + ' hab.';
  if (id === 'populationGrowth') return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
  if (id === 'density2026') return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' hab/km²';
  if (id === 'area') return value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' km²';
  if (id === 'schooling') return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  if (id === 'infantMortality') return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '‰';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
}

const metricIcons = {
  population: Users,
  populationGrowth: TrendingUp,
  density2026: Gauge,
  area: Map,
  schooling: GraduationCap,
  infantMortality: Baby,
  gdpPerCapita: WalletCards,
} as const;

export function ContextComparison() {
  const [metricId, setMetricId] = useState<ContextMetricId>('population');
  const [selectedCode, setSelectedCode] = useState('5200258');
  const metric = contextualMetrics.find(item => item.id === metricId) ?? contextualMetrics[0];
  const selectedPlace = contextualMunicipalities.find(place => place.ibgeCode === selectedCode) ?? contextualMunicipalities[0];
  const MetricIcon = metricIcons[metric.id];

  const selectedFacts = useMemo(() => [
    {
      id: 'population',
      label: 'Estimativa 2026',
      value: formatValue('population', getContextMetricValue(selectedPlace, 'population')),
      note: 'Estimativa populacional do IBGE.',
    },
    {
      id: 'census',
      label: 'Censo 2022',
      value: selectedPlace.census2022Population.toLocaleString('pt-BR') + ' hab.',
      note: 'População recenseada.',
    },
    {
      id: 'growth',
      label: 'Variação 2022 → 2026',
      value: formatValue('populationGrowth', getContextMetricValue(selectedPlace, 'populationGrowth')),
      note: 'Cálculo derivado do observatório.',
    },
    {
      id: 'density',
      label: 'Densidade estimada 2026',
      value: formatValue('density2026', getContextMetricValue(selectedPlace, 'density2026')),
      note: 'Estimativa populacional ÷ área.',
    },
    {
      id: 'area',
      label: 'Área territorial',
      value: formatValue('area', getContextMetricValue(selectedPlace, 'area')),
      note: 'Referência territorial do IBGE.',
    },
    {
      id: 'schooling',
      label: 'Escolarização 6–14',
      value: formatValue('schooling', getContextMetricValue(selectedPlace, 'schooling')),
      note: 'Ano-base 2022.',
    },
    {
      id: 'infant-mortality',
      label: 'Mortalidade infantil',
      value: formatValue('infantMortality', getContextMetricValue(selectedPlace, 'infantMortality')),
      note: 'Ano-base 2025.',
    },
    {
      id: 'gdp',
      label: 'PIB per capita',
      value: formatValue('gdpPerCapita', getContextMetricValue(selectedPlace, 'gdpPerCapita')),
      note: 'Ano-base 2023.',
    },
  ], [selectedPlace]);

  return (
    <section id="contexto" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14" aria-labelledby="context-title">
      <SectionHeader
        titleId="context-title"
        eyebrow="Contexto municipal"
        title="Compare cidades com mais profundidade, sem ranking"
        description="Oito municípios de referência agora podem ser explorados por sete indicadores e por um perfil municipal completo. Cada valor mantém período, unidade, fonte e natureza explícitos."
      />

      <div className="context-comparison-shell rounded-3xl border border-white/10 bg-white/[0.025] p-4 light:border-slate-200 light:bg-slate-50/70 sm:p-6">
        <div className="context-comparison-meta">
          <span><Users aria-hidden="true" /> 8 municípios</span>
          <span><MapPin aria-hidden="true" /> Referências de Goiás</span>
          <span><BarChart3 aria-hidden="true" /> 7 indicadores</span>
        </div>

        <section className="context-city-profile mt-4" aria-labelledby="context-city-profile-title">
          <div className="context-city-profile-head">
            <div>
              <span className="context-city-profile-kicker">Perfil municipal</span>
              <h3 id="context-city-profile-title">{selectedPlace.name}</h3>
              <p>Dados oficiais e cálculos derivados organizados em cartões para leitura rápida.</p>
            </div>
            <label className="context-city-selector">
              <span>Selecionar cidade</span>
              <select value={selectedCode} onChange={event => setSelectedCode(event.target.value)}>
                {contextualMunicipalities.map(place => (
                  <option key={place.ibgeCode} value={place.ibgeCode}>{place.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="context-city-profile-grid" aria-label={'Perfil de ' + selectedPlace.name}>
            {selectedFacts.map(fact => (
              <article key={fact.id} className="context-city-profile-card">
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
                <small>{fact.note}</small>
              </article>
            ))}
          </div>

          <a href={selectedPlace.url} target="_blank" rel="noopener noreferrer" className="context-city-profile-source">
            Conferir ficha oficial de {selectedPlace.name} no IBGE
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </section>

        <div className="context-comparison-tabs mt-5" role="tablist" aria-label="Indicador para comparação contextual">
          {contextualMetrics.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={metricId === item.id}
              onClick={() => setMetricId(item.id)}
              className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-bold transition ${metricId === item.id
                ? 'border-sky-300/30 bg-sky-300/10 text-sky-200 light:border-slate-300 light:bg-white light:text-slate-800'
                : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-slate-200 light:border-slate-200 light:bg-white light:text-slate-600'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <PremiumInfoCard
          compact
          tone={metric.nature === 'derived' ? 'violet' : 'sky'}
          icon={MetricIcon}
          eyebrow={metric.nature === 'derived' ? 'Indicador derivado' : 'Indicador oficial'}
          title={metric.label}
          className="mt-4"
        >
          {metric.description}
          <span className="context-metric-reference">Referência: {metric.reference} · unidade: {metric.unit}</span>
        </PremiumInfoCard>

        <div className="context-comparison-cards mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {contextualMunicipalities.map(place => {
            const value = getContextMetricValue(place, metric.id);
            return (
              <Card key={place.ibgeCode} className={`context-comparison-card p-4 sm:p-5 ${selectedCode === place.ibgeCode ? 'is-selected-city' : ''}`}>
                <div className="context-city-head">
                  <div>
                    <div className="context-city-name">{place.name}</div>
                    <div className="context-city-code">IBGE · {place.ibgeCode}</div>
                  </div>
                  <button
                    type="button"
                    className="context-city-badge"
                    aria-label={'Selecionar ' + place.name}
                    onClick={() => setSelectedCode(place.ibgeCode)}
                  >
                    GO
                  </button>
                </div>
                <div className="context-city-value">{formatValue(metric.id, value)}</div>
                <div className="context-city-source">
                  {metric.nature === 'derived' ? 'Cálculo derivado · base IBGE' : 'IBGE'} · {metric.reference}
                </div>
                <div className="context-city-details">
                  <span><strong>Censo 2022</strong>{place.census2022Population.toLocaleString('pt-BR')} hab.</span>
                  <span><strong>Área</strong>{formatValue('area', place.areaKm2)}</span>
                </div>
                <a href={place.url} target="_blank" rel="noopener noreferrer" className="context-city-link">
                  Conferir ficha no IBGE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </Card>
            );
          })}
        </div>

        <PremiumInfoCard
          compact
          tone="sky"
          icon={Maximize2}
          eyebrow="Como ler"
          title="Comparação oferece contexto — não ranking"
          className="context-comparison-note mt-4"
        >
          Os valores estão lado a lado para fornecer escala e referência. Um valor maior ou menor não recebe automaticamente o significado de “melhor” ou “pior”, porque cada indicador mede uma dimensão diferente e pode ter limites e denominadores próprios.
        </PremiumInfoCard>
      </div>
    </section>
  );
}
