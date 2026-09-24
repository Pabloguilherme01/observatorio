import { ArrowRight } from 'lucide-react';

type Shortcut = readonly [string, string, string];

type Props = {
  shortcuts: readonly Shortcut[];
  onNavigate: (id: string) => void;
};

export function TechnicalShortcutGrid({ shortcuts, onNavigate }: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {shortcuts.map(([label, description, id]) => (
        <button
          key={label}
          type="button"
          onClick={() => onNavigate(id)}
          className="group rounded-2xl border border-white/8 bg-white/[0.02] p-3 text-left transition hover:border-sky-300/20"
        >
          <strong className="block text-sm text-white">{label}</strong>
          <span className="mt-1 block text-xs text-slate-500">{description}</span>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-sky-300/70">
            Abrir <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </span>
        </button>
      ))}
    </div>
  );
}
