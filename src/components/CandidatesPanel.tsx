import { publicCandidates } from "@/data/candidates";

export function CandidatesPanel() {
  const candidates = publicCandidates.slice(0, 8);

  return (
    <section aria-labelledby="candidates-title" className="space-y-4">
      <div>
        <h2 id="candidates-title" className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
          Candidatos
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Nomes acompanhados pelo observatório com origem e contexto informados.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
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
              {candidate.ballotNumber && (
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-white/10">
                  Nº {candidate.ballotNumber}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Recorte informativo. Consulte a fonte oficial para o universo completo de candidaturas.
      </p>
    </section>
  );
}
