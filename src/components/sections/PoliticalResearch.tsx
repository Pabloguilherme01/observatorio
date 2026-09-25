import { ChevronDown, ExternalLink, MapPin, MessageCircle, Search, Share2, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { electoral360Snapshot } from '../../data/electoral360';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { useMemo, useState } from 'react';

type CandidateView = {
  name: string;
  party: string;
  ballotNumber: number;
  status: string;
  office: string;
  sourceId: string;
  snapshotDate: string;
  municipality?: string | null;
  photoUrl?: string | null;
  instagramUrl?: string | null;
  evidenceSourceUrls: readonly string[];
};

function evidenceSourceLabel(urls: readonly string[]) {
  const primary = urls.some(url => /(^https?:\/\/)?([^/]*\.)?(gov\.br|jus\.br|go\.gov\.br|go\.leg\.br|leg\.br)(\/|$)/i.test(url));
  return primary ? 'Fonte institucional' : 'Fonte secundária';
}

function trackedUrl(anchor: string) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('utm_source', 'observatorio');
  url.searchParams.set('utm_medium', 'candidate_card');
  url.searchParams.set('utm_campaign', 'aguas-lindas-2026');
  url.hash = anchor;
  return url.toString();
}

function shareCandidate(candidate: CandidateView, channel: 'native' | 'whatsapp') {
  const url = trackedUrl('candidaturas');
  const text = [candidate.name, candidate.party + ' · nº ' + candidate.ballotNumber, candidate.office, 'Observatório de Águas Lindas de Goiás 2026', url].join('\n');
  if (channel === 'native' && navigator.share) {
    navigator.share({ title: candidate.name + ' · Observatório', text, url }).catch(() => {});
    return;
  }
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
}

function CandidateSummaryCard({ candidate }: { readonly candidate: CandidateView }) {
  const [open, setOpen] = useState(false);
  const status = candidate.status === '#NE' ? 'Situação não informada' : candidate.status;
  return (
    <article className={`candidate-summary-card${open ? ' is-open' : ''}`}>
      <div className="candidate-summary-media">
        {candidate.photoUrl
          ? <img src={candidate.photoUrl} alt="" loading="lazy" decoding="async" />
          : <span aria-hidden="true">{candidate.name.slice(0, 1)}</span>}
      </div>
      <div className="candidate-summary-body">
        <div className="candidate-summary-topline">
          <span className="candidate-summary-party">{candidate.party}</span>
          <span className="candidate-summary-status">{status}</span>
        </div>
        <h3>{candidate.name}</h3>
        <div className="candidate-summary-number">{candidate.ballotNumber}</div>
        <p>{candidate.office}</p>
        <button type="button" className="candidate-summary-detail-button" onClick={() => setOpen(value => !value)} aria-expanded={open}>
          <span>{open ? 'Ocultar detalhes' : 'Ver detalhes'}</span>
          <ChevronDown className="candidate-summary-chevron" aria-hidden="true" />
        </button>
      </div>
      {open && (
        <div className="candidate-summary-details">
          <div><span>Vínculo local</span><strong>Evidência documental</strong></div>
          <div><span>Fonte do vínculo</span><strong>{evidenceSourceLabel(candidate.evidenceSourceUrls)}</strong></div>
          <div><span>Snapshot</span><strong>{candidate.snapshotDate}</strong></div>
          <div><span>Fonte cadastral</span><strong>TSE · Candidatos 2026</strong></div>
          <div className="candidate-summary-links">
            <a href="https://divulgacandcontas.tse.jus.br/divulga/#/" target="_blank" rel="noopener noreferrer"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Abrir DivulgaCandContas</a>
            {candidate.evidenceSourceUrls[0] && <a href={candidate.evidenceSourceUrls[0]} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Abrir fonte do vínculo</a>}
            <button type="button" onClick={() => shareCandidate(candidate, 'native')}><Share2 className="h-3.5 w-3.5" aria-hidden="true" /> Compartilhar</button>
          </div>
        </div>
      )}
    </article>
  );
}

