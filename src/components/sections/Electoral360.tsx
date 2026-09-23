import { Camera, CheckCircle2, Database, ExternalLink, History, Search, Share2, ShieldAlert, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { electoral360Diff, electoral360Modules, electoral360Snapshot } from '../../data/electoral360';
import { CANDIDATE_PROFILES, EXCLUDED_FROM_LOCAL_RECORTE_IDS } from '../../data/candidateProfiles';
import { observatorioData as d } from '../../data/observatorioData';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { Contas360 } from '../Electoral360/Contas360';
import { RadarPesquisas } from '../Electoral360/RadarPesquisas';
import { TimelineProcessual } from '../Electoral360/TimelineProcessual';

const stateLabel: Record<string, string> = {
  first_capture: 'Primeiro snapshot',
  synced: 'Sincronizado',
  unchanged: 'Sem alterações',
  changed: 'Dados alterados',
  stale: 'Desatualizado',
  failed: 'Falha na sincronização',
  not_synced: 'Ainda não sincronizado',
};

async function shareCandidate(candidate: (typeof electoral360Snapshot.matchedCandidates)[number], profile: (typeof CANDIDATE_PROFILES)[string]) {
  const url = window.location.origin + window.location.pathname + '#eleitoral360';
  const text = candidate.name + ' · ' + candidate.party + ' · ' + candidate.office + ' · nº ' + candidate.ballotNumber + '. Fonte: TSE.';
  try {
    if (navigator.share) {
      await navigator.share({ title: candidate.name + ' · Observatório', text, url });
      return 'Compartilhado';
    }
    await navigator.clipboard?.writeText(text + ' ' + url);
    return 'Link copiado';
  } catch {
    return 'Compartilhamento cancelado';
  }
}

function CandidatePhoto({ name, src }: { readonly name: string; readonly src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div aria-label={'Foto indisponível de ' + name} className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-white/10 bg-sky-300/10 text-xl font-black text-sky-200">
        {name.split(' ').slice(0, 2).map(part => part[0]).join('')}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={'Foto oficial de ' + name}
      loading="lazy"
      decoding="async"
      width={80}
      height={80}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-20 w-20 shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] object-cover"
    />
  );
}

