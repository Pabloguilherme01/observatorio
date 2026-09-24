import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { publicCandidates } from "@/data/candidates";

export function CandidatesPanel() {
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");

  const parties = useMemo(
    () => ["all", ...new Set(publicCandidates.map((item) => item.party).filter(Boolean))],
    [],
  );

  const candidates = useMemo(() => {
    const term = query.toLowerCase().trim();

    return publicCandidates.filter((candidate) => {
      const text = [candidate.name, candidate.fullName, candidate.party, candidate.office]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (!term || text.includes(term)) && (party === "all" || candidate.party === party);
    });
  }, [query, party]);

  return (
    <section aria-labelledby="candidates-title" className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative">
          <span className="sr-only">Buscar candidato</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar candidato"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
          />
        </label>

        <select
          value={party}
          onChange={(e) => setParty(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#101923] dark:text-white"
        >
          {parties.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "Todos" : item}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <h2 id="candidates-title" className="font-bold text-slate-900 dark:text-white">
          Candidatos acompanhados
        </h2>
        <span>{candidates.length} encontrados</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <article
            key={candidate.id ?? candidate.name}
            className="candidate-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.035]"
          >
            <div className="flex justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white">{candidate.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{candidate.office ?? "Cargo não informado"}</p>
              </div>
              {candidate.ballotNumber && (
                <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700">
                  {candidate.ballotNumber}
                </span>
              )}
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/[0.03]">
              <p><strong>Partido:</strong> {candidate.party ?? "Não informado"}</p>
            </div>

            {(candidate.occupation || candidate.education) && (
              <details className="mt-3 text-xs text-slate-500">
                <summary className="cursor-pointer font-semibold">Ver detalhes</summary>
                {candidate.occupation && <p className="mt-2">Ocupação: {candidate.occupation}</p>}
                {candidate.education && <p>Escolaridade: {candidate.education}</p>}
              </details>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
