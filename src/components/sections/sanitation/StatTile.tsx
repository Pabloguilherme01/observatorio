import type { ReactNode } from 'react';

interface StatTileProps {
  readonly value: ReactNode;
  readonly label: ReactNode;
  readonly valueClassName?: string;
  readonly labelClassName?: string;
  readonly borderTone?: 'default' | 'subtle';
}

export function StatTile({
  value,
  label,
  valueClassName = '',
  labelClassName = '',
  borderTone = 'default',
}: StatTileProps) {
  const borderClassName = borderTone === 'subtle' ? 'border-white/8' : 'border-white/10';

  return (
    <div className={'rounded-2xl border p-3 light:border-slate-200 ' + borderClassName}>
      <strong className={'block text-white light:text-slate-900 ' + valueClassName}>{value}</strong>
      <span className={'text-xs text-slate-500 ' + labelClassName}>{label}</span>
    </div>
  );
}
