import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { publicCandidates } from "@/data/candidates";

export function CandidatesPanel() {
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");

  const parties = useMemo(
    () => [
      "all",
      ...Array.from(new Set(publicCandidates.map((candidate) => candidate.party).filter(Boolean))).sort(),
    ],
    [],
  );

  const candidates = useMemo(() => {
    const term = query.trim().toLowerCase();

    return publicCandidates.filter((candidate) => {
      const searchable = [
        candidate.name,
        candidate.fullName,
        candidate.party,
        candidate.office,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !term || searchable.includes(term);
      const matchesParty = party === "all" || candidate.party === party;
      return matchesQuery && matchesParty;
    });
  }, [query, party]);

  return (
    <section aria-labelledby="candidates-title" className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Buscar candidato</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, partido ou cargo"
            className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-300 dark:focus:ring-0"
          />
        </label>

        <label>
          <span className="sr-only">Filtrar por partido</span>
          <select
            value={party}
            onChange={(event) => setParty(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-sky-400 dark:border-white/10 dark:bg-[#101923] dark:text-white dark:focus:border-sky-300"
          >
            {parties.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "Todos os partidos" : item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <h2 id="candidates-title" className="font-black text-slate-800 dark:text-white">
          Candidatos acompanhados
        </h2>
        <span aria-live="polite">{candidates.length} resultado{candidates.length === 1 ? "" : "s"}</span>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
          Nenhum candidato encontrado para esse filtro.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <article
              key={candidate.id ?? candidate.name}
              className="candidate-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.035] dark:shadow-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                    {candidate.name}
                  </h3>
                  {candidate.fullName && candidate.fullName !== candidate.name && (
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {candidate.fullName}
                    </p>
                  )}
                </div>
                {candidate.ballotNumber && (
                  <span className="shrink-0 rounded-full bg-sky-50 px-2 py-1 text-[10px] font-black text-sky-700 dark:bg-sky-300/10 dark:text-sky-200">
                    {candidate.ballotNumber}
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="candidate-data-card border-slate-200 bg-slate-50 dark:border-white/8 dark:bg-white/[0.02]">
                  <span>Partido</span>
                  <strong className="text-slate-800 dark:text-slate-200">{candidate.party ?? "Não informado"}</strong>
                </div>
                <div className="candidate-data-card border-slate-200 bg-slate-50 dark:border-white/8 dark:bg-white/[0.02]">
                  <span>Cargo</span>
                  <strong className="text-slate-800 dark:text-slate-200">{candidate.office ?? "Não informado"}</strong>
                </div>
              </div>

              {(candidate.occupation || candidate.education) && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {candidate.occupation && (
                    <div className="candidate-data-card border-slate-200 bg-slate-50 dark:border-white/8 dark:bg-white/[0.02]">
                      <span>Ocupação</span>
                      <strong className="text-slate-800 dark:text-slate-200">{candidate.occupation}</strong>
                    </div>
                  )}
                  {candidate.education && (
                    <div className="candidate-data-card border-slate-200 bg-slate-50 dark:border-white/8 dark:bg-white/[0.02]">
                      <span>Escolaridade</span>
                      <strong className="text-slate-800 dark:text-slate-200">{candidate.education}</strong>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
