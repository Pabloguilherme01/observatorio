import { CheckCircle2, Database, ExternalLink, FileText, History, Search, ShieldAlert, UserRound } from 'lucide-react';
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
  local_filter_pending: 'Filtro local pendente',
};

const moduleStatusLabel: Record<string, string> = {
  captured: 'Dados locais capturados',
  cataloged: 'Catálogo disponível',
  pending: 'Captura pendente',
};

export function Electoral360() {
  const [query, setQuery] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const hasOfficialCandidateSnapshot = electoral360Snapshot.matchedCandidates.length > 0;
  const captured = electoral360Modules.filter(module => module.status === 'captured').length;
  const cataloged = electoral360Modules.filter(module => module.status === 'cataloged').length;
  const snapshotWarning = ['not_synced', 'stale', 'failed', 'local_filter_pending'].includes(String(electoral360Diff.state));
  const candidateSource = d.sources.find(source => source.id === 'tse-candidatos-2026');

  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');

  const officialCandidates = useMemo(() => {
    if (!normalizedQuery) return electoral360Snapshot.matchedCandidates;
    return electoral360Snapshot.matchedCandidates.filter(candidate =>
      [candidate.name, candidate.party, candidate.office, candidate.status, candidate.ballotNumber]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const localCandidates = useMemo(() => {
    if (!normalizedQuery) return d.candidates;
    return d.candidates.filter(candidate =>
      [candidate.name, candidate.party, candidate.status, candidate.ballotNumber]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const selectedOfficial = electoral360Snapshot.matchedCandidates.find(candidate => candidate.name === selectedName);
  const selectedLocal = d.candidates.find(candidate => candidate.name === selectedName);
  const profileName = hasOfficialCandidateSnapshot ? selectedOfficial?.name ?? '' : selectedLocal?.name ?? '';

  return (
    <section id="eleitoral360" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="electoral360-title">
      <SectionHeader
        titleId="electoral360-title"
        eyebrow="Eleitoral 360°"
        title="Da fotografia ao perfil documental"
        description="Cada perfil usa uma única origem de snapshot. O observatório não mistura atributos de uma captura TSE com patrimônio ou escolaridade de um recorte editorial diferente."
      />

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
                {hasOfficialCandidateSnapshot
                  ? 'A captura oficial está disponível. Este perfil mostra somente atributos efetivamente carregados desse snapshot; campos não capturados permanecem vazios.'
                  : 'A captura TSE ainda não está sincronizada. O perfil abaixo usa apenas o recorte editorial local e não representa o universo completo de candidaturas.'}
              </p>
            </div>
            <FileText className="h-5 w-5 text-sky-300" aria-hidden="true" />
          </div>

          <div className="mb-3 mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-3 text-xs leading-5 text-slate-500">
            <strong className="text-amber-200">{hasOfficialCandidateSnapshot ? 'Fonte operacional: TSE' : 'Fonte operacional: recorte editorial local'}</strong>{' '}
            · estado do snapshot: {stateLabel[String(electoral360Diff.state)] ?? String(electoral360Diff.state)}. A ausência deste snapshot não equivale à ausência de candidaturas na fonte oficial.
          </div>

          <div className="mt-4 flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1" aria-label="Registros disponíveis para o perfil documental">
            {(hasOfficialCandidateSnapshot ? electoral360Snapshot.matchedCandidates : d.candidates).map(candidate => (
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
          ) : hasOfficialCandidateSnapshot && selectedOfficial ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Identidade" value={selectedOfficial.name} />
              <Info label="Situação" value={selectedOfficial.status || 'Não informado'} />
              <Info label="Partido" value={selectedOfficial.party || 'Não informado'} />
              <Info label="Número" value={String(selectedOfficial.ballotNumber || 'Não informado')} />
              <Info label="Cargo" value={selectedOfficial.office || 'Não informado'} />
              <Info label="Snapshot" value={selectedOfficial.snapshotDate} />
              <Info label="Ocupação" value="Não capturado nesta camada" />
              <Info label="Escolaridade / bens" value="Não capturados nesta camada" />
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
            <p className="mt-2 text-xs leading-5 text-slate-500">Cobertura do TSE e recorte editorial são mantidos separados.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">{electoral360Snapshot.localWatchlist.length} nomes no recorte</span>
              <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">identidade por SQ_CANDIDATO</span>
            </div>
          </Card>

          <Card>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Recorte operacional</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Este recorte serve para cruzamento com o universo de Goiás; não representa o universo completo e não deve ser lido como lista exaustiva.
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
            <h3 className="text-lg font-black text-white">{hasOfficialCandidateSnapshot ? 'Candidaturas capturadas' : 'Registros do recorte local'}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {hasOfficialCandidateSnapshot ? 'Pesquisa por identidade, nome, partido, cargo ou situação na captura TSE.' : 'O snapshot TSE ainda não foi sincronizado; os registros locais permanecem identificados como recorte editorial.'}
            </p>
          </div>
          <label className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-400 sm:w-auto">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Buscar candidatura</span>
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder={hasOfficialCandidateSnapshot ? 'Buscar candidatura...' : 'Filtrar recorte...'} className="w-full min-w-0 bg-transparent outline-none placeholder:text-slate-600 sm:w-56" />
          </label>
        </div>

        {hasOfficialCandidateSnapshot ? (
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