function Info({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export function Electoral360() {
  const { mode: languageMode } = useLanguageMode();
  const [query, setQuery] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const captured = electoral360Modules.filter(module => module.status === 'captured').length;
  const cataloged = electoral360Modules.filter(module => module.status === 'cataloged').length;
  const snapshotWarning = ['not_synced', 'stale', 'failed'].includes(String(electoral360Diff.state));
  const candidateSource = d.sources.find(source => source.id === 'tse-candidatos-2026');

  const candidates = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    const base = electoral360Snapshot.matchedCandidates;
    if (!normalized) return base;
    return base.filter(candidate => {
      const profile = CANDIDATE_PROFILES[candidate.sqCandidate];
      return [
        candidate.name,
        candidate.party,
        candidate.office,
        candidate.status,
        candidate.ballotNumber,
        profile?.fullName,
        profile?.occupation,
        profile?.education,
        profile?.localConnection,
      ].join(' ').toLocaleLowerCase('pt-BR').includes(normalized);
    });
  }, [query]);

  return (
    <section id="eleitoral360" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14" aria-labelledby="electoral360-title">
      <SectionHeader
        titleId="electoral360-title"
        eyebrow="Eleitoral 360°"
        title="Quem está no recorte local"
        description={languageMode === 'simple'
          ? 'Veja o essencial. Abra “Mais dados” para detalhes.'
          : languageMode === 'quick'
            ? 'Foto, partido, número e situação. Sem texto longo. Toque para ver mais.'
            : 'Eleições Gerais de 2026: o pleito inclui Governador, Senador, Deputado Federal e Deputado Estadual, entre outros cargos nacionais e estaduais; prefeito e vereador não estão em disputa em 2026. Os registros brutos do TSE permanecem preservados, mas a interface exibe apenas os nomes com vínculo eleitoral local documentado.'}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          <div className="mt-2 text-2xl font-black text-white">{electoral360Snapshot.matchedCandidates.length}</div>
          <div className="text-xs text-slate-500">no recorte local</div>
        </Card>
        <Card>
          <Database className="h-5 w-5 text-sky-300" aria-hidden="true" />
          <div className="mt-2 text-2xl font-black text-white">{captured}</div>
          <div className="text-xs text-slate-500">módulos TSE capturados</div>
        </Card>
        <Card>
          <History className="h-5 w-5 text-violet-300" aria-hidden="true" />
          <div className="mt-2 text-sm font-black text-white">{stateLabel[String(electoral360Diff.state)] ?? String(electoral360Diff.state)}</div>
          <div className="mt-1 text-xs text-slate-500">{electoral360Diff.added} novos · {electoral360Diff.changed} alterados</div>
        </Card>
        <Card>
          <UserRound className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <div className="mt-2 text-2xl font-black text-white">{cataloged}</div>
          <div className="text-xs text-slate-500">módulos ainda catalogados</div>
        </Card>
      </div>

      {languageMode === 'technical' && (
        <div className="mt-4 rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] p-4 text-xs leading-5 text-slate-500">
          <strong className="text-slate-300">Detalhe do recorte:</strong> snapshot bruto com {electoral360Snapshot.matchedCandidates.length + EXCLUDED_FROM_LOCAL_RECORTE_IDS.length} correspondências monitoradas; {electoral360Snapshot.matchedCandidates.length} foram mantidas na camada local e {EXCLUDED_FROM_LOCAL_RECORTE_IDS.length} ficaram fora por falta de vínculo eleitoral local confirmado. Identidade técnica: <code>SQ_CANDIDATO</code>.
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-black text-white">Candidaturas</h3>
          <p className="mt-1 text-xs text-slate-500">
            {languageMode === 'technical' ? 'A busca considera nome completo, ocupação, escolaridade e descrição do vínculo local.' : 'Procure por nome, partido ou número.'}
          </p>
        </div>
        <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-400">
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Buscar candidatura</span>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Buscar candidato..."
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-600 sm:w-56"
          />
        </label>
      </div>

      {candidates.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {candidates.map(candidate => {
            const profile = CANDIDATE_PROFILES[candidate.sqCandidate];
            if (!profile) return null;
            const candidateLabel = candidate.name.replace(/\s+/g, ' ').trim();
            const photoSrc = candidate.photoUrl ?? profile.photoUrl;
            const instagramSrc = candidate.instagramUrl;
            return (
              <article key={candidate.sqCandidate} data-testid="candidate-card" className="overflow-hidden rounded-3xl border border-white/8 bg-white/[0.018]">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <CandidatePhoto name={candidateLabel} src={photoSrc} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-black leading-tight text-white">{candidateLabel}</h4>
                        <span className="rounded-full bg-emerald-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-200">{candidate.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{candidate.party} · Deputado Estadual · nº {candidate.ballotNumber}</p>
                      <p className="mt-2 text-[11px] font-semibold text-sky-200/90">{profile.localConnection}</p>
                    </div>
                  </div>

                  {languageMode === 'technical' && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <Info label="Patrimônio declarado" value={profile.declaredAssetsBrl == null ? 'Não informado' : profile.declaredAssetsBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                      <Info label="Escolaridade" value={profile.education} />
                      <Info label="Ocupação" value={profile.occupation} />
                    </div>
                  )}


                  <div className="mt-4 flex flex-wrap gap-2">
                    {instagramSrc ? (
                      <a
                        href={instagramSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-pink-300/15 bg-pink-300/[0.04] px-3 py-2 text-xs font-bold text-pink-100"
                        aria-label={'Instagram informado no registro de ' + candidateLabel}
                      >
                        <Camera className="h-4 w-4" aria-hidden="true" />
                        Instagram informado
                      </a>
                    ) : (
                      <span className="inline-flex min-h-11 items-center rounded-xl border border-white/8 px-3 py-2 text-xs font-semibold text-slate-500">
                        Instagram não informado no registro
                      </span>
                    )}
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-200"
                      onClick={async () => {
                        const result = await shareCandidate(candidate, profile);
                        setShareStatus(candidate.sqCandidate + ':' + result);
                        window.setTimeout(() => setShareStatus(''), 1600);
                      }}
                    >
                      <Share2 className="h-4 w-4" aria-hidden="true" />
                      Compartilhar
                    </button>
                    {candidateSource?.url && (
                      <a href={candidateSource.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-200">
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        Ver TSE
                      </a>
                    )}
                  </div>

                  {shareStatus.startsWith(candidate.sqCandidate + ':') && (
                    <div className="mt-2 text-[11px] font-semibold text-emerald-300" role="status">{shareStatus.split(':')[1]}</div>
                  )}

                  <details className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02]">
                    <summary className="cursor-pointer list-none px-4 py-3 text-xs font-bold text-slate-300">
                      Mais dados
                    </summary>
                    <div className="grid gap-2 border-t border-white/8 p-4 sm:grid-cols-2">
                      <Info label="Nome completo" value={profile.fullName} />
                      <Info label="Naturalidade" value={profile.naturalidade} />
                      <Info label="SQ_CANDIDATO" value={candidate.sqCandidate} />
                      <Info label="Snapshot" value={candidate.snapshotDate} />
                      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 sm:col-span-2">
                        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Por que entrou no recorte</div>
                        <div className="mt-1 text-sm font-semibold text-white">{profile.evidenceNote}</div>
                        <a href={profile.localEvidenceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-sky-300">
                          Ver evidência do vínculo local <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </div>
                      {languageMode === 'technical' && (
                        <>
                          <Info label="Origem" value="TSE · Candidatos 2026" />
                          <Info label="Identificador de captura" value={candidateSource?.id ?? 'tse-candidatos-2026'} />
                          <Info label="Método" value="CSV TSE + redes sociais TSE + foto TSE" />
                          <Info label="Imagem" value={candidate.photoUrl ? 'Arquivo TSE ingerido localmente' : 'Não disponível no snapshot'} />
                        </>
                      )}
                    </div>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">Nenhum nome encontrado.</div>
      )}

      <div className="mt-5 rounded-2xl border border-amber-300/10 bg-amber-300/[0.025] p-4 text-xs leading-5 text-slate-500">
        <ShieldAlert className="mb-2 h-4 w-4 text-amber-300" aria-hidden="true" />
        {languageMode === 'simple'
          ? 'Esta não é uma lista completa de candidatos. É um recorte de nomes com vínculo eleitoral local documentado.'
          : 'A watchlist bruta do TSE é um recorte de nomes. A camada local não infere residência ou naturalidade: ela usa evidências eleitorais públicas para justificar a inclusão em Águas Lindas.'}
      </div>

      <div className="mt-6 space-y-4">
        <Contas360 />
        <RadarPesquisas />
        <TimelineProcessual />
      </div>
    </section>
  );
}
