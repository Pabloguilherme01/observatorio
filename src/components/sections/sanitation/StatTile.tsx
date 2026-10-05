import type { ReactNode } from 'react';

interface StatTileProps {
  readonly value: ReactNode;
  readonly label: ReactNode;
  readonly valueClassName?: string;
  readonly labelClassName?: string;
}

export function StatTile({
  value,
  label,
  valueClassName = '',
  labelClassName = '',
}: StatTileProps) {
  return (
    <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200">
      <strong className={'block text-white light:text-slate-900 ' + valueClassName}>{value}</strong>
      <span className={'text-xs text-slate-500 ' + labelClassName}>{label}</span>
    </div>
  );
}
