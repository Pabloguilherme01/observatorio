import rawCandidates from "../generated/candidates-public.json";

export type PublicCandidate = {
  id?: string;
  name: string;
  fullName?: string;
  ballotNumber?: number;
  party?: string;
  office?: string;
  status?: string;
  education?: string;
  occupation?: string;
  photoUrl?: string | null;
  socials?: string[];
  declaredAssetsTotal?: number;
  localEvidence?: string;
  sourceUrls?: string[];
};

type CandidateDataset = {
  schemaVersion?: number;
  source?: string;
  scope?: string;
  snapshotId?: string;
  selection?: string;
  methodology?: { note?: string; officialDataset?: string; checkedAt?: string };
  candidates?: PublicCandidate[];
};

const candidateSource = rawCandidates as CandidateDataset;

export const publicCandidateScope = candidateSource.scope ?? "Águas Lindas de Goiás";
export const publicCandidateSource = candidateSource.source ?? "Dados públicos";
export const publicCandidateMethodology = candidateSource.methodology;
export const publicCandidates: PublicCandidate[] = candidateSource.candidates ?? [];

export function searchCandidates(query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return publicCandidates;

  return publicCandidates.filter((candidate) =>
    [candidate.name, candidate.fullName, candidate.party, candidate.office, candidate.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)),
  );
}
