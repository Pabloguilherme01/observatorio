import { CheckCircle2, Database, TriangleAlert } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

export function DataQualityPanel() {
  const derived = d.indicators.filter(i => i.status === 'derived').length;
  const current = d.indicators.filter(i => i.status === 'current').length;
  const historical = d.indicators.filter(i => i.status === 'historical').length;

  return (
    <section id="qualidade" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="quality-title">
      <SectionHeader
        eyebrow="Qualidade"
        title="Proveniência antes de interpretação"
        description="O V22 marca o estado do dado para que um cálculo derivado ou um snapshot histórico não pareça uma medição atual."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{current}</div>
          <div className="text-xs text-slate-500">indicadores atuais</div>
        </Card>
        <Card>
          <Database className="h-5 w-5 text-sky-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{derived}</div>
          <div className="text-xs text-slate-500">cálculos derivados</div>
        </Card>
        <Card>
          <TriangleAlert className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{historical}</div>
          <div className="text-xs text-slate-500">indicadores históricos</div>
        </Card>
      </div>
    </section>
  );
}
