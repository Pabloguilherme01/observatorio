import type { ReactNode } from 'react';

type SummaryTodayCardProps = {
  label: string;
  value: string;
  description: string;
  action: string;
  href: string;
  extra?: ReactNode;
};

export function SummaryTodayCard({
  label,
  value,
  description,
  action,
  href,
  extra,
}: SummaryTodayCardProps) {
  return (
    <article className="today-card flex min-h-[230px] flex-col">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <strong className="mt-2 block text-2xl font-black text-white">{value}</strong>
      <span className="mt-1 block text-xs text-slate-500">{description}</span>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <a
          href={href}
          className="inline-flex min-h-10 items-center rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950 transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
        >
          {action}
        </a>
        {extra}
      </div>
    </article>
  );
}
