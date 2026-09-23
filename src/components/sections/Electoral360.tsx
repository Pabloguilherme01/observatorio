import { CheckCircle2, Database, ExternalLink, RefreshCw, ShieldAlert } from 'lucide-react';
import { electoral360Modules, electoral360Snapshot } from '../../data/electoral360';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const statusLabel = {
  captured: 'Capturado',
  cataloged: 'Catalogado',
  pending: 'Pendente',
} as const;

export function Electoral360() {
  const captured = electoral360Modules.filter(module => module.status === 'captured').length;
  const cataloged = electoral360Modules.filter(module => module.status === 'cataloged').length;
  const candidateSource = d.sources.find(source => source.id === 'tse-candidatos-2026');

  return (
    <section id="eleitoral360" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="electoral360-title">
      <SectionHeader
        titleId="electoral360-title"
        eyebrow="Eleitoral 360°"
        title="Da fotografia ao histórico verificável"
        description="Camada de dados eleitorais separada do restante do observatório: cada módulo informa o que já foi capturado, o que está apenas catalogado e qual fonte oficial deve ser usada na próxima sincronização."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{captured}</div>
          <div className="text-xs text-slate-500">módulos com snapshot local</div>
        </Card>
        <Card>
          <Database className="h-5 w-5 text-sky-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{cataloged}</div>
          <div className="text-xs text-slate-500">módulos prontos para ingestão</div>
        </Card>
        <Card>
          <RefreshCw className="h-5 w-5 text-violet-300" aria-hidden="true" />
          <div className="mt-3 text-lg font-black text-white">{electoral360Snapshot.capturedAt}</div>
          <div className="text-xs text-slate-500">último snapshot local de candidaturas</div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white">Pipeline de fontes TSE 2026</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">A existência de uma base no catálogo não significa que seus registros já foram incorporados ao snapshot municipal.</p>
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
              Recorte local
            </div>
            <div className="mt-3 text-3xl font-black text-white">{electoral360Snapshot.localWatchlist.length}</div>
            <p className="mt-1 text-xs leading-5 text-slate-500">nomes monitorados para cruzamento com o universo de candidaturas de Goiás.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {electoral360Snapshot.localWatchlist.map(name => (
                <span key={name} className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">{name}</span>
              ))}
            </div>
          </Card>

          <Card>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Correspondências verificadas</div>
            <div className="mt-3 space-y-3">
              {electoral360Snapshot.matchedCandidates.map(candidate => (
                <div key={candidate.ballotNumber} className="rounded-2xl border border-white/8 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm text-white">{candidate.name}</strong>
                    <span className="text-xs font-bold text-slate-500">{candidate.ballotNumber}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{candidate.party} · {candidate.office} · {candidate.status}</p>
                </div>
              ))}
            </div>
            {candidateSource?.url && (
              <a href={candidateSource.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                Ver catálogo TSE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
