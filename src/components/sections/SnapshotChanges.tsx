import { Activity, ArrowDownRight, ArrowUpRight, Database, ExternalLink, Minus } from 'lucide-react';
import generated from '../../data/generated/tse2026-candidates.json';
import { PremiumInfoCard } from '../ui/PremiumInfoCard';

export function SnapshotChanges() {
  const diff = generated.diff;
  const hasChanges = diff.added + diff.removed + diff.changed > 0;
  return (
    <section id="mudancas-snapshot" className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="changes-title">
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300/80">
              <Activity className="h-3.5 w-3.5" aria-hidden="true" /> Histórico de snapshots
            </div>
            <h2 id="changes-title" className="mt-2 text-2xl font-black tracking-tight text-white">O que mudou?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Este painel mostra apenas diferenças que o snapshot local consegue sustentar. Sem uma primeira captura TSE validada, a interface deixa isso explícito em vez de preencher a lacuna com inferências.
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{generated.meta.state}</span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric icon={ArrowUpRight} label="Adicionados" value={diff.added} />
          <Metric icon={ArrowDownRight} label="Removidos" value={diff.removed} />
          <Metric icon={Activity} label="Alterados" value={diff.changed} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Captura local</div>
            <strong className="mt-2 block text-sm text-white">
              {generated.meta.downloadedAt
                ? new Date(generated.meta.downloadedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                : 'Não registrada'}
            </strong>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {generated.meta.matchedRows} registros da watchlist encontrados em {generated.meta.sourceRows} registros processados.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Cobertura</div>
            <strong className="mt-2 block text-sm text-white">Recorte editorial · watchlist</strong>
            <p className="mt-1 text-xs leading-5 text-slate-500">Não representa o universo completo de candidaturas. A base oficial permanece disponível no TSE.</p>
            <a href={generated.meta.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-sky-300">
              Abrir fonte oficial <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="premium-info-grid mt-4">
          <PremiumInfoCard
            compact
            tone={hasChanges ? 'amber' : 'slate'}
            icon={hasChanges ? Activity : Minus}
            eyebrow="Leitura do snapshot"
            title={generated.meta.state === 'first_capture' ? 'Linha de base local registrada' : hasChanges ? 'Há diferenças no snapshot atual' : 'Sem diferença declarada'}
          >
            {generated.meta.state === 'first_capture'
              ? 'Esta é a primeira captura validada da watchlist. Os registros adicionados formam a linha de base local; não representam uma comparação temporal entre duas capturas.'
              : hasChanges
                ? 'Existem diferenças no snapshot atual. Abra o Eleitoral 360° para consultar os registros afetados.'
                : generated.meta.state === 'not_synced'
                  ? 'Nenhuma comparação é declarada antes da primeira captura TSE validada.'
                  : 'Nenhuma alteração registrada entre os snapshots comparados.'}
          </PremiumInfoCard>
          <PremiumInfoCard compact tone="violet" icon={Database} eyebrow="Proveniência" title="Snapshot identificado e rastreável">
            {generated.meta.source} · {generated.meta.scope} · {generated.meta.snapshotId}
          </PremiumInfoCard>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { readonly icon: typeof Activity; readonly label: string; readonly value: number }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
    <Icon className="h-4 w-4 text-sky-300" aria-hidden="true" />
    <strong className="mt-3 block text-3xl font-black text-white">{value}</strong>
    <span className="text-xs text-slate-500">{label}</span>
  </div>;
}
