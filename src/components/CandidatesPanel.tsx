import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import {
  publicCandidateMethodology,
  publicCandidateScope,
  publicCandidateSource,
  publicCandidates,
  searchCandidates,
  type PublicCandidate,
} from "../data/candidates";

type CandidateTab = "profile" | "poll";

const pollByCandidate: Record<string, number> = {
  "KEKE DA VULKANIC": 35.25,
  "ANDERSON TEODORO": 14.5,
  "ZÉ DA IMPERIAL": 8.25,
  "BAIANO DOS COCOS": 5.5,
  "ABADYAS DAMASCENO": 2.5,
  "RIBEIRO DO TÚLLIO": 1.25,
};

const pollMeta = {
  institute: "EXATA.GO Pesquisa Ltda.",
  registration: "GO-04133/2026",
  date: "25/08/2026",
  interviews: 400,
  question: "Deputado estadual, resposta espontânea",
  status: "divulgação suspensa por decisão da Justiça Eleitoral",
  statusDate: "21/09/2026",
  source: "https://aguaslindasnews.com.br/noticia/3513/pesquisa-eleitoral-em-aguas-lindas-mostra-lideranca-de-keke-para-deputado-estadual-e-indefinicao-para-federal-e-governador",
};

const formatAssets = (value?: number) =>
  value === undefined ? "Não informado" : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const labelValue = (value?: string) => value?.trim() || "Não informado";

const sourceLabel = (url: string) => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("tse.jus.br")) return "TSE";
    if (host.includes("meuvoto")) return "MeuVoto";
    if (host.includes("wikipedia.org")) return "Wikipedia";
    if (host.includes("folha.uol.com.br")) return "Folha";
    if (host.includes("gazetadopovo.com.br")) return "Gazeta do Povo";
    if (host.includes("instagram.com")) return "Instagram";
    if (host.includes("facebook.com")) return "Facebook";
    if (host.includes("tiktok.com")) return "TikTok";
    return host;
  } catch {
    return "Fonte";
  }
};

