import { useMemo, useState } from 'react';
import { CheckCircle2, Database, ExternalLink, History, Search, ShieldAlert, UserRound } from 'lucide-react';
import { electoral360Diff, electoral360Modules, electoral360Snapshot } from '../../data/electoral360';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const statusLabel = {
  captured: 'Capturado',
  cataloged: 'Catalogado',
  pending: 'Pendente',
} as const;

const stateLabel: Record<string, string> = {
  first_capture: 'Primeiro snapshot',
  synced: 'Sincronizado',
  unchanged: 'Sem alterações',
  changed: 'Dados alterados',
  stale: 'Desatualizado',
  failed: 'Falha na sincronização',
  not_synced: 'Ainda não sincronizado',
};

export function Electoral360() {
  const [query, setQuery] = useState('');
  const captured = electoral360Modules.filter(module => module.status === 'captured').length;
  const cataloged = electoral360Modules.filter(module => module.status === 'cataloged').length;
  const candidateSource = d.sources.find(source => source.id === 'tse-candidatos-2026');

  const candidates = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    if (!normalized) return electoral360Snapshot.matchedCandidates;
    return electoral360Snapshot.matchedCandidates.filter(candidate =>
      [candidate.name, candidate.party, candidate.office, candidate.status, candidate.ballotNumber]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(normalized),
    );
  }, [query]);

  return (
    <section id="eleitoral360" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="electoral360-title">
      <SectionHeader
        titleId="electoral360-title"
        eyebrow="Eleitoral 360°"
        title="Da fotografia ao histórico verificável"
        description="Camada eleitoral orientada por snapshots: fonte, identidade, data, alterações e estado da sincronização ficam separados da interpretação política."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{captured}</div>
          <div className="text-xs text-slate-500">módulos capturados</div>
        </Card>
        <Card>
          <Database className="h-5 w-5 text-sky-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{cataloged}</div>
          <div className="text-xs text-slate-500">módulos catalogados</div>
        </Card>
        <Card>
          <History className="h-5 w-5 text-violet-300" aria-hidden="true" />
          <div className="mt-3 text-sm font-black text-white">{stateLabel[String(electoral360Diff.state)] ?? String(electoral360Diff.state)}</div>
          <div className="mt-1 text-xs text-slate-500">{electoral360Diff.added} novos · {electoral360Diff.changed} alterados · {electoral360Diff.removed} removidos</div>
        </Card>
        <Card>
          <UserRound className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{electoral360Snapshot.matchedCandidates.length}</div>
          <div className="text-xs text-slate-500">correspondências no snapshot</div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white">Pipeline TSE 2026</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">Catálogo oficial e ingestão local são estados diferentes. Um módulo catalogado não é apresentado como dado já capturado.</p>
            </div>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">auditável</span>
          </div>
          <div className="mt-5 space-y-3">
            {electoral360Modules.map(module => (
              <div key={module.id} className="rounded-2xl border border-white/8 p-4 light:border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-300" aria-hidden="true" />
                    <strong className="text-sm text-white light:text-slate-900">{module.title}</strong>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-500">{statusLabel[module.status]}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-slate-500">{module.frequency}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{module.description}</p>
                <a href={module.datasetUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300 hover:text-sky-200">
                  Abrir fonte oficial <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <ShieldAlert className="h-4 w-4 text-amber-300" aria-hidden="true" />
              Estado do snapshot
            </div>
            <div className="mt-3 text-lg font-black text-white">{stateLabel[String(electoral360Diff.state)] ?? String(electoral360Diff.state)}</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Última captura: {electoral360Snapshot.capturedAt.slice(0, 10)}. A interface não trata ausência de snapshot como ausência de candidatos.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">{electoral360Snapshot.localWatchlist.length} nomes monitorados</span>
              <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">identidade por SQ_CANDIDATO</span>
            </div>
          </Card>

          <Card>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Recorte local</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">A watchlist é apenas um recorte operacional para cruzamento com o universo de Goiás; não representa o universo completo de candidaturas.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {electoral360Snapshot.localWatchlist.map(name => (
                <span key={name} className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">{name}</span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-white">Candidaturas capturadas</h3>
            <p className="mt-1 text-xs text-slate-500">Pesquisa documental por identidade, nome, partido, cargo ou situação.</p>
          </div>
          <label className="flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-400">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Buscar candidatura</span>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar..." className="w-full bg-transparent outline-none placeholder:text-slate-600 sm:w-48" />
          </label>
        </div>

        {electoral360Snapshot.matchedCandidates.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">
            O snapshot TSE ainda não foi sincronizado. Isso não significa que não existam correspondências; significa apenas que esta camada ainda não possui captura local validada.
          </div>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {candidates.map(candidate => (
              <article key={candidate.sqCandidate} className="rounded-2xl border border-white/8 p-4 light:border-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-black text-white light:text-slate-900">{candidate.name}</h4>
                    <p className="mt-1 text-xs text-slate-500">{candidate.party} · {candidate.office} · nº {candidate.ballotNumber}</p>
                  </div>
                  <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-500">{candidate.status}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-white/8 p-3"><span className="text-slate-500">SQ_CANDIDATO</span><strong className="mt-1 block text-white">{candidate.sqCandidate}</strong></div>
                  <div className="rounded-xl border border-white/8 p-3"><span className="text-slate-500">Snapshot</span><strong className="mt-1 block text-white">{candidate.snapshotDate}</strong></div>
                </div>
              </article>
            ))}
          </div>
        )}

        {candidateSource?.url && (
          <a href={candidateSource.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300">
            Ver catálogo oficial do TSE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </Card>
    </section>
  );
}
