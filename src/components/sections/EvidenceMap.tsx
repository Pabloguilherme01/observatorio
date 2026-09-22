import { ExternalLink } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

export function EvidenceMap() {
  return <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="fontes-title"><SectionHeader eyebrow="Rastreabilidade" title="Mapa de evidências" description="Cada bloco aponta para a fonte utilizada, preservando a diferença entre dado oficial, fonte secundária e cálculo próprio." />
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{d.sources.map(source => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/8 bg-white/[0.025] p-4 hover:border-sky-300/20"><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-bold text-white">{source.label}</div><div className="mt-1 text-[11px] text-slate-500">{source.institution} · {source.nature}</div></div><ExternalLink className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-sky-300" /></div>{source.note && <p className="mt-3 text-xs leading-5 text-slate-500">{source.note}</p>}</a>)}</div>
  </section>;
}