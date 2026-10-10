import { ExternalLink, Link2 } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { indicatorReference } from '../../lib/indicatorReference';
import { SectionHeader } from '../ui/SectionHeader';

export function EvidenceChain() {
  return <section id="evidencias" className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="evidence-title">
    <SectionHeader titleId="evidence-title" eyebrow="Confira a informação" title="Do indicador à fonte original" description="Confira o significado, o período e a instituição responsável. A publicação do site não atualiza automaticamente os dados." />
    <div className="grid gap-4 sm:grid-cols-2">{d.indicators.slice(0,4).map(item => {
      const source=d.sources.find(source => source.id===item.sourceId);
      return <article key={item.id} className="rounded-2xl border border-slate-500 p-5 text-slate-300 light:text-slate-800">
        <Link2 aria-hidden="true" className="h-5 w-5" /><h3 className="mt-3 font-bold">{item.label}</h3>
        <p className="mt-2 text-sm">{indicatorReference(item,source).label} · {source?.institution ?? 'Instituição não informada'}</p>
        <p className="mt-2 text-sm">{item.note ?? 'Leia a definição e o método na fonte.'}</p>
        {source && <a className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-sky-200 light:text-sky-800" href={source.resourceUrl ?? source.url} target="_blank" rel="noopener noreferrer">Conferir fonte <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>}
      </article>;
    })}</div>
  </section>;
}
