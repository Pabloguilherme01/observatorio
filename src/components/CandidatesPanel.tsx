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
    <section aria-labelledby="candidates-title" className="space-y-5">
      <div>
        <h2 id="candidates-title" className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
          Candidatos e dados eleitorais
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Consulte informações públicas organizadas por candidato.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative">
          <span className="sr-only">Buscar candidato</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar candidato"
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
          />
        </label>

        <select
          value={party}
          onChange={(e) => setParty(e.target.value)}
          className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#101923] dark:text-white"
        >
          {parties.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "Todos os partidos" : item}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>{candidates.length} candidatos encontrados</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <article
            key={candidate.id ?? candidate.name}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.035]"
          >
            <h3 className="font-black text-slate-900 dark:text-white">{candidate.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{candidate.office ?? "Cargo não informado"}</p>

            <div className="mt-4 space-y-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-white/[0.03] dark:text-slate-300">
              <p><strong>Partido:</strong> {candidate.party ?? "Não informado"}</p>
              {candidate.ballotNumber && <p><strong>Número:</strong> {candidate.ballotNumber}</p>}
            </div>

            {(candidate.occupation || candidate.education) && (
              <details className="mt-3 text-xs text-slate-500">
                <summary className="cursor-pointer font-semibold">Mais informações</summary>
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
