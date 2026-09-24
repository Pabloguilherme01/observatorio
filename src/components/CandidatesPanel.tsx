import { useMemo, useState } from "react";
import { publicCandidates } from "@/data/candidates";

export function CandidatesPanel() {
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");

  const parties = useMemo(
    () => ["all", ...Array.from(new Set(publicCandidates.map((candidate) => candidate.partido))).filter(Boolean)],
    []
  );

  const candidates = useMemo(() => {
    const term = query.toLowerCase().trim();

    return publicCandidates.filter((candidate) => {
      const matchesQuery = !term ||
        candidate.nome.toLowerCase().includes(term) ||
        candidate.nomeCompleto?.toLowerCase().includes(term);

      const matchesParty = party === "all" || candidate.partido === party;

      return matchesQuery && matchesParty;
    });
  }, [query, party]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar candidato"
          className="rounded-xl border px-4 py-3"
        />

        <select
          value={party}
          onChange={(event) => setParty(event.target.value)}
          className="rounded-xl border px-4 py-3"
        >
          {parties.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "Todos os partidos" : item}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <article key={candidate.id} className="rounded-2xl border p-4">
            <h3 className="font-semibold">{candidate.nome}</h3>
            <p>{candidate.partido}</p>
            <p>{candidate.cargo}</p>
            {candidate.numero && <p>Número: {candidate.numero}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
