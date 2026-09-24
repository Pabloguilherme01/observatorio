import { CandidatesPanel } from '../CandidatesPanel';

export function ElectoralOverview() {
  return (
    <section id="candidatos" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
        <div className="mb-5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">
            Eleições
          </span>
          <h2 className="mt-2 text-2xl font-black text-white">
            Candidatos e registros
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Consulta pública organizada com dados separados da camada técnica de auditoria.
          </p>
        </div>
        <CandidatesPanel />
      </div>
    </section>
  );
}
