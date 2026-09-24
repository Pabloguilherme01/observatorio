import { RefreshCw } from 'lucide-react';

type AudienceHeaderProps = {
  modeHint: string;
};

export function AudienceHeader({ modeHint }: AudienceHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300/80">Comece por aqui</div>
        <h2 id="audience-title" className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">O que você quer saber?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{modeHint}</p>
      </div>
      <a href="#mudancas-snapshot" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20 hover:text-white">
        <RefreshCw className="h-4 w-4 text-sky-300" aria-hidden="true" /> Mudanças
      </a>
    </div>
  );
}
