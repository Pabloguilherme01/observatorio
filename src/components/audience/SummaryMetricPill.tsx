type SummaryMetricPillProps = {
  label: string;
  value: string;
  helper?: string;
};

export function SummaryMetricPill({ label, value, helper }: SummaryMetricPillProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-sky-300/20">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <strong className="mt-1 block text-lg font-black text-white">{value}</strong>
      {helper && <span className="mt-1 block text-xs text-slate-500">{helper}</span>}
    </div>
  );
}
