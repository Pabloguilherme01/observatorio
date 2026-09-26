import { Database, TrendingUp, Users } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { formatNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { PremiumInfoCard } from '../ui/PremiumInfoCard';

export function DemographicDynamic() {
  const source = d.sources.find(s => s.id === 'ibge-estimativas-2026');
  const max = Math.max(...d.populationSeries.map(p => p.value), 0);
  const initialPopulation = d.populationSeries.find(p => p.year === 2022)?.value ?? 0;
  const finalPopulation = d.populationSeries.at(-1)?.value ?? 0;
  const variation = initialPopulation > 0 ? (((finalPopulation / initialPopulation) - 1) * 100) : null;
  return (
    <section id="demografia" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="demografia-title">
      <SectionHeader titleId="demografia-title" eyebrow="Demografia dinâmica" title="População em perspectiva temporal" description="Censo e estimativas ficam separados para evitar que uma estimativa seja lida como contagem censitária." />
      <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <Card>
          <div className="space-y-4" role="img" aria-label={'Série populacional: ' + d.populationSeries.map(p => p.year + ' ' + formatNumber(p.value)).join('; ')}>
            {d.populationSeries.map(point => (
              <div key={point.year} className="grid grid-cols-[52px_1fr_105px] items-center gap-3 text-sm">
                <span className="font-bold text-slate-400">{point.year}</span>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-sky-300" style={{ width: (max > 0 ? (point.value / max) * 100 : 0) + '%' }} />
                </div>
                <span className="text-right font-bold text-white">{formatNumber(point.value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 p-4"><Users className="h-4 w-4 text-sky-300" /><div className="mt-2 text-xs text-slate-500">Variação 2022 → 2026</div><strong className="text-xl text-white">{variation === null ? 'Indisponível' : variation.toFixed(1).replace('.', ',') + '%'}</strong></div>
            <div className="rounded-2xl border border-white/8 p-4"><TrendingUp className="h-4 w-4 text-violet-300" /><div className="mt-2 text-xs text-slate-500">Natureza do último ponto</div><strong className="text-xl text-white">Estimativa</strong></div>
          </div>
          <PremiumInfoCard
            compact
            tone="sky"
            icon={Database}
            eyebrow="Fonte e método"
            title="Estimativa e censo permanecem separados"
            className="mt-5"
            footer={source?.url ? <a className="premium-info-link" href={source.url} target="_blank" rel="noopener noreferrer">Abrir fonte oficial</a> : undefined}
          >
            {source?.label ?? 'Fonte registrada no dataset'} · referência {source?.referenceDate ?? 'não informada'}. Variação = (valor final ÷ valor inicial − 1) × 100. As estimativas não devem ser tratadas como contagem de pessoas observada em censo.
          </PremiumInfoCard>
        </Card>
        <div className="premium-info-stack">
          <PremiumInfoCard tone="violet" icon={TrendingUp} eyebrow="Leitura rápida" title="Escala populacional com contexto">
            A série mostra mudança de escala populacional sem misturar natureza estatística. Para comparações com eleitorado, use o universo eleitoral do TSE separadamente.
          </PremiumInfoCard>
          <PremiumInfoCard tone="slate" icon={Database} eyebrow="Contrato do painel" title="Snapshot local, estrutura preservada">
            O painel atual usa o snapshot local. Uma integração automatizada pode substituir os pontos sem alterar a separação entre fonte, referência e interpretação.
          </PremiumInfoCard>
        </div>
      </div>
    </section>
  );
}
