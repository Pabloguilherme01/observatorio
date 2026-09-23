import type { SourceRef } from '../types/observatorio';
import { ExternalLink } from '../components/icons';

interface Props {
  readonly source: SourceRef;
  readonly referenceDate?: string;
  readonly denominator?: string;
  readonly formula?: string;
  readonly limitations?: string;
}

export function MethodologyFooter({ source, referenceDate, denominator, formula, limitations }: Props) {
  return (
    <aside className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs leading-5 text-slate-500 light:border-slate-200 light:bg-slate-50">
      <div className="font-bold uppercase tracking-[0.14em] text-slate-400 light:text-slate-600">Metodologia</div>
      <div className="mt-2 grid gap-1 sm:grid-cols-2">
        <div>Fonte registrada: <strong className="text-slate-300 light:text-slate-700">{source.institution}</strong></div>
        <div>Data de referência: <strong className="text-slate-300 light:text-slate-700">{referenceDate ?? source.referenceDate ?? 'não informada'}</strong></div>
        {denominator && <div>Denominador: <strong className="text-slate-300 light:text-slate-700">{denominator}</strong></div>}
        {formula && <div>Fórmula: <strong className="text-slate-300 light:text-slate-700">{formula}</strong></div>}
        {limitations && <div className="sm:col-span-2">Limitações: <strong className="text-slate-300 light:text-slate-700">{limitations}</strong></div>}
      </div>
      <a className="mt-2 inline-flex items-center gap-1 font-semibold text-sky-300 hover:text-sky-200" href={source.url} target="_blank" rel="noopener noreferrer">
        Abrir fonte original <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </aside>
  );
}
