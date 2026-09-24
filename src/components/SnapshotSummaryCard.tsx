export function SnapshotSummaryCard() {
  return (
    <section id="snapshot-tse" className="mx-auto max-w-7xl px-4 pb-10 sm:px-6" aria-labelledby="snapshot-title">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Snapshot oficial TSE</div>
        <h2 id="snapshot-title" className="mt-2 text-2xl font-black text-white">Estado da captura eleitoral</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          A origem oficial é mantida separada da validação municipal. Um registro estadual só aparece como dado local quando existe comprovação do município.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="text-xs text-slate-500">Status</span>
            <strong className="mt-1 block text-white">Validação municipal</strong>
            <p className="mt-1 text-sm text-amber-300">Em conferência</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="text-xs text-slate-500">Origem</span>
            <strong className="mt-1 block text-white">Dados oficiais TSE</strong>
            <p className="mt-1 text-sm text-slate-400">Fonte preservada</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="text-xs text-slate-500">Leitura</span>
            <strong className="mt-1 block text-white">Sem inferência</strong>
            <p className="mt-1 text-sm text-slate-400">Recorte e limite identificados</p>
          </div>
        </div>
      </div>
    </section>
  );
}