export function PoliticalResearch() {
  const { mode } = useLanguageMode();
  const [query, setQuery] = useState('');
  const [officeFilter, setOfficeFilter] = useState('all');
  const candidates: CandidateView[] = electoral360Snapshot.matchedCandidates.map(candidate => ({
    ...candidate,
    municipality: candidate.municipality,
    photoUrl: candidate.photoUrl,
    instagramUrl: candidate.instagramUrl ?? undefined,
    evidenceSourceUrls: candidate.evidenceSourceUrls,
  }));
  const hasLocalCandidates = candidates.length > 0;

  const filteredCandidates = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    return candidates.filter(candidate => {
      const matchesQuery = !normalized || [candidate.name, candidate.party, candidate.office, candidate.ballotNumber].join(' ').toLocaleLowerCase('pt-BR').includes(normalized);
      const matchesOffice = officeFilter === 'all' || candidate.office === officeFilter;
      return matchesQuery && matchesOffice;
    });
  }, [candidates, officeFilter, query]);
  const offices = useMemo(() => Array.from(new Set(candidates.map(candidate => candidate.office))).sort(), [candidates]);

  return (
    <section id="candidaturas" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14" aria-labelledby="research-title">
      <SectionHeader
        titleId="research-title"
        eyebrow="Recorte eleitoral local"
        title={mode === 'summary' ? 'Candidaturas acompanhadas' : mode !== 'technical' ? 'Candidaturas ligadas a Águas Lindas de Goiás' : 'Candidaturas acompanhadas no recorte local'}
        description={mode === 'summary'
          ? `${candidates.length} candidaturas estaduais acompanhadas com evidência documental de vínculo local. Esta não é uma lista municipal completa.`
          : mode !== 'technical'
            ? 'Lista de candidaturas estaduais de 2026 acompanhadas por evidência documental de vínculo local. Não representa o universo completo de candidaturas do município.'
            : 'O TSE fornece o cadastro estadual; o vínculo com Águas Lindas é sustentado por evidência documental separada. Este snapshot é uma watchlist acompanhada, não uma lista municipal completa.'}
      />

      {mode !== 'summary' && <div className="mb-5 mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-4" role="note" aria-label="Limitação da lista de candidaturas"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" /><div><strong className="block text-sm font-black text-amber-100">Acompanhamento documental — não é lista oficial completa</strong><p className="mt-1 text-xs leading-5 text-slate-400">O cadastro vem do TSE. O vínculo com Águas Lindas é sustentado por evidência documental separada. Esta watchlist não deve ser interpretada como o universo completo de candidaturas municipais.</p></div></div></div>}

      {mode !== 'summary' && <div className="candidate-overview-grid mb-5 grid gap-3 sm:grid-cols-3">
        <div className="candidate-overview-card rounded-2xl border border-sky-300/10 bg-sky-300/[0.035] p-4"><div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recorte</div><div className="mt-2 flex items-center gap-2 text-base font-black text-white"><MapPin className="h-4 w-4 text-sky-300" /> Águas Lindas</div><div className="mt-1 text-xs text-slate-500">Goiás · evidência documental</div></div>
        <div className="candidate-overview-card rounded-2xl border border-white/8 bg-white/[0.02] p-4"><div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Acompanhados</div><div className="mt-2 text-3xl font-black text-white">{candidates.length}</div><div className="mt-1 text-xs text-slate-500">registros no snapshot estadual</div></div>
        <div className="candidate-overview-card rounded-2xl border border-amber-300/10 bg-amber-300/[0.035] p-4"><div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vínculo local</div><div className="mt-2 text-sm font-black text-amber-100">Evidência documental</div><div className="mt-1 text-xs text-slate-500">não é inferido do cadastro estadual</div></div>
      </div>}

      {!hasLocalCandidates && (
        <Card>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
            <div>
              <h3 className="text-base font-black text-white">Nenhuma candidatura acompanhada no snapshot atual</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                O snapshot atual não contém registros acompanhados com evidência documental de vínculo local. O Observatório não transforma a watchlist estadual em lista municipal.
              </p>
              <a href="https://dadosabertos.tse.jus.br/dataset/candidatos-2026" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-slate-200">Conferir dados oficiais do TSE <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
            </div>
          </div>
        </Card>
      )}

      {mode !== 'summary' && <div className="mt-5 rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
          <div>
            <strong className="block text-sm font-black text-sky-100">Como ler esta lista</strong>
            <p className="mt-1 text-xs leading-5 text-slate-500">A lista combina o cadastro oficial de candidaturas do TSE com evidências documentais de vínculo local. Não há ranking nem seleção por preferência e a lista não representa todas as candidaturas do município.</p>
          </div>
        </div>
      </div>}

      {mode === 'summary' && hasLocalCandidates && (
        <div className="candidate-summary-wrap mt-4">
          <div className="candidate-summary-grid">
            {candidates.map(candidate => <CandidateSummaryCard key={candidate.name + '-' + candidate.ballotNumber} candidate={candidate} />)}
          </div>
          <div className="candidate-summary-hint" aria-hidden="true">Toque em um candidato para ver detalhes · lista acompanhada, não universo municipal</div>
        </div>
      )}

      {hasLocalCandidates && mode !== 'summary' && (
        <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3">
              <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              <span className="sr-only">Buscar candidatura</span>
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nome, partido ou número" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
              {query && <button type="button" onClick={() => setQuery('')} className="grid min-h-8 min-w-8 place-items-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Limpar busca"><X className="h-4 w-4" /></button>}
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-400">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Filtrar por cargo</span>
              <select value={officeFilter} onChange={event => setOfficeFilter(event.target.value)} className="bg-transparent text-sm text-slate-300 outline-none">
                <option value="all" className="bg-slate-900">Todos os cargos</option>
                {offices.map(office => <option key={office} value={office} className="bg-slate-900">{office}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
            <span>{filteredCandidates.length} de {candidates.length} registros</span>
            {(query || officeFilter !== 'all') && <button type="button" onClick={() => { setQuery(''); setOfficeFilter('all'); }} className="font-semibold text-sky-300 hover:underline">Limpar filtros</button>}
          </div>
        </div>
      )}

      {hasLocalCandidates && mode !== 'summary' && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">{filteredCandidates.length ? filteredCandidates.map(candidate => <CandidateCard key={candidate.name + '-' + candidate.ballotNumber} candidate={candidate} />) : <div className="md:col-span-2 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">Nenhuma candidatura encontrada com esses filtros.</div>}</div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <a href="https://divulgacandcontas.tse.jus.br/divulga/#/" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] p-4 transition hover:border-sky-300/25">
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-300">Fonte oficial</span>
          <strong className="mt-1 block text-sm font-black text-white">DivulgaCandContas</strong>
          <span className="mt-1 block text-xs leading-5 text-slate-500">Consulte diretamente o cadastro oficial do TSE.</span>
        </a>
        <a href="https://dadosabertos.tse.jus.br/dataset/candidatos-2026" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-white/8 bg-white/[0.02] p-4 transition hover:border-white/20">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dados</span>
          <strong className="mt-1 block text-sm font-black text-white">Candidatos 2026</strong>
          <span className="mt-1 block text-xs leading-5 text-slate-500">Base pública usada no snapshot do Observatório.</span>
        </a>
        <a href="https://www.tse.jus.br/eleicoes/eleicoes-2026" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-white/8 bg-white/[0.02] p-4 transition hover:border-white/20">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Eleições</span>
          <strong className="mt-1 block text-sm font-black text-white">Portal Eleições 2026</strong>
          <span className="mt-1 block text-xs leading-5 text-slate-500">Calendário, estatísticas e serviços oficiais.</span>
        </a>
      </div>
      <div className="mt-3 text-xs leading-5 text-slate-500"><strong className="text-slate-300">Redes sociais:</strong> o Instagram só aparece quando a URL foi declarada na base. O Observatório não deduz contas por semelhança de nome.</div>
    </section>
  );
}

function CandidateCard({ candidate }: { readonly candidate: CandidateView }) {
  const instagramUrl = candidate.instagramUrl ?? undefined;
  const hasInstagram = Boolean(instagramUrl);
  const { mode } = useLanguageMode();
  return (
    <Card className="candidate-card overflow-hidden border-white/10 bg-white/[0.02] p-0">
      <div className="flex gap-4 p-5 sm:p-6">
        <div className="shrink-0">{candidate.photoUrl ? <img src={candidate.photoUrl} alt="" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/10" loading="lazy" decoding="async" /> : <div aria-hidden="true" className="grid h-20 w-20 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl font-black text-sky-200">{candidate.name.slice(0, 1)}</div>}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-sky-300/15 bg-sky-300/[0.05] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-200">{candidate.office}</span><Badge tone="info">{candidate.status === '#NE' ? 'Situação não informada' : candidate.status}</Badge></div>
          <h3 className="mt-3 text-xl font-black text-white">{candidate.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{candidate.party} · nº {candidate.ballotNumber}</p><p className="mt-2 text-xs leading-5 text-slate-500">Recorte acompanhado pelo Observatório. A situação individual deve ser conferida no DivulgaCandContas.</p>
          {mode !== 'technical' ? <span className="mt-2 inline-flex rounded-full border border-sky-300/10 bg-sky-300/[0.04] px-2 py-1 text-[10px] font-bold text-sky-200">Registro público</span> : <span className="technical-detail mt-2 inline-flex rounded-full border border-white/8 px-2 py-1 text-[10px] font-bold text-slate-400">Registro + fonte + snapshot</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px border-y border-white/8 bg-white/8">
        <div className="candidate-data-card rounded-none border-0 bg-[#0d1117]"><span>Município</span><strong>{candidate.municipality ?? 'Não informado no arquivo de candidatura'}</strong></div>
        <div className="candidate-data-card rounded-none border-0 bg-[#0d1117]"><span>Data</span><strong>{candidate.snapshotDate}</strong></div>
        <div className="candidate-data-card rounded-none border-0 bg-[#0d1117]"><span>Situação</span><strong>{candidate.status === '#NE' ? 'Situação não informada' : candidate.status}</strong></div>
        <div className="candidate-data-card rounded-none border-0 bg-[#0d1117]"><span>Fonte</span><strong>TSE · {candidate.sourceId}</strong></div>
      </div>
      <div className="flex flex-wrap gap-2 p-4">
        {hasInstagram ? <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-pink-300/15 bg-pink-300/[0.06] px-3 py-2 text-xs font-bold text-pink-100" aria-label={'Abrir Instagram de ' + candidate.name}><span aria-hidden="true" className="text-sm font-black">◎</span> Instagram</a> : <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-xs font-semibold text-slate-500"><span aria-hidden="true" className="text-sm font-black">◎</span> Instagram não informado</span>}
        <a href="https://divulgacandcontas.tse.jus.br/divulga/#/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-300/15 bg-sky-300/[0.05] px-3 py-2 text-xs font-bold text-sky-100" aria-label={'Abrir DivulgaCandContas para conferência de ' + candidate.name}><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Abrir DivulgaCandContas</a>
        <button type="button" onClick={() => shareCandidate(candidate, 'whatsapp')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] px-3 py-2 text-xs font-bold text-emerald-200"><MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp</button>
        <button type="button" onClick={() => shareCandidate(candidate, 'native')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200"><Share2 className="h-4 w-4" aria-hidden="true" /> {typeof navigator !== 'undefined' && 'share' in navigator && typeof navigator.share === 'function' ? 'Compartilhar' : 'Compartilhar pelo WhatsApp'}</button>
        <a href="https://dadosabertos.tse.jus.br/dataset/candidatos-2026" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Dados abertos</a>
      </div>
    </Card>
  );
}
