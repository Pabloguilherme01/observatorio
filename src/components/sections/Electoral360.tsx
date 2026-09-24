import { CheckCircle2, ExternalLink, FileText, History, Search, ShieldAlert, UserRound, ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
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
  const localCandidateRecords = electoral360Snapshot.matchedCandidates;
  const hasLocalCandidateSnapshot = localCandidateRecords.length > 0;
  const snapshotWarning = ['not_synced', 'stale', 'failed', 'local_filter_pending'].includes(String(electoral360Diff.state));
  const snapshotStateLabel = stateLabel[String(electoral360Diff.state)] ?? 'Atualização em acompanhamento';
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
        eyebrow="Eleitoral 360°"
        title="Conheça os candidatos acompanhados"
        description="Consulte o recorte de nomes acompanhado em Águas Lindas e confira os dados públicos de cada perfil."
      />

      <div className="mb-3 rounded-2xl border border-white/8 bg-white/[0.018] px-3 py-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">O que você encontra aqui</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/6 px-3 py-2">
            <strong className="block text-xs text-white">Perfis do recorte</strong>
            <span className="text-[10px] leading-4 text-slate-500">nome, partido, número e dados cadastrais disponíveis.</span>
          </div>
          <div className="rounded-xl border border-white/6 px-3 py-2">
            <strong className="block text-xs text-white">Eleitorado</strong>
            <span className="text-[10px] leading-4 text-slate-500">participação, abstenção e composição do cadastro.</span>
          </div>
          <div className="rounded-xl border border-white/6 px-3 py-2">
            <strong className="block text-xs text-white">Fontes</strong>
            <span className="text-[10px] leading-4 text-slate-500">links para conferir os dados nas bases públicas.</span>
          </div>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] px-3 py-2.5">
        <div className="min-w-0">
          <strong className="block text-xs font-black text-sky-100">Nomes acompanhados em Águas Lindas</strong>
          <span className="text-[11px] text-slate-500">Este recorte reúne somente os nomes monitorados pelo observatório para a cidade; ele não substitui a confirmação do município da candidatura no registro oficial.</span>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-400">{electoral360Snapshot.matchedCandidates.length} acompanhados</span>
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
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Eleitorado atual</div><div className="mt-2 text-2xl font-black text-white">{electorate.electorate.toLocaleString('pt-BR')}</div><div className="text-xs text-slate-500">snapshot · {electorate.snapshotDate}</div></Card>
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Participação 2024</div><div className="mt-2 text-2xl font-black text-white">{electorate.turnout2024Pct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</div><div className="text-xs text-slate-500">{electorate.validVotes2024Count.toLocaleString('pt-BR')} votos válidos</div></Card>
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Abstenção 2024</div><div className="mt-2 text-2xl font-black text-white">{electorate.abstention2024Pct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</div><div className="text-xs text-slate-500">{electorate.abstention2024Count.toLocaleString('pt-BR')} eleitores</div></Card>
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Cadastro por gênero</div><div className="mt-2 text-2xl font-black text-white">{genderTotalPct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</div><div className="text-xs text-slate-500">mulheres + homens · cadastro</div></Card>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_.9fr]">
        <Card>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Como o eleitorado mudou</div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ballotHistory.map(point => (
              <div key={point.year} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">{point.year}</span>
                <strong className="mt-1 block text-lg text-white">{point.value.toLocaleString('pt-BR')}</strong>
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
                <div className="flex justify-between gap-3 text-xs"><span className="text-slate-400">{group.label}</span><strong className="text-white">{group.sharePct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-sky-300" style={{ width: `${Math.min(100, group.sharePct)}%` }} /></div>
                <div className="mt-1 text-[10px] text-slate-600">{group.voters.toLocaleString('pt-BR')} eleitores</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/8 p-3"><span className="text-[10px] text-slate-600">Mulheres</span><strong className="mt-1 block text-white">{(electorate.womenPct ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</strong></div>
            <div className="rounded-xl border border-white/8 p-3"><span className="text-[10px] text-slate-600">Homens</span><strong className="mt-1 block text-white">{(electorate.menPct ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</strong></div>
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
              <div className="mt-1 text-sm font-semibold text-white">Base complementar consultada</div>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">Informações complementares para conferir os dados públicos do recorte. A base estadual não informa o município da candidatura.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center sm:w-64">
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2"><strong className="block text-base text-white">{complementaryStats.byGender.FEMININO ?? 0}</strong><span className="text-[9px] text-slate-600">feminino</span></div>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2"><strong className="block text-base text-white">{complementaryStats.byGender.MASCULINO ?? 0}</strong><span className="text-[9px] text-slate-600">masculino</span></div>
            </div>
            </div>
          </div>
        </details>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          <div className="mt-3 text-sm font-black text-white">Dados públicos disponíveis</div>
          <div className="text-xs text-slate-500">recorte eleitoral acompanhado</div>
        </Card>
        <Card>
          <History className="h-5 w-5 text-violet-300" aria-hidden="true" />
          <div className="mt-3 text-sm font-black text-white">{hasLocalCandidateSnapshot ? 'Snapshot disponível' : 'Atualização pendente'}</div>
          <div className="mt-1 text-xs text-slate-500">identificação pública disponível</div>
        </Card>
        <Card>
          <UserRound className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{electoral360Snapshot.matchedCandidates.length}</div>
          <div className="text-xs text-slate-500">nomes acompanhados</div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white">Perfil documental</h3>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                {hasLocalCandidateSnapshot
                  ? 'Dados públicos do TSE para os nomes acompanhados pelo observatório.'
                  : 'Os dados deste recorte ainda dependem de atualização oficial.'}
              </p>
            </div>
            <FileText className="h-5 w-5 text-sky-300" aria-hidden="true" />
          </div>



          <div className="mt-4 flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1" aria-label="Candidatos disponíveis para o perfil">
            {electoral360Snapshot.matchedCandidates.map(candidate => (
              <button
                key={candidate.name}
                type="button"
                onClick={() => setSelectedName(candidate.name)}
                className={`min-h-11 max-w-full rounded-xl border px-3 py-2 text-left text-xs font-bold break-words ${candidate.name === profileName ? 'border-sky-300/40 bg-sky-300/10 text-sky-100' : 'border-white/10 text-slate-400'}`}
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
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">
              O recorte local ainda não possui um perfil disponível neste snapshot.
            </div>
          )

          {profileName && (
            <details className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
              <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Mais informações sobre a fonte</summary>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Os dados do perfil vêm de um snapshot oficial do TSE. A relação com Águas Lindas identifica o recorte acompanhado pelo observatório, não a origem municipal da candidatura.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">snapshot {selectedLocalTseCandidate?.snapshotDate ?? selectedLocal?.snapshotDate ?? 'não informado'}</span>
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
                <div className="flex items-center gap-2 text-sm font-bold text-white"><ShieldAlert className="h-4 w-4 text-sky-300" aria-hidden="true" /> Conferência dos dados</div>
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
            <h3 className="text-lg font-black text-white">{hasLocalCandidateSnapshot ? 'Candidatos acompanhados em Águas Lindas' : 'Registros do recorte local'}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {hasLocalCandidateSnapshot ? 'Somente os nomes do recorte local são exibidos. Os dados de identificação vêm do arquivo oficial de Candidatos 2026 do TSE.' : 'Ainda não há registros de candidatos no snapshot local.'}
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
                aria-label={hasLocalCandidateSnapshot ? 'Buscar candidato' : 'Filtrar recorte local'}
              />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-sky-300/10 bg-sky-300/[0.035] p-3">
          <div className="min-w-0"><strong className="block text-xs text-sky-100">Encontre um nome</strong><span className="mt-1 block text-[11px] leading-5 text-slate-500">Busque por nome, partido, cargo ou número. A busca apenas localiza registros.</span></div>
          <ArrowRight className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
        </div>

        {hasLocalCandidateSnapshot ? (
          localTseCandidates.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {localTseCandidates.map(candidate => (
                <article key={candidate.sqCandidate} className="rounded-2xl border border-white/8 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-black text-white break-words">{candidate.name}</h4>
                      <p className="mt-1 text-xs text-slate-500 break-words">{candidate.party} · {candidate.office} · nº {candidate.ballotNumber}</p>
                      <span className="mt-2 block text-[11px] text-slate-600">{candidate.occupation || 'ocupação não informada'}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedName(candidate.name)} className="electoral-action-button mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-sky-300/15 bg-sky-300/[0.04] px-3 py-2 text-xs font-black text-sky-100">Ver perfil</button>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">Nenhuma correspondência encontrada para a busca atual.</div>
          )
        ) : (
          localCandidates.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {localCandidates.map(candidate => (
                <article key={candidate.name} className="rounded-2xl border border-white/8 p-4">
                  <h4 className="font-black text-white break-words">{candidate.name}</h4>
                  <p className="mt-1 text-xs text-slate-500 break-words">Registro editorial local · {candidate.party ?? 'partido não informado'}</p>
                  <button type="button" onClick={() => setSelectedName(candidate.name)} className="electoral-action-button mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-sky-300/15 bg-sky-300/[0.04] px-3 py-2 text-xs font-black text-sky-100">Abrir perfil documental</button>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">Nenhum registro corresponde ao filtro atual.</div>
          )
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
      <div className="mt-1 break-words text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
