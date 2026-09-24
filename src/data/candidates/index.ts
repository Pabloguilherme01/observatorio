import candidates from "../generated/candidates-public.json";

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

export const publicCandidates = candidates as PublicCandidate[];

export function searchCandidates(query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return publicCandidates;

  return publicCandidates.filter((candidate) =>
    [candidate.name, candidate.fullName, candidate.party, candidate.office]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)),
  );
}
