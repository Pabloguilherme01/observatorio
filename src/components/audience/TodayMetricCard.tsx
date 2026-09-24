import type { ReactNode } from 'react';

type TodayMetricCardProps = {
  label: string;
  value: string;
  description: string;
  action?: ReactNode;
  share?: ReactNode;
};

export function TodayMetricCard({ label, value, description, action, share }: TodayMetricCardProps) {
  return (
    <div className="today-card">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <strong className="mt-2 block text-2xl font-black text-white">{value}</strong>
      <span className="mt-1 block text-xs text-slate-500">{description}</span>
      {(action || share) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {action}
          {share}
        </div>
      )}
    </div>
  );
}
