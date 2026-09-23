import { Database, ExternalLink, Instagram, MapPin, MessageCircle, Share2, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { observatorioData as d } from '../../data/observatorioData';
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
};

const INSTAGRAM_BY_CANDIDATE: Record<string, string | undefined> = {
  // Só preencher após verificação pública da conta. Não inferimos @ a partir do nome.
  'ABADYAS DAMASCENO': undefined,
  'ANDERSON TEODORO': undefined,
  'ANDRÉ DO PREMIUM': undefined,
  'BAIANO DOS COCOS': undefined,
  'FELIPE GALDINO': undefined,
  'KEKE DA VULKANIC': undefined,
  'PABIO MOSSORÓ': undefined,
  'RIBEIRO DO TÚLLIO': undefined,
  'WILDE CAMBÃO': undefined,
  'ZÉ DA IMPERIAL': undefined,
};

const CANDIDATE_EXTRA: Record<string, { hometown?: string; knownRole?: string; note?: string }> = {
  'ABADYAS DAMASCENO': { note: 'Perfil local ainda depende de captura municipal validada.' },
  'ANDERSON TEODORO': { note: 'Perfil local ainda depende de captura municipal validada.' },
  'ANDRÉ DO PREMIUM': { note: 'Perfil local ainda depende de captura municipal validada.' },
  'BAIANO DOS COCOS': { note: 'Perfil local ainda depende de captura municipal validada.' },
  'FELIPE GALDINO': { note: 'Perfil local ainda depende de captura municipal validada.' },
  'KEKE DA VULKANIC': { note: 'Perfil local ainda depende de captura municipal validada.' },
  'PABIO MOSSORÓ': { note: 'Perfil local ainda depende de captura municipal validada.' },
  'RIBEIRO DO TÚLLIO': { note: 'Perfil local ainda depende de captura municipal validada.' },
  'WILDE CAMBÃO': { note: 'Perfil local ainda depende de captura municipal validada.' },
  'ZÉ DA IMPERIAL': { note: 'Perfil local ainda depende de captura municipal validada.' },
};

function trackedUrl(anchor: string) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('utm_source', 'observatorio');
  url.searchParams.set('utm_medium', 'candidate_card');
  url.searchParams.set('utm_campaign', 'aguas-lindas-2026');
  url.hash = anchor;
  return url.toString();
}

function instagramUrl(handle: string) {
  return handle.startsWith('http') ? handle : 'https://www.instagram.com/' + handle.replace(/^@/, '') + '/';
}

function shareCandidate(candidate: CandidateView) {
  const text = [
    candidate.name,
    candidate.party + ' · ' + candidate.ballotNumber,
    candidate.office,
    'Status no snapshot: ' + candidate.status,
    'Observatório de Águas Lindas de Goiás 2026',
    trackedUrl('candidaturas'),
  ].join('\n');
  if (navigator.share) {
    navigator.share({ title: candidate.name + ' · Observatório', text, url: trackedUrl('candidaturas') }).catch(() => {});
    return;
  }
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
}

