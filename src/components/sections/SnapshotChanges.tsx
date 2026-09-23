import { Activity, ArrowDownRight, ArrowUpRight, Database, Minus } from 'lucide-react';
import generated from '../../data/generated/tse2026-candidates.json';

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
              A camada de diferenças compara registros por <code>SQ_CANDIDATO</code>. Enquanto a primeira captura validada não existir, o painel permanece explicitamente como não sincronizado.
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{generated.meta.state}</span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric icon={ArrowUpRight} label="Adicionados" value={diff.added} />
          <Metric icon={ArrowDownRight} label="Removidos" value={diff.removed} />
          <Metric icon={Activity} label="Alterados" value={diff.changed} />
        </div>
        <div className="mt-5 rounded-2xl border border-white/8 bg-black/10 p-4">
          {hasChanges ? (
            <div className="text-sm text-slate-300">Existem diferenças no snapshot atual. Abra o Eleitoral 360° para consultar os registros afetados.</div>
          ) : (
            <div className="flex items-start gap-3 text-xs leading-5 text-slate-500">
              <Minus className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{generated.meta.state === 'not_synced' ? 'Nenhuma comparação é declarada antes da primeira captura TSE validada.' : 'Nenhuma alteração registrada entre os snapshots comparados.'}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          <Database className="h-3.5 w-3.5" aria-hidden="true" /> {generated.meta.source} · {generated.meta.scope} · {generated.meta.snapshotId}
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
