import { Clock3, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';
import { formatDate } from '../../utils/formatters';
import { STORAGE_NAMESPACE } from '../../config/version';

const VISIT_KEY = `${STORAGE_NAMESPACE}-last-visit`;

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
  if (!changed || !previousVisit) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-label="Atualização desde a última visita">
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between light:border-emerald-200 light:bg-emerald-50/70">
        <div className="flex items-start gap-3">
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
          <div>
            <strong className="block text-sm text-slate-100 light:text-slate-900">O conjunto principal foi atualizado desde sua última visita.</strong>
            <span className="text-xs text-slate-500 light:text-slate-600">Na visita anterior, o painel indicava atualização em {formatDate(previousVisit)}. Agora indica {formatDate(d.meta.updatedAt)}. Cada indicador continua com sua própria data de referência.</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> painel atualizado
        </span>
      </div>
    </section>
  );
}
