import type { ReactNode } from 'react';

export function SectionHeader({ eyebrow, title, description, action }: { readonly eyebrow: string; readonly title: string; readonly description?: string; readonly action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/80">{eyebrow}</div>
        <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}