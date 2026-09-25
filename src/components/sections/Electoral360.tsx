import { CheckCircle2, ExternalLink, FileText, History, Search, ShieldAlert, UserRound, ArrowRight, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { electoral360Diff, electoral360Snapshot } from '../../data/electoral360';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

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
  const complementaryStats = electoral360Snapshot.complementaryStats;
  const electorate = d.electoral;
  const ageTotal = electorate.ageGroups.reduce((sum, group) => sum + group.voters, 0);
  const genderTotalPct = (electorate.womenPct ?? 0) + (electorate.menPct ?? 0);
  const ballotHistory = [
    electorate.electorate2018 != null ? { year: 2018, value: electorate.electorate2018 } : null,
    electorate.electorate2022 != null ? { year: 2022, value: electorate.electorate2022 } : null,
    electorate.electorate2024 != null ? { year: 2024, value: electorate.electorate2024 } : null,
    { year: 2026, value: electorate.electorate },
  ].filter(Boolean) as { year: number; value: number }[];

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
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Eleitorado atual</div><div className="mt-2 text-2xl font-black text-white light:text-slate-900">{electorate.electorate.toLocaleString('pt-BR')}</div><div className="text-xs text-slate-500">snapshot · {electorate.snapshotDate}</div></Card>
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Participação 2024</div><div className="mt-2 text-2xl font-black text-white light:text-slate-900">{electorate.turnout2024Pct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</div><div className="text-xs text-slate-500">{electorate.validVotes2024Count.toLocaleString('pt-BR')} votos válidos</div></Card>
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Abstenção 2024</div><div className="mt-2 text-2xl font-black text-white light:text-slate-900">{electorate.abstention2024Pct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</div><div className="text-xs text-slate-500">{electorate.abstention2024Count.toLocaleString('pt-BR')} eleitores</div></Card>
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Cadastro por gênero</div><div className="mt-2 text-2xl font-black text-white light:text-slate-900">{genderTotalPct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</div><div className="text-xs text-slate-500">mulheres + homens · cadastro</div></Card>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_.9fr]">
        <Card>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Como o eleitorado mudou</div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ballotHistory.map(point => (
              <div key={point.year} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">{point.year}</span>
                <strong className="mt-1 block text-lg text-white light:text-slate-900">{point.value.toLocaleString('pt-BR')}</strong>
                <span className="text-[9px] text-slate-500">{point.year === 2026 ? 'snapshot atual' : 'histórico'}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-slate-500">Série apresentada como contagem de eleitorado em cada base de referência; não representa votos obtidos por candidaturas.</p>
        </Card>

        <Card>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Quem compõe o eleitorado</div>
          <div className="mt-4 space-y-3">
            {electorate.ageGroups.map(group => (
              <div key={group.id}>
                <div className="flex justify-between gap-3 text-xs"><span className="text-slate-400">{group.label}</span><strong className="text-white light:text-slate-900">{group.sharePct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-sky-300" style={{ width: `${Math.min(100, group.sharePct)}%` }} /></div>
                <div className="mt-1 text-[10px] text-slate-600">{group.voters.toLocaleString('pt-BR')} eleitores</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/8 p-3"><span className="text-[10px] text-slate-600">Mulheres</span><strong className="mt-1 block text-white light:text-slate-900">{(electorate.womenPct ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</strong></div>
            <div className="rounded-xl border border-white/8 p-3"><span className="text-[10px] text-slate-600">Homens</span><strong className="mt-1 block text-white light:text-slate-900">{(electorate.menPct ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</strong></div>
          </div>
          <p className="mt-3 text-[10px] text-slate-600">Soma das faixas etárias capturadas: {ageTotal.toLocaleString('pt-BR')} eleitores.</p>
        </Card>
      </div>
      {complementaryStats && (
        <details className="mb-4 rounded-3xl border border-white/8 bg-white/[0.015] p-4">
          <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Complementos do universo estadual</summary>
          <div className="mt-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Mais contexto eleitoral</div>
              <div className="mt-1 text-sm font-semibold text-white light:text-slate-900">Base complementar consultada</div>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">Informações complementares para conferir os dados públicos do recorte. A base estadual não informa o município da candidatura.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center sm:w-64">
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2"><strong className="block text-base text-white light:text-slate-900">{complementaryStats.byGender.FEMININO ?? 0}</strong><span className="text-[9px] text-slate-600">feminino</span></div>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2"><strong className="block text-base text-white light:text-slate-900">{complementaryStats.byGender.MASCULINO ?? 0}</strong><span className="text-[9px] text-slate-600">masculino</span></div>
            </div>
            </div>
          </div>
        </details>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          <div className="mt-3 text-sm font-black text-white light:text-slate-900">Dados públicos disponíveis</div>
          <div className="text-xs text-slate-500">recorte eleitoral acompanhado</div>
        </Card>
        <Card>
          <History className="h-5 w-5 text-violet-300" aria-hidden="true" />
          <div className="mt-3 text-sm font-black text-white light:text-slate-900">{hasLocalCandidateSnapshot ? 'Snapshot disponível' : 'Atualização pendente'}</div>
          <div className="mt-1 text-xs text-slate-500">identificação pública disponível</div>
        </Card>
        <Card>
          <UserRound className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white light:text-slate-900">{electoral360Snapshot.matchedCandidates.length}</div>
          <div className="text-xs text-slate-500">nomes acompanhados</div>
        </Card>
      </div>

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
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Nome completo" value={selectedLocalTseCandidate.fullName || selectedLocalTseCandidate.name} />
              <Info label="Nome de urna" value={selectedLocalTseCandidate.name} />
              <Info label="Partido" value={selectedLocalTseCandidate.party || 'Não informado'} />
              <Info label="Número" value={String(selectedLocalTseCandidate.ballotNumber || 'Não informado')} />
              <Info label="Cargo" value={selectedLocalTseCandidate.office || 'Não informado'} />
              <Info label="Ocupação" value={selectedLocalTseCandidate.occupation || 'Não informado'} />
              <Info label="Escolaridade" value={selectedLocalTseCandidate.education || 'Não informado'} />
              <Info label="Snapshot" value={selectedLocalTseCandidate.snapshotDate} />
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 sm:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Mídia oficial</div>
                {selectedLocalTseCandidate.photoAvailableInTseArchive ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/5 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                      Foto presente no arquivo TSE validado
                    </span>
                    {selectedLocalTseCandidate.photoArchiveUrl && (
                      <a
                        href={selectedLocalTseCandidate.photoArchiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:border-sky-300/30 hover:text-sky-200"
                      >
                        Abrir acervo oficial
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Não há foto validada para este registro no snapshot atual. O observatório não substitui a mídia por imagem de terceiros.
                  </p>
                )}
              </div>
            </div>
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
                <article key={candidate.sqCandidate} className="rounded-2xl border border-white/8 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-black text-white light:text-slate-900 break-words">{candidate.name}</h4>
                      <p className="mt-1 text-xs text-slate-500 break-words">{candidate.party} · {candidate.office} · nº {candidate.ballotNumber}</p>
                      <span className="mt-2 inline-flex max-w-full items-center rounded-full border border-white/8 px-2 py-1 text-[10px] font-semibold text-slate-500 break-words">{candidate.status || 'situação não informada'}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedName(candidate.name)} className="electoral-action-button mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-sky-300/15 bg-sky-300/[0.04] px-3 py-2 text-xs font-black text-sky-100">Ver perfil</button>
                </article>
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

function Info({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold text-white light:text-slate-900">{value}</div>
    </div>
  );
}
