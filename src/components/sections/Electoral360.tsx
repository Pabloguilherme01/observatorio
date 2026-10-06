import { ExternalLink, FileText, Search, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { electoral360Diff, electoral360Snapshot } from '../../data/electoral360';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { ElectoralCandidateCard } from './electoral/ElectoralCandidateCard';
import { ElectoralCandidateProfileDetails } from './electoral/ElectoralCandidateProfileDetails';
import { ElectoralOverviewPanel } from './electoral/ElectoralOverviewPanel';

const stateLabel: Record<string, string> = {
  first_capture: 'Primeiro snapshot',
  synced: 'Sincronizado',
  unchanged: 'Sem alterações',
  changed: 'Dados alterados',
  stale: 'Desatualizado',
  failed: 'Falha na sincronização',
  not_synced: 'Ainda não sincronizado',
  local_filter_pending: 'Recorte local pendente',
};

export function Electoral360() {
  const [query, setQuery] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);
  const localCandidateRecords = electoral360Snapshot.matchedCandidates;
  const hasLocalCandidateSnapshot = localCandidateRecords.length > 0;
  const snapshotAgeHours = electoral360Snapshot.capturedAt
    ? Math.max(0, (nowMs - Date.parse(electoral360Snapshot.capturedAt)) / 3_600_000)
    : Infinity;
  const snapshotFreshnessWarning = Number.isFinite(snapshotAgeHours) && snapshotAgeHours > 24;
  const snapshotWarning = ['not_synced', 'stale', 'failed', 'local_filter_pending'].includes(String(electoral360Diff.state))
    || snapshotFreshnessWarning;
  const snapshotStateLabel = snapshotFreshnessWarning
    ? 'Captura com mais de 24h'
    : (stateLabel[String(electoral360Diff.state)] ?? 'Atualização em acompanhamento');
  const candidateSource = d.sources.find(source => source.id === 'tse-candidatos-2026');
  const electorate = d.electoral;
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');

  const localTseCandidates = useMemo(() => {
    if (!normalizedQuery) return localCandidateRecords;
    return localCandidateRecords.filter(candidate =>
      [candidate.name, candidate.party, candidate.office, candidate.status, candidate.ballotNumber]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, localCandidateRecords]);

  const selectedLocalTseCandidate = localTseCandidates.find(candidate => candidate.name === selectedName);
  const profileName = selectedLocalTseCandidate?.name ?? '';

  return (
    <section id="eleitoral360" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="electoral360-title">
      <div id="candidaturas" className="scroll-mt-24" aria-hidden="true" />
      <SectionHeader
        titleId="electoral360-title"
        eyebrow="Eleitoral 2026"
        title="Nomes acompanhados no recorte de Águas Lindas"
        description="Consulte o recorte editorial acompanhado pelo observatório e confira cada registro em sua fonte oficial."
      />

      <div className={`mb-4 rounded-2xl border ${snapshotWarning ? 'border-amber-300/20 bg-amber-300/[0.04]' : 'border-sky-300/10 bg-sky-300/[0.025]'} px-3 py-2.5 text-[11px] leading-5 text-slate-500`} role="note">
        <strong className={snapshotWarning ? 'text-amber-100' : 'text-sky-100'}>Atualização:</strong> o projeto agenda uma verificação da fonte oficial do TSE a cada 4 horas. A data exibida abaixo corresponde à última captura persistida do snapshot, não a uma consulta em tempo real.
        {snapshotFreshnessWarning && (
          <span className="mt-1 block text-amber-200/80">
            A captura ultrapassou 24 horas; trate os dados como potencialmente desatualizados até a próxima captura oficial válida. A verificação editorial usa a mesma janela de 24 horas adotada pelo pipeline.
          </span>
        )}
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-3 text-center" aria-label="Resumo do recorte eleitoral">
        <div className="rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] px-3 py-3">
          <strong className="block text-sm text-white light:text-slate-900">{localCandidateRecords.length} nomes</strong>
          <span className="text-[10px] leading-4 text-slate-500">watchlist documental local</span>
        </div>
        <div className="rounded-2xl border border-white/7 bg-white/[0.02] px-3 py-3">
          <strong className="block text-sm text-white light:text-slate-900">{electorate.electorate.toLocaleString('pt-BR')}</strong>
          <span className="text-[10px] leading-4 text-slate-500">eleitores no snapshot</span>
        </div>
        <div className="rounded-2xl border border-white/7 bg-white/[0.02] px-3 py-3">
          <strong className="block text-sm text-white light:text-slate-900">Fonte oficial</strong>
          <span className="text-[10px] leading-4 text-slate-500">TSE e registros públicos</span>
        </div>
      </div>
      <details className="mb-4 rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] px-3 py-2.5">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-xs font-black text-sky-100"><span>Sobre o recorte local</span><span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-400">{electoral360Snapshot.matchedCandidates.length} nomes</span></summary>
        <p className="mt-2 text-[11px] leading-5 text-slate-500">Este painel mostra somente os nomes do recorte editorial acompanhado pelo observatório. O snapshot estadual não informa município da candidatura; por isso, a lista não deve ser interpretada isoladamente como confirmação de candidatura por município. Para a cobertura completa, consulte o catálogo oficial do TSE.</p>
      </details>
      <div className="mb-4 flex items-start gap-2 rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] px-3 py-2.5 text-[11px] leading-5 text-slate-400" role="note">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
        <p><strong className="text-amber-100">Importante:</strong> este recorte não representa uma lista completa de candidaturas de Águas Lindas. Os nomes são acompanhados porque há evidência documental local e cada registro deve ser conferido na fonte oficial.</p>
      </div>
      {electoral360Snapshot.captureMode === 'static-local' && (
        <div className="electoral-scope-note mb-4 flex items-start gap-3 rounded-2xl border border-amber-300/10 bg-amber-300/[0.03] px-3 py-2.5">
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-200/70" aria-hidden="true" />
          <div className="min-w-0">
            <strong className="block text-xs font-black text-amber-100">{snapshotWarning ? snapshotStateLabel : 'Recorte disponível'}</strong>
            <span className="mt-1 block text-[11px] leading-5 text-slate-500">Os nomes abaixo são o recorte atualmente disponível. A confirmação do município da candidatura deve ser feita no registro oficial.</span>
          </div>
        </div>
      )}
      <ElectoralOverviewPanel />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white light:text-slate-900">Perfil documental</h3>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                {hasLocalCandidateSnapshot
                  ? 'Dados públicos do TSE para os nomes acompanhados pelo observatório.'
                  : 'Os dados deste recorte ainda dependem de atualização oficial.'}
              </p>
            </div>
            <FileText className="h-5 w-5 text-sky-300" aria-hidden="true" />
          </div>



          <div className="mt-4 flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1" aria-label="Nomes acompanhados disponíveis para o perfil">
            {electoral360Snapshot.matchedCandidates.map(candidate => (
              <button
                key={candidate.name}
                type="button"
                onClick={() => setSelectedName(candidate.name)}
                className={`min-h-11 max-w-full rounded-xl border px-3 py-2 text-left text-xs font-bold break-words ${candidate.name === profileName ? 'border-sky-300/40 bg-sky-300/10 text-sky-100' : 'border-white/10 text-slate-400'}`}
                aria-pressed={candidate.name === profileName}
                aria-label={`Abrir perfil de ${candidate.name}`}
              >
                {candidate.name}
              </button>
            ))}
          </div>

          {!profileName ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">
              Selecione um nome acompanhado para abrir o perfil documental. Nenhum nome é pré-selecionado.
            </div>
          ) : hasLocalCandidateSnapshot && selectedLocalTseCandidate ? (
            <ElectoralCandidateProfileDetails candidate={selectedLocalTseCandidate} />
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">
              O recorte local ainda não possui um perfil disponível neste snapshot.
            </div>
          )}

          {profileName && (
            <details className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
              <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Mais informações sobre a fonte</summary>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Os dados do perfil vêm de um snapshot oficial do TSE. A relação com Águas Lindas identifica o recorte acompanhado pelo observatório, não a origem municipal da candidatura.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">snapshot {selectedLocalTseCandidate?.snapshotDate ?? 'não informado'}</span>
                <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">recorte acompanhado</span>
              </div>
            </details>
          )}
        </Card>

        <div className="space-y-4">
          <details className="rounded-3xl border border-white/8 bg-white/[0.015] p-4">
            <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Sobre as fontes</summary>
            <div className="mt-3 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-white light:text-slate-900"><ShieldAlert className="h-4 w-4 text-sky-300" aria-hidden="true" /> Conferência dos dados</div>
                <p className="mt-2 text-xs leading-5 text-slate-500">O observatório apresenta estes nomes como um recorte acompanhado em Águas Lindas. A base estadual do TSE não informa o município da candidatura.</p>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Nomes acompanhados</div>
                <div className="mt-3 flex flex-wrap gap-2">{electoral360Snapshot.localWatchlist.map(name => <span key={name} className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400 break-words">{name}</span>)}</div>
              </div>
            </div>
          </details>
        </div>      </div>

      <Card className="mt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-black text-white light:text-slate-900">{hasLocalCandidateSnapshot ? 'Registros acompanhados' : 'Registros do recorte local'}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {hasLocalCandidateSnapshot ? 'Os nomes abaixo pertencem ao recorte acompanhado. O município da candidatura é exibido apenas quando confirmado pela fonte oficial.' : 'Ainda não há registros de nomes no snapshot local.'}
            </p>
          </div>
          <label className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-400 sm:w-auto">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Buscar candidatura</span>
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={hasLocalCandidateSnapshot ? 'Buscar candidato...' : 'Filtrar recorte...'}
                className="w-full min-w-0 bg-transparent text-base outline-none placeholder:text-slate-600 sm:w-56 sm:text-sm"
                type="search"
                inputMode="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-label={hasLocalCandidateSnapshot ? 'Buscar nome acompanhado' : 'Filtrar recorte local'}
              />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="grid min-h-9 min-w-9 place-items-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-white light:text-slate-900" aria-label="Limpar busca">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </label>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-sky-300/10 bg-sky-300/[0.025] p-2.5">
          <div className="min-w-0"><strong className="block text-[11px] text-sky-100">Buscar no recorte</strong><span className="ml-1 text-[10px] leading-4 text-slate-500">nome, partido, cargo ou número</span></div>
          <ArrowRight className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
        </div>

        {hasLocalCandidateSnapshot ? (
          localTseCandidates.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {localTseCandidates.map(candidate => (
                <ElectoralCandidateCard
                  key={candidate.sqCandidate}
                  candidate={candidate}
                  onSelect={setSelectedName}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">
              <strong className="block text-sm font-bold text-slate-300">Nenhum nome encontrado</strong>
              <span className="mt-1 block">Tente outro termo ou limpe a busca para ver novamente os nomes acompanhados.</span>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-3 inline-flex min-h-10 items-center rounded-xl border border-sky-300/15 bg-sky-300/[0.04] px-3 py-2 text-xs font-black text-sky-100 hover:border-sky-300/30"
                >
                  Limpar busca
                </button>
              )}
            </div>
          )
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">
            O recorte local ainda está aguardando dados de candidatos. O observatório não exibe outro universo no lugar dele.
          </div>
        )}

        {candidateSource?.url && (
          <a href={candidateSource.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-sky-300">
            Ver catálogo oficial do TSE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </Card>
    </section>
  );
}

