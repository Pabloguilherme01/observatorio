import { publicCandidateScope, publicCandidates } from "@/data/candidates";

export function CandidatesPanel() {
  return (
    <section aria-labelledby="candidates-title" className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="candidates-title" className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
            Candidaturas acompanhadas
          </h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {publicCandidates.length} nomes
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Recorte editorial atual da pesquisa pública. A base exibida aqui é uma watchlist e não representa o universo completo de candidaturas do município.
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
          Escopo: {publicCandidateScope}. Para confirmar o universo completo e a situação de cada candidatura, consulte a fonte oficial do TSE.
        </p>
      </div>

      {publicCandidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-400">
          Nenhum registro de candidatura está disponível neste snapshot.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {publicCandidates.map((candidate) => (
            <article
              key={candidate.id ?? candidate.name}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.035]"
            >
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {candidate.name}
              </h3>

              <p className="mt-1 text-sm text-sky-700 dark:text-sky-300">
                {candidate.office ?? "Cargo não informado"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                {candidate.party && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-white/10">
                    {candidate.party}
                  </span>
                )}
                {candidate.ballotNumber !== undefined && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-white/10">
                    Nº {candidate.ballotNumber}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">
        Snapshot informativo. Registros, situação e universo de candidaturas podem mudar conforme as atualizações oficiais.
      </p>
    </section>
  );
}
