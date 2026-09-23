import { Clock3, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';
import { formatDate } from '../../utils/formatters';

const VISIT_KEY = 'observatorio-last-visit-v32';

export function FreshnessBanner() {
  const [previousVisit, setPreviousVisit] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VISIT_KEY);
      setPreviousVisit(stored);
      window.localStorage.setItem(VISIT_KEY, d.meta.updatedAt);
    } catch {
      // Storage unavailable; the banner simply stays hidden.
    }
  }, []);

  const changed = Boolean(previousVisit && previousVisit !== d.meta.updatedAt);
  if (!changed) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-label="Atualização desde a última visita">
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
          <div>
            <strong className="block text-sm text-slate-100">O conjunto de dados foi atualizado desde sua última visita.</strong>
            <span className="text-xs text-slate-500">Sua última visita registrada foi em {formatDate(previousVisit!)} · atualização local atual em {formatDate(d.meta.updatedAt)}.</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> atualização local
        </span>
      </div>
    </section>
  );
}
