import type { ReactNode } from 'react';

export function SectionHeader({ eyebrow, title, description, action, titleId }: { readonly eyebrow: string; readonly title: string; readonly description?: string; readonly action?: ReactNode; readonly titleId?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:mb-7 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300/80 sm:text-[11px]">{eyebrow}</div>
        <h2 id={titleId} className="text-xl font-black leading-tight tracking-tight text-white sm:text-2xl md:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}