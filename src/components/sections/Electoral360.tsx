import { CheckCircle2, Database, ExternalLink, FileText, History, Search, ShieldAlert, UserRound, ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { electoral360Diff, electoral360Modules, electoral360Snapshot } from '../../data/electoral360';
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

const moduleStatusLabel: Record<string, string> = {
  captured: 'Dados locais capturados',
  cataloged: 'Catálogo disponível',
  pending: 'Captura pendente',
};

export function Electoral360() {
  const [query, setQuery] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const localCandidateRecords = electoral360Snapshot.matchedCandidates;
  const hasLocalCandidateSnapshot = localCandidateRecords.length > 0;
  const captured = electoral360Modules.filter(module => module.status === 'captured').length;
  const cataloged = electoral360Modules.filter(module => module.status === 'cataloged').length;
  const snapshotWarning = ['not_synced', 'stale', 'failed', 'local_filter_pending'].includes(String(electoral360Diff.state));
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

  const officialCandidates = useMemo(() => {
    if (!normalizedQuery) return localCandidateRecords;
    return localCandidateRecords.filter(candidate =>
      [candidate.name, candidate.party, candidate.office, candidate.status, candidate.ballotNumber]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, localCandidateRecords]);

  const localCandidates = useMemo(() => {
    if (!normalizedQuery) return d.candidates;
    return d.candidates.filter(candidate =>
      [candidate.name, candidate.party, candidate.status, candidate.ballotNumber]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const selectedOfficial = officialCandidates.find(candidate => candidate.name === selectedName);
  const selectedLocal = d.candidates.find(candidate => candidate.name === selectedName);
  const profileName = hasLocalCandidateSnapshot ? selectedOfficial?.name ?? '' : selectedLocal?.name ?? ';

  return (
    <section id="eleitoral360" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="electoral360-title">
      <SectionHeader
        titleId="electoral360-title"
        eyebrow="Eleitoral 360°"
        title="Da fotografia ao perfil documental"
        description="Veja os candidatos acompanhados em Águas Lindas, seus dados públicos e o contexto eleitoral da cidade."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Eleitorado atual</div><div className="mt-2 text-2xl font-black text-white">{electorate.electorate.toLocaleString('pt-BR')}</div><div className="text-xs text-slate-500">snapshot · {electorate.snapshotDate}</div></Card>
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Participação 2024</div><div className="mt-2 text-2xl font-black text-white">{electorate.turnout2024Pct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</div><div className="text-xs text-slate-500">{electorate.validVotes2024Count.toLocaleString('pt-BR')} votos válidos</div></Card>
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Abstenção 2024</div><div className="mt-2 text-2xl font-black text-white">{electorate.abstention2024Pct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</div><div className="text-xs text-slate-500">{electorate.abstention2024Count.toLocaleString('pt-BR')} eleitores</div></Card>
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Cadastro por gênero</div><div className="mt-2 text-2xl font-black text-white">{genderTotalPct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</div><div className="text-xs text-slate-500">mulheres + homens · cadastro</div></Card>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_.9fr]">
        <Card>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Evolução do eleitorado</div>
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
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Perfil do eleitorado</div>
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
        <Card className="mb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Mais dados eleitorais</div>
              <div className="mt-1 text-sm font-semibold text-white">905 registros · geração em 23/09/2026</div>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">Base oficial complementar usada para conferir os registros do recorte local. O município de candidatura não é informado neste arquivo estadual.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center sm:w-64">
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2"><strong className="block text-base text-white">{complementaryStats.byGender.FEMININO ?? 0}</strong><span className="text-[9px] text-slate-600">feminino</span></div>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2"><strong className="block text-base text-white">{complementaryStats.byGender.MASCULINO ?? 0}</strong><span className="text-[9px] text-slate-600">masculino</span></div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{captured}</div>
          <div className="text-xs text-slate-500">módulos com captura</div>
        </Card>
        <Card>
          <Database className="h-5 w-5 text-sky-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{cataloged}</div>
          <div className="text-xs text-slate-500">módulos apenas catalogados</div>
        </Card>
        <Card>
          <History className="h-5 w-5 text-violet-300" aria-hidden="true" />
          <div className="mt-3 text-sm font-black text-white">{stateLabel[String(electoral360Diff.state)] ?? String(electoral360Diff.state)}</div>
          <div className="mt-1 text-xs text-slate-500">{electoral360Diff.added} novos · {electoral360Diff.changed} alterados · {electoral360Diff.removed} removidos</div>
        </Card>
        <Card>
          <UserRound className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{electoral360Snapshot.matchedCandidates.length}</div>
          <div className="text-xs text-slate-500">correspondências na captura TSE</div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white">Perfil documental</h3>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                {hasLocalCandidateSnapshot
                  ? 'A captura oficial está disponível. Este perfil mostra somente atributos efetivamente carregados do snapshot estadual de Goiás; o vínculo com Águas Lindas é um recorte editorial de monitoramento.'
                  : 'A captura TSE ainda não está sincronizada. O perfil abaixo usa apenas o recorte editorial local e não representa o universo completo de candidaturas.'}
              </p>
            </div>
            <FileText className="h-5 w-5 text-sky-300" aria-hidden="true" />
          </div>

          <div className="mb-3 mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-3 text-xs leading-5 text-slate-500">
            <strong className="text-amber-200">{hasLocalCandidateSnapshot ? 'Fonte operacional: TSE' : 'Fonte operacional: recorte editorial local'}</strong>{' '}
            · estado do snapshot: {stateLabel[String(electoral360Diff.state)] ?? String(electoral360Diff.state)}. A ausência deste snapshot não equivale à ausência de candidaturas na fonte oficial.
          </div>

          <div className="mt-4 flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1" aria-label="Registros disponíveis para o perfil documental">
            {(hasLocalCandidateSnapshot ? electoral360Snapshot.matchedCandidates : d.candidates).map(candidate => (
              <button
                key={candidate.name}
                type="button"
                onClick={() => setSelectedName(candidate.name)}
                className={`min-h-11 max-w-full rounded-xl border px-3 py-2 text-left text-xs font-bold break-words ${candidate.name === profileName ? 'border-sky-300/40 bg-sky-300/10 text-sky-200' : 'border-white/10 text-slate-400'}`}
              >
                {candidate.name}
              </button>
            ))}
          </div>

          {!profileName ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">
              Selecione um registro para abrir o perfil documental. Nenhum nome é pré-selecionado.
            </div>
          ) : hasLocalCandidateSnapshot && selectedOfficial ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Nome completo" value={selectedOfficial.fullName || selectedOfficial.name} />
              <Info label="Nome de urna" value={selectedOfficial.name} />
              <Info label="Partido" value={selectedOfficial.party || 'Não informado'} />
              <Info label="Número" value={String(selectedOfficial.ballotNumber || 'Não informado')} />
              <Info label="Cargo" value={selectedOfficial.office || 'Não informado'} />
              <Info label="Ocupação" value={selectedOfficial.occupation || 'Não informado'} />
              <Info label="Escolaridade" value={selectedOfficial.education || 'Não informado'} />
              <Info label="Snapshot" value={selectedOfficial.snapshotDate} />
            </div>
          ) : selectedLocal ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Identidade" value={selectedLocal.name} />
              <Info label="Situação" value={selectedLocal.status} />
              <Info label="Partido" value={selectedLocal.party ?? 'Não informado'} />
              <Info label="Número" value={String(selectedLocal.ballotNumber ?? 'Não informado')} />
              <Info label="Ocupação" value={selectedLocal.occupation ?? 'Não informado'} />
              <Info label="Escolaridade" value={selectedLocal.education ?? 'Não informado'} />
              <Info label="Bens declarados" value={selectedLocal.declaredAssetsBrl != null ? selectedLocal.declaredAssetsBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não informado'} />
              <Info label="Snapshot editorial" value={selectedLocal.snapshotDate} />
            </div>
          ) : null}

          {profileName && (
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Módulos documentais</div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Estes módulos fazem parte do catálogo do Eleitoral 360°. Enquanto não houver captura local do conteúdo correspondente, eles não são apresentados como se os dados já estivessem disponíveis.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['Bens', 'Contas', 'Redes', 'Pesquisas', 'Processos', 'Propostas', 'Histórico', 'Alterações'].map(tab => (
                  <div key={tab} className="rounded-xl border border-white/8 p-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-600">Catálogo</span>
                    <strong className="mt-1 block text-xs text-slate-400">{tab}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <ShieldAlert className={`h-4 w-4 ${snapshotWarning ? 'text-amber-300' : 'text-emerald-300'}`} aria-hidden="true" />
              Estado do snapshot
            </div>
            <div className="mt-3 text-lg font-black text-white">{stateLabel[String(electoral360Diff.state)] ?? String(electoral360Diff.state)}</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">O universo oficial de candidaturas e o recorte editorial de Águas Lindas são mantidos separados.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">{electoral360Snapshot.localWatchlist.length} nomes no recorte</span>
              <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">identidade por SQ_CANDIDATO</span>
            </div>
          </Card>

          <Card>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Recorte operacional</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Este recorte monitora nomes selecionados dentro do universo oficial de Goiás; não representa a lista completa de candidaturas nem uma lista municipal.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {electoral360Snapshot.localWatchlist.map(name => (
                <span key={name} className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400 break-words">{name}</span>
              ))}
            </div>
          </Card>
        </div>
      </div>

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
          <div className="min-w-0"><strong className="block text-xs text-sky-100">Busca eleitoral rápida</strong><span className="mt-1 block text-[11px] leading-5 text-slate-500">Nome, partido, cargo, situação ou número. O filtro não classifica candidaturas.</span></div>
          <ArrowRight className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
        </div>

        {hasLocalCandidateSnapshot ? (
          officialCandidates.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {officialCandidates.map(candidate => (
                <article key={candidate.sqCandidate} className="rounded-2xl border border-white/8 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-black text-white break-words">{candidate.name}</h4>
                      <p className="mt-1 text-xs text-slate-500 break-words">{candidate.party} · {candidate.office} · nº {candidate.ballotNumber}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-500">{candidate.status}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <Info label="SQ_CANDIDATO" value={candidate.sqCandidate} />
                    <Info label="Snapshot" value={candidate.snapshotDate} />
                  </div>
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
                  <button type="button" onClick={() => setSelectedName(candidate.name)} className="mt-3 min-h-11 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300">Abrir perfil documental</button>
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
