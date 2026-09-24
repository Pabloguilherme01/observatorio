import { ExternalLink, MapPin, MessageCircle, Share2, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { electoral360Snapshot } from '../../data/electoral360';
import { useLanguageMode } from '../../context/LanguageModeContext';

type CandidateView = {
  name: string;
  party: string;
  ballotNumber: number;
  status: string;
  office: string;
  sourceId: string;
  snapshotDate: string;
  municipality: string;
  photoUrl?: string | null;
  instagramUrl?: string | null;
};

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
  const text = [candidate.name, candidate.party + ' · nº ' + candidate.ballotNumber, candidate.office, candidate.municipality, 'Observatório de Águas Lindas de Goiás 2026', url].join('\n');
  if (channel === 'native' && navigator.share) {
    navigator.share({ title: candidate.name + ' · Observatório', text, url }).catch(() => {});
    return;
  }
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
}

export function PoliticalResearch() {
  const { mode } = useLanguageMode();
  const hasLocalCandidates = electoral360Snapshot.matchedCandidates.length > 0;
  const municipalCaptureCompleted = electoral360Snapshot.captureMode === 'github-actions' && Boolean(electoral360Snapshot.capturedAt);
  const candidates: CandidateView[] = electoral360Snapshot.matchedCandidates.map(candidate => {
    const raw = candidate as typeof candidate & { municipality?: string; photoUrl?: string | null; instagramUrl?: string | null };
    return { ...candidate, municipality: raw.municipality ?? 'Águas Lindas de Goiás', photoUrl: raw.photoUrl, instagramUrl: raw.instagramUrl };
  });

  return (
    <section id="candidaturas" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14" aria-labelledby="research-title">
      <SectionHeader
        titleId="research-title"
        eyebrow="Candidaturas locais"
        title={mode !== 'technical' ? 'Candidaturas acompanhadas de Águas Lindas' : 'Candidaturas com recorte de Águas Lindas'}
        description={mode !== 'technical'
          ? 'Nomes acompanhados pelo Observatório a partir do recorte local. O perfil mostra claramente o que está confirmado no registro oficial.'
          : 'O painel separa o recorte editorial local dos campos oficiais da candidatura. Município, situação, foto e redes sociais só são tratados como confirmados quando constam na fonte correspondente.'}
      />

      <div className="candidate-overview-grid mb-5 grid gap-3 sm:grid-cols-3">
        <div className="candidate-overview-card rounded-2xl border border-sky-300/10 bg-sky-300/[0.035] p-4"><div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recorte</div><div className="mt-2 flex items-center gap-2 text-base font-black text-white"><MapPin className="h-4 w-4 text-sky-300" /> Águas Lindas</div><div className="mt-1 text-xs text-slate-500">Goiás · município</div></div>
        <div className="candidate-overview-card rounded-2xl border border-white/8 bg-white/[0.02] p-4"><div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Exibidos</div><div className="mt-2 text-3xl font-black text-white">{candidates.length}</div><div className="mt-1 text-xs text-slate-500">{hasLocalCandidates ? 'registros municipais no snapshot' : 'nenhum registro municipal validado nesta captura'}</div></div>
        <div className="candidate-overview-card rounded-2xl border border-amber-300/10 bg-amber-300/[0.035] p-4"><div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Leitura do recorte</div><div className="mt-2 text-sm font-black text-amber-100">Acompanhamento local</div><div className="mt-1 text-xs text-slate-500">não substitui a confirmação individual no TSE</div></div>
      </div>

      {!hasLocalCandidates ? (
        <Card>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
            <div>
              <h3 className="text-base font-black text-white">{municipalCaptureCompleted ? 'Nenhum registro da watchlist no recorte municipal' : 'Captura municipal pendente'}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                {municipalCaptureCompleted
                  ? 'A captura oficial do município foi concluída, mas nenhum dos nomes atualmente monitorados na watchlist apareceu no recorte municipal desta execução. A ausência aqui não significa ausência de outras candidaturas fora da watchlist.'
                  : 'O último snapshot não contém correspondências municipais validadas. O observatório não transforma a watchlist estadual em candidatura local e mantém a seção vazia até existir evidência municipal no TSE.'}
              </p>
              <a href="https://dadosabertos.tse.jus.br/dataset/candidatos-2026" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-slate-200 hover:border-sky-300/20">Conferir dados oficiais do TSE <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">{candidates.map(candidate => <CandidateCard key={candidate.name + '-' + candidate.ballotNumber} candidate={candidate} />)}</div>
      )}

      <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs leading-5 text-slate-500"><strong className="text-slate-300">Redes sociais:</strong> o Instagram só aparece quando a URL foi declarada na base. O observatório não deduz contas por semelhança de nome.</div>
    </section>
  );
}

