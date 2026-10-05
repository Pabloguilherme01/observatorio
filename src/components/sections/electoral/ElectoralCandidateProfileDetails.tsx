import { ExternalLink } from 'lucide-react';
import type { ElectoralCandidateSnapshot } from '../../../types/electoral360';

interface CandidateInfoProps {
  readonly label: string;
  readonly value: string;
}

function CandidateInfo({ label, value }: CandidateInfoProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold text-white light:text-slate-900">{value}</div>
    </div>
  );
}

interface ElectoralCandidateProfileDetailsProps {
  readonly candidate: ElectoralCandidateSnapshot;
}

export function ElectoralCandidateProfileDetails({ candidate }: ElectoralCandidateProfileDetailsProps) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <CandidateInfo label="Nome completo" value={candidate.fullName || candidate.name} />
      <CandidateInfo label="Nome de urna" value={candidate.name} />
      <CandidateInfo label="Partido" value={candidate.party || 'Não informado'} />
      <CandidateInfo label="Número" value={String(candidate.ballotNumber || 'Não informado')} />
      <CandidateInfo label="Cargo" value={candidate.office || 'Não informado'} />
      <CandidateInfo label="Ocupação" value={candidate.occupation || 'Não informado'} />
      <CandidateInfo label="Escolaridade" value={candidate.education || 'Não informado'} />
      <CandidateInfo label="Snapshot" value={candidate.snapshotDate} />
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 sm:col-span-2">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Mídia oficial</div>
        {candidate.photoAvailableInTseArchive ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/5 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
              Foto presente no arquivo TSE validado
            </span>
            {candidate.photoArchiveUrl && (
              <a
                href={candidate.photoArchiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:border-sky-300/30 hover:text-sky-200"
              >
                Abrir acervo oficial
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        ) : (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Não há foto validada para este registro no snapshot atual. O observatório não substitui a mídia por imagem de terceiros.
          </p>
        )}
      </div>
    </div>
  );
}
