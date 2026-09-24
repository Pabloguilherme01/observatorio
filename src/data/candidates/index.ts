import rawCandidates from "../generated/candidates-public.json";

type RawCandidate = {
  id?: string;
  name: string;
  fullName?: string;
  number?: number;
  ballotNumber?: number;
  party?: string;
  office?: string;
  status?: string;
  education?: string;
  occupation?: string;
  photoUrl?: string | null;
};

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
};

const candidateSource = rawCandidates as {
  schemaVersion?: number;
  source?: string;
  scope?: string;
  candidates?: RawCandidate[];
};

export const publicCandidateScope = candidateSource.scope ?? "Águas Lindas de Goiás";
export const publicCandidateSource = candidateSource.source ?? "Dados públicos";

export const publicCandidates: PublicCandidate[] = (candidateSource.candidates ?? []).map((candidate) => ({
  id: candidate.id,
  name: candidate.name,
  fullName: candidate.fullName,
  ballotNumber: candidate.ballotNumber ?? candidate.number,
  party: candidate.party,
  office: candidate.office,
  status: candidate.status,
  education: candidate.education,
  occupation: candidate.occupation,
  photoUrl: candidate.photoUrl ?? null,
}));

export function searchCandidates(query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return publicCandidates;

  return publicCandidates.filter((candidate) =>
    [candidate.name, candidate.fullName, candidate.party, candidate.office]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)),
  );
}