function CandidateCard({ candidate }: { readonly candidate: CandidateView }) {
  const hasInstagram = Boolean(candidate.instagramUrl);
  const { mode } = useLanguageMode();
  return (
    <Card className="candidate-card overflow-hidden border-white/10 bg-white/[0.02] p-0">
      <div className="flex gap-4 p-5 sm:p-6">
        <div className="shrink-0">{candidate.photoUrl ? <img src={candidate.photoUrl} alt="" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/10" loading="lazy" decoding="async" /> : <div aria-hidden="true" className="grid h-20 w-20 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl font-black text-sky-200">{candidate.name.slice(0, 1)}</div>}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-sky-300/15 bg-sky-300/[0.05] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-200">{candidate.office}</span><Badge tone="info">{candidate.status}</Badge></div>
          <h3 className="mt-3 text-xl font-black text-white">{candidate.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{candidate.party} · nº {candidate.ballotNumber}</p>
          {mode !== 'technical' ? <span className="mt-2 inline-flex rounded-full border border-sky-300/10 bg-sky-300/[0.04] px-2 py-1 text-[10px] font-bold text-sky-200">Registro público</span> : <span className="technical-detail mt-2 inline-flex rounded-full border border-white/8 px-2 py-1 text-[10px] font-bold text-slate-400">Registro + fonte + snapshot</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px border-y border-white/8 bg-white/8">
        <div className="candidate-data-card rounded-none border-0 bg-[#0d1117]"><span>Município</span><strong>{candidate.municipality}</strong></div>
        <div className="candidate-data-card rounded-none border-0 bg-[#0d1117]"><span>Data</span><strong>{candidate.snapshotDate}</strong></div>
        <div className="candidate-data-card rounded-none border-0 bg-[#0d1117]"><span>Situação</span><strong>{candidate.status}</strong></div>
        <div className="candidate-data-card rounded-none border-0 bg-[#0d1117]"><span>Fonte</span><strong>TSE · {candidate.sourceId}</strong></div>
      </div>
      <div className="flex flex-wrap gap-2 p-4">
        {hasInstagram ? <a href={candidate.instagramUrl!} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-pink-300/15 bg-pink-300/[0.06] px-3 py-2 text-xs font-bold text-pink-100" aria-label={'Abrir Instagram de ' + candidate.name}><span aria-hidden="true" className="text-sm font-black">◎</span> Instagram</a> : <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-xs font-semibold text-slate-500"><span aria-hidden="true" className="text-sm font-black">◎</span> Instagram não informado</span>}
        <button type="button" onClick={() => shareCandidate(candidate, 'whatsapp')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] px-3 py-2 text-xs font-bold text-emerald-200"><MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp</button>
        <button type="button" onClick={() => shareCandidate(candidate, 'native')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200"><Share2 className="h-4 w-4" aria-hidden="true" /> Compartilhar</button>
        <a href="https://dadosabertos.tse.jus.br/dataset/candidatos-2026" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400"><ExternalLink className="h-4 w-4" aria-hidden="true" /> TSE</a>
      </div>
    </Card>
  );
}
