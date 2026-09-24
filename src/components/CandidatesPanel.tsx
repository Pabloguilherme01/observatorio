import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import {
  publicCandidateMethodology,
  publicCandidateScope,
  publicCandidateSource,
  publicCandidates,
  searchCandidates,
  type PublicCandidate,
} from "@/data/candidates";

const formatAssets = (value?: number) =>
  value === undefined ? "Não informado" : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function CandidateCard({ candidate }: { candidate: PublicCandidate }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-950">
      <div className="flex gap-3 p-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
          {candidate.photoUrl ? (
            <img src={candidate.photoUrl} alt={`Foto de ${candidate.name}`} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            "Foto TSE"
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-black text-slate-900 dark:text-white">{candidate.name}</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{candidate.office ?? "Cargo não informado"}</p>
          <p className="mt-2 text-sm font-bold text-sky-700 dark:text-sky-300">
            {candidate.party ?? "Partido não informado"} · {candidate.ballotNumber ?? "—"}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-3 dark:border-white/10">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="inline-flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-sm font-bold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-white/5"
        >
          {open ? "Fechar perfil" : "Ver perfil"}
          <span aria-hidden="true">{open ? "↑" : "→"}</span>
        </button>

        {open && (
          <div className="mt-3 space-y-3 border-t border-slate-100 pt-3 text-sm dark:border-white/10">
            <dl className="grid gap-2 sm:grid-cols-2">
              <div><dt className="text-xs text-slate-500">Nome completo</dt><dd className="font-semibold">{candidate.fullName ?? "Não informado"}</dd></div>
              <div><dt className="text-xs text-slate-500">Situação</dt><dd className="font-semibold">{candidate.status ?? "Não informado"}</dd></div>
              <div><dt className="text-xs text-slate-500">Bens declarados</dt><dd className="font-semibold">{formatAssets(candidate.declaredAssetsTotal)}</dd></div>
            </dl>

            {candidate.localEvidence && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Vínculo local documentado</p>
                <p className="mt-1 leading-5 text-slate-600 dark:text-slate-300">{candidate.localEvidence}</p>
              </div>
            )}

            {candidate.socials?.length ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Redes declaradas/publicadas</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {candidate.socials.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold dark:bg-white/10">
                      Rede <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {candidate.sourceUrls?.length ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Fontes</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {candidate.sourceUrls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-sky-700 underline dark:text-sky-300">
                      Fonte oficial/pública
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}

export function CandidatesPanel() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => searchCandidates(query), [query]);

  return (
    <section aria-labelledby="candidates-title" className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="candidates-title" className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
            Candidatos com base local mapeada
          </h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {publicCandidates.length} nomes
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {publicCandidateScope}. A lista cruza cadastro eleitoral de 2026 com evidências públicas de vínculo local.
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-500">
          O cadastro oficial do TSE é a fonte primária para registro, número, partido e situação. “Base local” é uma classificação documental do observatório, não um campo do TSE.
        </p>
      </div>

      <label className="relative block">
        <span className="sr-only">Pesquisar candidato</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pesquisar nome, partido ou cargo"
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-400 dark:border-white/10 dark:bg-slate-950"
        />
      </label>

      {filtered.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((candidate) => <CandidateCard key={candidate.id ?? candidate.name} candidate={candidate} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/10">
          Nenhum candidato encontrado.
        </div>
      )}

      <p className="text-xs text-slate-500">
        Fonte primária: {publicCandidateSource}. Atualização da pesquisa: {publicCandidateMethodology?.checkedAt ?? "não informado"}.
      </p>
    </section>
  );
}
