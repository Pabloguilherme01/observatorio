import type { ReactNode } from 'react';

type ElectoralSummaryPanelProps = {
  title?: string;
  description?: string;
  children?: ReactNode;
};

export function ElectoralSummaryPanel({
  title = 'Eleições',
  description = 'Dados eleitorais do recorte local.',
  children,
}: ElectoralSummaryPanelProps) {
  return (
    <section
      aria-labelledby="electoral-summary-title"
      className="rounded-3xl border border-white/8 bg-white/[0.02] p-4 sm:p-5"
    >
      <div>
        <h3 id="electoral-summary-title" className="text-sm font-black text-white">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
