import type { ElectoralCandidateSnapshot } from '../../../types/electoral360';

interface ElectoralCandidateCardProps {
  readonly candidate: ElectoralCandidateSnapshot;
  readonly onSelect: (name: string) => void;
}

export function ElectoralCandidateCard({ candidate, onSelect }: ElectoralCandidateCardProps) {
  return (
    <article className="rounded-2xl border border-white/8 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-black text-white light:text-slate-900 break-words">{candidate.name}</h4>
          <p className="mt-1 text-xs text-slate-500 break-words">{candidate.party} · {candidate.office} · nº {candidate.ballotNumber}</p>
          <span className="mt-2 inline-flex max-w-full items-center rounded-full border border-white/8 px-2 py-1 text-[10px] font-semibold text-slate-500 break-words">{candidate.status || 'situação não informada'}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onSelect(candidate.name)}
        className="electoral-action-button mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-sky-300/15 bg-sky-300/[0.04] px-3 py-2 text-xs font-black text-sky-100"
      >
        Ver perfil
      </button>
    </article>
  );
}