function PollCard({ candidate }: { candidate: PublicCandidate }) {
  const value = pollByCandidate[candidate.name];
  const percentage = value !== undefined ? value.toFixed(2).replace(".", ",") + "%" : "Sem dado";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Levantamento de 25/08/2026</p>
          <h3 className="mt-1 text-base font-black text-slate-900 dark:text-white">{candidate.name}</h3>
        </div>
        <span className="rounded-xl bg-sky-50 px-3 py-2 text-lg font-black text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">{percentage}</span>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
        <span>Instituto: {pollMeta.institute}</span>
        <span>Data: {pollMeta.date}</span>
        <span>Registro: {pollMeta.registration}</span>
        <span>Amostra: {pollMeta.interviews} entrevistas</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Este é o percentual divulgado originalmente para a pergunta espontânea. Como a divulgação do levantamento foi posteriormente suspensa por decisão da Justiça Eleitoral, o dado deve ser tratado como registro histórico, não como retrato vigente. Não é percentual de votos válidos nem previsão do resultado.
      </p>
      <a href={pollMeta.source} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-sky-700 underline dark:text-sky-300">
        Ver fonte do levantamento <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </a>
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: PublicCandidate }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<CandidateTab>("profile");
  const pollValue = pollByCandidate[candidate.name];

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-950">
      <div className="flex gap-3 p-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:bg-white/10 dark:text-slate-500">
          {candidate.photoUrl ? <img src={candidate.photoUrl} alt={"Foto de " + candidate.name} className="h-full w-full object-cover" loading="lazy" /> : "Sem foto"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="min-w-0 truncate text-base font-black text-slate-900 dark:text-white">{candidate.name}</h3>
            {candidate.status ? <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">{candidate.status}</span> : null}
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{candidate.office ?? "Cargo não informado"}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-lg bg-sky-50 px-2 py-1 text-xs font-extrabold text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">{candidate.party ?? "Partido não informado"}</span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-extrabold text-slate-700 dark:bg-white/10 dark:text-slate-300">Nº {candidate.ballotNumber ?? "—"}</span>
          </div>
          {pollValue !== undefined ? <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">Registro histórico de pesquisa: {pollValue.toFixed(2).replace(".", ",")}%</p> : null}
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-3 dark:border-white/10">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => { setTab("profile"); setOpen((value) => !value); }} aria-expanded={open && tab === "profile"} className="min-h-10 rounded-xl bg-sky-50 px-3 text-sm font-bold text-sky-700 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-400/10 dark:text-sky-300 dark:hover:bg-sky-400/15">
            {open && tab === "profile" ? "Fechar perfil" : "Conheça o candidato"}
          </button>
          {pollValue !== undefined ? <button type="button" onClick={() => { setTab("poll"); setOpen(true); }} aria-expanded={open && tab === "poll"} className="min-h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
            Ver pesquisa
          </button> : <span className="flex min-h-10 items-center justify-center rounded-xl border border-dashed border-slate-200 px-3 text-xs font-semibold text-slate-400 dark:border-white/10 dark:text-slate-500">Pesquisa não publicada para este nome</span>}
        </div>

        {open && tab === "profile" ? (
          <div className="mt-3 space-y-4 border-t border-slate-100 pt-3 text-sm dark:border-white/10">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div><dt className="text-xs text-slate-500">Nome completo</dt><dd className="font-semibold">{labelValue(candidate.fullName)}</dd></div>
              <div><dt className="text-xs text-slate-500">Ocupação informada</dt><dd className="font-semibold">{labelValue(candidate.occupation)}</dd></div>
              <div><dt className="text-xs text-slate-500">Escolaridade</dt><dd className="font-semibold">{labelValue(candidate.education)}</dd></div>
              <div><dt className="text-xs text-slate-500">Bens declarados</dt><dd className="font-semibold">{formatAssets(candidate.declaredAssetsTotal)}</dd></div>
            </dl>
            {candidate.localEvidence ? <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Evidência de vínculo local</p><p className="mt-1 leading-5 text-slate-600 dark:text-slate-300">{candidate.localEvidence}</p></div> : null}
            {candidate.socials?.length ? <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Redes públicas</p><div className="mt-2 flex flex-wrap gap-2">{candidate.socials.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15">{sourceLabel(url)} <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>)}</div></div> : null}
            {candidate.sourceUrls?.length ? <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Fontes</p><div className="mt-2 flex flex-wrap gap-2">{Array.from(new Set(candidate.sourceUrls)).map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:border-white/10 dark:text-sky-300 dark:hover:bg-white/5">{sourceLabel(url)} <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>)}</div></div> : null}
          </div>
        ) : null}

        {open && tab === "poll" ? (
          <div className="mt-3 space-y-3 border-t border-slate-100 pt-3 dark:border-white/10">
            <PollCard candidate={candidate} />
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
              <strong>Probabilidade de ganhar:</strong> não calculada. A pesquisa publicada mede intenção espontânea e não fornece uma probabilidade estatística de vitória. O Observatório não transforma esse percentual em previsão de resultado e não calcula uma probabilidade de vitória.
            </div>
          </div>
        ) : null}
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
          <h2 id="candidates-title" className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">Candidatos com base local mapeada</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-600 dark:bg-white/10 dark:text-slate-300">{publicCandidates.length} nomes</span>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{publicCandidateScope}</p>
        <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs leading-5 text-sky-900 dark:border-sky-400/15 dark:bg-sky-400/[0.06] dark:text-sky-100">
          <strong>Como ler esta lista:</strong> são candidaturas estaduais de 2026 com vínculo local documental mapeado. O campo municipal do cadastro estadual do TSE não foi usado para inferir residência ou base eleitoral. A situação exibida corresponde ao snapshot de {publicCandidateMethodology.checkedAt}.
        </div>
      </div>

      <label className="relative block">
        <span className="sr-only">Pesquisar candidato</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar nome, partido ou cargo" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400 dark:border-white/10 dark:bg-slate-950" />
      </label>

      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{filtered.length} resultado{filtered.length === 1 ? "" : "s"}</span>
        {query ? <button type="button" onClick={() => setQuery("")} className="font-semibold text-sky-700 hover:underline dark:text-sky-300">Limpar busca</button> : null}
      </div>

      {filtered.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((candidate) => <CandidateCard key={candidate.id ?? candidate.name} candidate={candidate} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/10">Nenhum candidato encontrado para “{query}”.</div>}

      <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.03]">
        <summary className="cursor-pointer font-semibold text-slate-600 dark:text-slate-300">Metodologia do recorte e da pesquisa</summary>
        <p className="mt-2 leading-5">O TSE registra a candidatura para Goiás, mas não possui um campo municipal de “base eleitoral”. “Base local” é uma classificação documental do Observatório. O levantamento exibido é um registro histórico de pesquisa espontânea do município. A divulgação foi posteriormente suspensa por decisão da Justiça Eleitoral, portanto o painel não o apresenta como pesquisa vigente nem como projeção do resultado.</p>
        <p className="mt-2">Fonte primária de candidatura: {publicCandidateSource}. Pesquisa: {pollMeta.institute}, registro {pollMeta.registration}, {pollMeta.interviews} entrevistas, referência {pollMeta.date}. Status atual no Observatório: {pollMeta.status}.</p>
        <p className="mt-2">Pesquisa eleitoral: <a className="font-semibold text-sky-700 underline dark:text-sky-300" href={pollMeta.source} target="_blank" rel="noreferrer">ver fonte publicada</a>.</p>
        <p className="mt-2">Dados cadastrais verificados pelo Observatório em {publicCandidateMethodology?.checkedAt ?? "data não informada"}.</p>
      </details>
    </section>
  );
}
