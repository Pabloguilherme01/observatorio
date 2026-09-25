import { ExternalLink, MapPin, Users, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { contextualMetrics, contextualMunicipalities, type ContextMetricId } from '../../data/contextualComparison';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

function formatValue(id: ContextMetricId, value: number) {
  if (id === 'population') return value.toLocaleString('pt-BR');
  if (id === 'schooling') return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  if (id === 'infantMortality') return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '‰';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
}

export function ContextComparison() {
  const [metricId, setMetricId] = useState<ContextMetricId>('population');
  const metric = contextualMetrics.find(item => item.id === metricId)!;

  const formatPopulation = (value: number) => value.toLocaleString('pt-BR');
  const formatArea = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' km²';

  return (
    <section id="contexto" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14" aria-labelledby="context-title">
      <SectionHeader
        titleId="context-title"
        eyebrow="Contexto"
        title="Compare sem transformar em ranking"
        description="A comparação serve para dar escala aos números de Águas Lindas. São oito municípios de referência; cada indicador mantém seu ano-base e definição, sem nota, posição ou ranking."
      />
      <div className="context-comparison-shell rounded-3xl border border-white/10 bg-white/[0.025] p-4 light:border-slate-200 light:bg-slate-50/70 sm:p-6">
        <div className="context-comparison-meta">
          <span><Users aria-hidden="true" /> 8 municípios</span>
          <span><MapPin aria-hidden="true" /> Referências de Goiás</span>
          <span><Maximize2 aria-hidden="true" /> 4 indicadores</span>
        </div>

        <div className="context-comparison-tabs" role="tablist" aria-label="Indicador para comparação contextual">
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
        <div className="mt-4 rounded-2xl border border-white/8 bg-black/10 p-4 light:border-slate-200 light:bg-white">
          <div className="text-sm font-bold text-white light:text-slate-900">{metric.label}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{metric.description}</p>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">Ano-base: {metric.year} · unidade: {metric.unit}</div>
        </div>

        <div className="context-comparison-cards mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {contextualMunicipalities.map(place => (
            <Card key={place.ibgeCode} className="context-comparison-card p-4 sm:p-5">
              <div className="context-city-head">
                <div>
                  <div className="context-city-name">{place.name}</div>
                  <div className="context-city-code">IBGE · {place.ibgeCode}</div>
                </div>
                <span className="context-city-badge">GO</span>
              </div>
              <div className="context-city-value">{formatValue(metric.id, place.values[metric.id])}</div>
              <div className="context-city-source">IBGE · ano-base {metric.year}</div>
              <div className="context-city-details">
                <span><strong>Censo 2022</strong>{formatPopulation(place.census2022Population)} hab.</span>
                <span><strong>Área 2025</strong>{formatArea(place.areaKm2)}</span>
              </div>
              <a href={place.url} target="_blank" rel="noopener noreferrer" className="context-city-link">
                Conferir ficha no IBGE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </Card>
          ))}
        </div>

        <div className="context-comparison-note mt-4 rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] p-4 text-xs leading-5 text-slate-500">
          <strong className="text-slate-300 light:text-slate-700">Como ler:</strong> os valores estão lado a lado para fornecer contexto. Um valor maior ou menor não recebe automaticamente o significado de “melhor” ou “pior”, porque cada indicador mede uma dimensão diferente e pode ter limites e denominadores próprios.
        </div>
      </div>
    </section>
  );
}
