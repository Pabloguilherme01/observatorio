import { Database, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { observatorioData as d } from '../../data/observatorioData';
import { electoral360Snapshot } from '../../data/electoral360';
import { formatCurrency } from '../../utils/formatters';

export function PoliticalResearch() {
  const hasGenerated = electoral360Snapshot.matchedCandidates.length > 0;
  const snapshotLabel = hasGenerated && electoral360Snapshot.capturedAt
    ? `snapshot local validado em ${new Date(electoral360Snapshot.capturedAt).toLocaleDateString('pt-BR')}`
    : 'recorte editorial local desta edição';
  const watchlistSize = electoral360Snapshot.localWatchlist.length;
  const candidates = hasGenerated
    ? electoral360Snapshot.matchedCandidates.map(candidate => ({
        name: candidate.name,
        party: candidate.party,
        ballotNumber: candidate.ballotNumber,
        status: candidate.status,
        occupation: undefined,
        education: undefined,
        declaredAssetsBrl: undefined,
        sourceId: candidate.sourceId,
        snapshotDate: candidate.snapshotDate,
      }))
    : d.candidates;

  return (
    <section id="candidaturas" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="research-title">
      <SectionHeader
        titleId="research-title"
        eyebrow="Pesquisa documental"
        title="Registros políticos acompanhados"
        description="Recorte documental descritivo. A camada local ainda não representa a lista completa de candidaturas; quando houver captura TSE validada, ela será identificada separadamente."
      />
      <div className="mb-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-4 text-xs leading-5 text-slate-400 light:border-amber-300/50 light:bg-amber-50 light:text-slate-600">
        <div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded-full border border-amber-300/20 bg-amber-300/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-200">{hasGenerated ? 'Captura TSE local · watchlist' : 'Recorte editorial · não é lista completa'}</span><span className="rounded-full border border-white/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{candidates.length} de {watchlistSize} registros da watchlist visíveis</span></div>
        <strong className="text-amber-200 light:text-amber-800">{hasGenerated ? 'Snapshot TSE local:' : 'Recorte editorial local:'}</strong> os registros abaixo correspondem ao {snapshotLabel}. <strong className="text-slate-200 light:text-slate-700">Este bloco não deve ser interpretado como a lista completa de candidaturas.</strong> A captura automatizada trabalha com uma watchlist. O TSE mantém o catálogo oficial separado do recorte desta interface.
      </div>
      <a href="https://dadosabertos.tse.jus.br/dataset/candidatos-2026" target="_blank" rel="noopener noreferrer" className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-300 hover:bg-white/5"><Database className="h-4 w-4 text-sky-300" aria-hidden="true" /> abrir base oficial de Candidatos 2026 <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
      <div className="grid gap-4 md:grid-cols-2">
        {candidates.map(candidate => {
          const sourceUrl = d.sources.find(source => source.id === candidate.sourceId)?.url;
          return (
          <Card key={candidate.name}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-white">{candidate.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{candidate.party ?? '—'} · {candidate.ballotNumber ?? '—'}</p>
              </div>
              <Badge tone="info">{candidate.status}</Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl border border-white/8 p-3">
                <span className="text-slate-500">Ocupação</span>
                <strong className="mt-1 block text-white">{candidate.occupation ?? 'Não capturado nesta camada'}</strong>
              </div>
              <div className="rounded-2xl border border-white/8 p-3">
                <span className="text-slate-500">Escolaridade</span>
                <strong className="mt-1 block text-white">{candidate.education ?? 'Não capturado nesta camada'}</strong>
              </div>
              <div className="rounded-2xl border border-white/8 p-3">
                <span className="text-slate-500">Bens declarados</span>
                <strong className="mt-1 block text-white">{candidate.declaredAssetsBrl != null ? formatCurrency(candidate.declaredAssetsBrl) : 'Não capturado nesta camada'}</strong>
              </div>
              <div className="rounded-2xl border border-white/8 p-3">
                <span className="text-slate-500">Snapshot</span>
                <strong className="mt-1 block text-white">{candidate.snapshotDate}</strong>
              </div>
            </div>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-sky-300"
              >
                Fonte da referência <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </Card>
          );
        })}
      </div>
    </section>
  );
}
