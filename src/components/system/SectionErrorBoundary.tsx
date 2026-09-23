import type { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

export function SectionErrorBoundary({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6" role="alert" aria-label={"Falha na seção " + label}>
          <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-200/80">Seção indisponível</div>
            <h2 className="mt-1 text-base font-black text-white">{label}</h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">Esta parte apresentou um erro e foi isolada para manter o restante do observatório disponível.</p>
          </div>
        </section>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
