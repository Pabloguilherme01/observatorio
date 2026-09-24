import generatedCandidates from './generated/tse2026-candidates.json';

export interface PublicCandidate {
  readonly id: string;
  readonly name: string;
  readonly party?: string;
  readonly ballotNumber?: number;
  readonly office?: string;
  readonly status?: string;
  readonly fullName?: string;
  readonly declaredAssetsTotal?: number;
  readonly gender?: string;
  readonly education?: string;
  readonly occupation?: string;
  readonly photoUrl?: string;
  readonly socials?: readonly string[];
  readonly sourceUrls?: readonly string[];
  readonly localEvidence?: string;
  readonly evidenceSourceUrls?: readonly string[];
  readonly sourceResource?: string;
}

export const publicCandidateSource = 'TSE — Candidatos 2026';
export const publicCandidateScope = 'Candidaturas estaduais presentes no snapshot público utilizado pelo Observatório; vínculo local é tratado separadamente e não é inferido do cadastro do TSE.';

export const publicCandidateMethodology = {
  checkedAt: generatedCandidates.meta.downloadedAt?.slice(0, 10) ?? 'data não informada',
};

export const publicCandidates: readonly PublicCandidate[] = Array.from(new Map(generatedCandidates.matched.map(candidate => [candidate.sqCandidate, candidate])).values()).map(candidate => ({
  id: candidate.sqCandidate,
  name: candidate.name,
  party: candidate.party ?? undefined,
  ballotNumber: candidate.ballotNumber ?? undefined,
  office: candidate.office ?? undefined,
  status: candidate.status ?? undefined,
  fullName: candidate.fullName ?? undefined,
  photoUrl: candidate.photoUrl ?? undefined,
  gender: candidate.gender ?? undefined,
  education: candidate.education ?? undefined,
  occupation: candidate.occupation ?? undefined,
  declaredAssetsTotal: candidate.declaredAssetsTotal ?? undefined,
  socials: candidate.instagramUrl ? [candidate.instagramUrl] : undefined,
  sourceUrls: Array.from(new Set([generatedCandidates.meta.sourceUrl, candidate.sourceResource, ...(candidate.evidenceSourceUrls ?? [])].filter(Boolean))),
  localEvidence: candidate.localEvidence ?? undefined,
  evidenceSourceUrls: candidate.evidenceSourceUrls ?? undefined,
})).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

export function searchCandidates(query: string): readonly PublicCandidate[] {
  const normalized = query.trim().toLocaleLowerCase('pt-BR');
  if (!normalized) return publicCandidates;
  return publicCandidates.filter(candidate =>
    [candidate.name, candidate.fullName, candidate.party, candidate.office, candidate.ballotNumber?.toString()]
      .filter(Boolean)
      .some(value => value!.toLocaleLowerCase('pt-BR').includes(normalized)),
  );
}
