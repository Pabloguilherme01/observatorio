import { CheckCircle2, Database, Link2, TriangleAlert } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { formatDate } from '../../utils/formatters';

export function DataQualityPanel() {
  const derived = d.indicators.filter(i => i.status === 'derived').length;
  const current = d.indicators.filter(i => i.status === 'current').length;
  const historical = d.indicators.filter(i => i.status === 'historical').length;
  const officialSources = d.sources.filter(source => source.nature === 'official').length;
  const secondarySources = d.sources.filter(source => source.nature === 'secondary').length;

  return (
    <section id="qualidade" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="quality-title">
      <SectionHeader
        titleId="quality-title"
        eyebrow="Qualidade"
        title="Proveniência antes de interpretação"
        description="O observatório separa dado atual, snapshot, histórico e cálculo derivado. A data abaixo é a última atualização do conjunto local, não uma promessa de atualização automática das fontes."
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
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Link2 className="h-4 w-4 text-sky-300" aria-hidden="true" /> Fontes</div>
          <div className="mt-2 text-2xl font-black text-white">{d.sources.length}</div>
          <p className="mt-1 text-xs text-slate-500">{officialSources} oficiais · {secondarySources} secundárias</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Última atualização do dataset</div>
          <div className="mt-2 text-2xl font-black text-white">{formatDate(d.meta.updatedAt)}</div>
          <p className="mt-1 text-xs text-slate-500">Verifique a ficha de cada fonte para o respectivo ano-base.</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Regra editorial</div>
          <div className="mt-2 text-base font-black text-white">Sem ranking automático</div>
          <p className="mt-1 text-xs text-slate-500">Comparações documentais não são convertidas em recomendação eleitoral.</p>
        </Card>
      </div>
    </section>
  );
}
