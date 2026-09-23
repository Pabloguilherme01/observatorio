import type { ReactNode } from 'react';

export function Card({ children, className = '', id }: { readonly children: ReactNode; readonly className?: string; readonly id?: string }) {
  return <div id={id} className={`rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_16px_50px_rgba(0,0,0,.18)] backdrop-blur ${className}`}>{children}</div>;
}
