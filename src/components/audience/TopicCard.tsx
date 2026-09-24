import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

type TopicCardProps = {
  label: string;
  description: string;
  icon: LucideIcon;
  onOpen: () => void;
};

export function TopicCard({ label, description, icon: Icon, onOpen }: TopicCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="topic-card group"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-300/10 text-sky-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="mt-3 block text-sm font-black text-white">{label}</span>
      <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      <span className="mt-auto flex items-center gap-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-sky-300/70">
        Abrir <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </button>
  );
}
