import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { contextualMetrics, contextualMunicipalities, type ContextMetricId } from '../../data/contextualComparison';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { ProvenanceTrigger } from '../ProvenanceTrigger';
import { AccessibleRegionMap } from '../AccessibleRegionMap';

function formatValue(id: ContextMetricId, value: number) {
  if (id === 'population') return value.toLocaleString('pt-BR');
  if (id === 'schooling') return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  if (id === 'infantMortality') return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '‰';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
}

export function ContextComparison() {
  const [metricId, setMetricId] = useState<ContextMetricId>('population');
  const metric = contextualMetrics.find(item => item.id === metricId)!;

  return (
    <section id="contexto" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="context-title">
      <SectionHeader
        titleId="context-title"
        eyebrow="Contexto"
        title="Compare sem transformar em ranking"
        description="A comparação serve para dar escala aos números de Águas Lindas. Cada indicador mantém seu ano-base e definição; o observatório não atribui nota ou posição."
      />
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 light:border-slate-200 light:bg-slate-50/70 sm:p-6">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Indicador para comparação contextual">
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

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {contextualMunicipalities.map(place => (
            <Card key={place.ibgeCode} className="p-5">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{place.name}</div>
              <div className="mt-3 text-3xl font-black tabular-nums text-white light:text-slate-900">{formatValue(metric.id, place.values[metric.id])}</div>
              <div className="mt-1 text-xs text-slate-500">IBGE · {metric.year}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ProvenanceTrigger
                  valueId={`populacao-${place.ibgeCode}`}
                  fallback={{
                    fonte: `IBGE — ${place.name}`,
                    fonteUrl: place.url,
                    referencia: String(metric.year),
                    capturadoEm: '2026-09-23',
                    tipo: 'OFICIAL',
                    transformacao: metric.id === 'population' ? 'Valor municipal apresentado conforme a série e o ano-base do comparador.' : undefined,
                    limitacoes: ['A comparação é descritiva e mantém o ano-base visível; não representa ranking.'],
                  }}
                />
                <a href={place.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-sky-200">
                  Ver ficha do município <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.02] p-5 light:border-slate-200 light:bg-slate-50/70">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300/80">Acessibilidade demonstrável</div>
          <h3 className="mt-1 text-lg font-black text-white light:text-slate-900">Mapa esquemático com navegação por teclado</h3>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">Este desenho é apenas uma demonstração de interação acessível. Não representa coordenadas geográficas nem distribuição territorial real.</p>
          <div className="mt-4">
            <AccessibleRegionMap />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] p-4 text-xs leading-5 text-slate-500">
          <strong className="text-slate-300 light:text-slate-700">Como ler:</strong> os valores estão lado a lado para fornecer contexto. Um valor maior ou menor não recebe automaticamente o significado de “melhor” ou “pior”, porque cada indicador mede uma dimensão diferente e pode ter limites e denominadores próprios.
        </div>
      </div>
    </section>
  );
}