export function PoliticalResearch() {
  const { mode } = useLanguageMode();
  const hasLocalCandidates = electoral360Snapshot.matchedCandidates.length > 0;
  const candidates: CandidateView[] = electoral360Snapshot.matchedCandidates.map(candidate => ({
    name: candidate.name,
    party: candidate.party,
    ballotNumber: candidate.ballotNumber,
    status: candidate.status,
    office: candidate.office,
    sourceId: candidate.sourceId,
    snapshotDate: candidate.snapshotDate,
  }));

  return (
    <section id="candidaturas" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14" aria-labelledby="research-title">
      <SectionHeader
        titleId="research-title"
        eyebrow="Candidaturas locais"
        title="Quem aparece neste recorte?"
        description={mode === 'simple'
          ? 'Só entram candidatos com vínculo municipal comprovado. Não mostramos nomes apenas porque aparecem na base estadual.'
          : 'A camada eleitoral exige vínculo municipal comprovado com Águas Lindas. O snapshot estadual anterior foi retirado da interface pública para evitar atribuição indevida.'}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-sky-300/10 bg-sky-300/[0.035] p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recorte</div>
          <div className="mt-2 flex items-center gap-2 text-lg font-black text-white"><MapPin className="h-4 w-4 text-sky-300" /> Águas Lindas</div>
          <div className="mt-1 text-xs text-slate-500">GO · município</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Candidaturas locais exibidas</div>
          <div className="mt-2 text-3xl font-black text-white">{candidates.length}</div>
          <div className="mt-1 text-xs text-slate-500">{hasLocalCandidates ? 'capturadas no snapshot local' : 'nenhuma ainda validada municipalmente'}</div>
        </div>
        <div className="rounded-2xl border border-amber-300/10 bg-amber-300/[0.035] p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Regra do painel</div>
          <div className="mt-2 text-sm font-black text-amber-100">Sem vínculo municipal, não entra</div>
          <div className="mt-1 text-xs text-slate-500">evita misturar candidaturas de outros municípios</div>
        </div>
      </div>

      {!hasLocalCandidates ? (
        <Card>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
            <div>
              <h3 className="text-base font-black text-white">Nenhuma candidatura estadual foi atribuída a Águas Lindas</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                A captura disponível continha registros estaduais, mas não trazia município de candidatura suficiente para provar o vínculo local. Por isso, os 10 nomes anteriores foram retirados desta camada pública. O próximo snapshot deve trazer o campo municipal ou outra evidência oficial antes de reintroduzir qualquer candidato.
              </p>
              <a href="https://dadosabertos.tse.jus.br/dataset/candidatos-2026" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-slate-200 hover:border-sky-300/20">
                <Database className="h-4 w-4 text-sky-300" aria-hidden="true" /> Conferir base oficial do TSE
              </a>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {candidates.map(candidate => {
            const instagram = INSTAGRAM_BY_CANDIDATE[candidate.name];
            const extra = CANDIDATE_EXTRA[candidate.name] ?? {};
            return (
              <Card key={candidate.name} className="candidate-card border-white/10 bg-white/[0.02] p-0 overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-sky-300/15 bg-sky-300/[0.05] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-200">{candidate.office}</span>
                        <Badge tone="info">{candidate.status}</Badge>
                      </div>
                      <h3 className="mt-3 text-xl font-black text-white">{candidate.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">{candidate.party} · número {candidate.ballotNumber}</p>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-300/10 text-sky-200 text-sm font-black">{String(candidate.ballotNumber).slice(-2)}</div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="candidate-data-card">
                      <span>Município</span>
                      <strong>Águas Lindas de Goiás</strong>
                    </div>
                    <div className="candidate-data-card">
                      <span>Snapshot</span>
                      <strong>{candidate.snapshotDate}</strong>
                    </div>
                    <div className="candidate-data-card">
                      <span>Registro TSE</span>
                      <strong>Ver fonte oficial</strong>
                    </div>
                    <div className="candidate-data-card">
                      <span>Vínculo local</span>
                      <strong>Comprovado no recorte</strong>
                    </div>
                  </div>

                  {extra.note && <p className="mt-4 rounded-2xl border border-white/8 bg-black/10 p-3 text-xs leading-5 text-slate-500">{extra.note}</p>}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {instagram ? (
                      <a href={instagramUrl(instagram)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-pink-300/15 bg-pink-300/[0.06] px-3 py-2 text-xs font-bold text-pink-100">
                        <Instagram className="h-4 w-4" aria-hidden="true" /> Instagram
                      </a>
                    ) : (
                      <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-xs font-semibold text-slate-500">
                        <Instagram className="h-4 w-4" aria-hidden="true" /> Instagram não verificado
                      </span>
                    )}
                    <button type="button" onClick={() => shareCandidate(candidate)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200">
                      <Share2 className="h-4 w-4" aria-hidden="true" /> Compartilhar
                    </button>
                    <button type="button" onClick={() => shareCandidate(candidate)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] px-3 py-2 text-xs font-bold text-emerald-200">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
                    </button>
                    <a href="https://dadosabertos.tse.jus.br/dataset/candidatos-2026" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400">
                      <ExternalLink className="h-4 w-4" aria-hidden="true" /> TSE
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs leading-5 text-slate-500">
        <strong className="text-slate-300">Integração social:</strong> cada card possui espaço para Instagram, compartilhamento nativo e WhatsApp. O link do Instagram só aparece quando a conta pública for verificada; o observatório não deduz contas a partir do nome.
      </div>
    </section>
  );
}