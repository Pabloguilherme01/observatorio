import type { ReactNode } from 'react';

export function Card({ children, className = '', id }: { readonly children: ReactNode; readonly className?: string; readonly id?: string }) {
  return (
    <div
      id={id}
      className={`obs-card rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-[0_16px_50px_rgba(0,0,0,.18)] backdrop-blur transition-[transform,border-color,box-shadow] duration-200 sm:p-5 hover:-translate-y-0.5 hover:border-sky-300/20 hover:shadow-[0_20px_60px_rgba(0,0,0,.22)] focus-within:border-sky-300/30 focus-within:ring-2 focus-within:ring-sky-300/20 active:scale-[0.995] ${className}`}
    >
      {children}
    </div>
  );
}
