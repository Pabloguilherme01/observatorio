import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly id?: string;
} & Pick<HTMLAttributes<HTMLDivElement>, 'aria-label' | 'aria-labelledby' | 'role'>;

export function Card({ children, className = '', id, ...accessibilityProps }: CardProps) {
  return (
    <div
      id={id}
      className={`obs-card min-w-0 max-w-full overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_14px_40px_rgba(0,0,0,.16)] backdrop-blur light:border-slate-200 light:bg-white light:shadow-[0_12px_32px_rgba(15,23,42,.07)] ${className}`}
      {...accessibilityProps}
    >
      {children}
    </div>
  );
}
