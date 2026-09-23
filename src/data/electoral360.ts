import generated from './generated/tse2026-candidates.json';
import type { Electoral360Module, Electoral360Snapshot } from '../types/electoral360';
import { CANDIDATE_PROFILES, LOCAL_CANDIDATE_IDS } from './candidateProfiles';

const generatedData = generated as {
  meta: {
    snapshotId: string;
    downloadedAt: string | null;
    state: 'first_capture' | 'synced' | 'unchanged' | 'changed' | 'stale' | 'failed' | 'not_synced';
  };
  coverage: 'watchlist' | 'municipality';
  watchlist: string[];
  matched: Array<{
    sqCandidate: string;
    ballotNumber: number | null;
    name: string;
    party: string | null;
    office: string | null;
    status: string | null;
    municipality?: string;
    municipalityCodeTse?: string;
    municipalityCodeIbge?: string;
    photoUrl?: string | null;
    instagramUrl?: string | null;
    sourceResource?: string;
  }>;
  diff: {
    state: string;
    added: number;
    removed: number;
    changed: number;
    records: unknown[];
  };
};

const candidateStatus = (() => {
  switch (generatedData.meta.state) {
    case 'first_capture':
    case 'synced':
    case 'unchanged':
    case 'changed':
      return 'captured' as const;
    case 'stale':
      return 'pending' as const;
    case 'failed':
      return 'pending' as const;
    case 'not_synced':
    default:
      return 'pending' as const;
  }
})();
const snapshotDate = generatedData.meta.downloadedAt ? generatedData.meta.downloadedAt.slice(0, 10) : '—';

export const electoral360Modules: readonly Electoral360Module[] = [
  {
    id: 'candidates',
    title: 'Candidaturas',
    description: 'Cadastro, cargo, partido, situação, município e número. Quando a sincronização enriquecida roda, foto e Instagram vêm dos recursos oficiais do TSE; bens, histórico e propostas só aparecem quando ingeridos.'
    status: candidateStatus,
    frequency: 'conforme atualização da fonte',
    sourceId: 'tse-candidatos-2026',
    datasetUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
  },
  {
    id: 'electorate',
    title: 'Eleitorado',
    description: 'Perfil do eleitorado, locais de votação e seções eleitorais para o recorte municipal. Catálogo oficial identificado; snapshot eleitoral municipal segue como próxima ingestão.',
    status: 'cataloged',
    frequency: 'conforme base oficial',
    sourceId: 'tse-eleitorado-2026',
    datasetUrl: 'https://dadosabertos.tse.jus.br/dataset/eleitorado-2026',
  },
  {
    id: 'research',
    title: 'Pesquisas',
    description: 'Registros, contratantes, pagantes, questionários, notas fiscais e detalhamento de bairro/município.',
    status: 'cataloged',
    frequency: 'diária',
    sourceId: 'tse-pesquisas-2026',
    datasetUrl: 'https://dadosabertos.tse.jus.br/dataset/pesquisas-eleitorais-2026',
  },
  {
    id: 'accounts',
    title: 'Contas eleitorais',
    description: 'Prestação de contas, CNPJ de campanha e movimentações publicadas pelo TSE. A camada deve ser tratada como série temporal, não como valor único.',
    status: 'cataloged',
    frequency: 'conforme publicação',
    sourceId: 'tse-contas-2026',
    datasetUrl: 'https://dadosabertos.tse.jus.br/dataset/prestacao-de-contas-eleitorais-2026',
  },
  {
    id: 'pardal',
    title: 'Pardal',
    description: 'Denúncias registradas no sistema Pardal. Registro de denúncia não equivale a comprovação de irregularidade.',
    status: 'cataloged',
    frequency: 'diária',
    sourceId: 'tse-pardal-2026',
    datasetUrl: 'https://dadosabertos.tse.jus.br/dataset/denuncias-eleitorais',
  },
  {
    id: 'processual',
    title: 'Processual',
    description: 'Processos eleitorais, assuntos, decisões e recursos referentes ao pleito de 2026.',
    status: 'cataloged',
    frequency: 'conforme atualização da base',
    sourceId: 'tse-processual-2026',
    datasetUrl: 'https://dadosabertos.tse.jus.br/dataset/processual-2026',
  },
];

export const electoral360Snapshot: Electoral360Snapshot = {
  capturedAt: generatedData.meta.downloadedAt ?? '',
  captureMode: generatedData.meta.state === 'not_synced' ? 'static-local' : 'github-actions',
  candidateUniverseScope: 'GO',
  localWatchlist: generatedData.matched
    .filter(candidate => LOCAL_CANDIDATE_IDS.includes(candidate.sqCandidate as typeof LOCAL_CANDIDATE_IDS[number]))
    .map(candidate => candidate.name),
  matchedCandidates: generatedData.matched
    .filter(candidate => LOCAL_CANDIDATE_IDS.includes(candidate.sqCandidate as typeof LOCAL_CANDIDATE_IDS[number]))
    .map(candidate => ({
    sqCandidate: candidate.sqCandidate,
    ballotNumber: candidate.ballotNumber ?? 0,
    name: candidate.name,
    party: candidate.party ?? '—',
    office: candidate.office ?? '—',
    status: candidate.status ?? '—',
    snapshotDate,
    sourceId: 'tse-candidatos-2026',
    municipality: candidate.municipality,
    municipalityCodeTse: candidate.municipalityCodeTse,
    municipalityCodeIbge: candidate.municipalityCodeIbge,
    photoUrl: candidate.photoUrl,
    instagramUrl: candidate.instagramUrl,
    sourceResource: candidate.sourceResource,
    fullName: candidate.fullName,
    occupation: candidate.occupation,
    education: candidate.education,
    naturalidade: candidate.naturalidade,
    declaredAssetsBrl: candidate.declaredAssetsBrl,
  })),
};


export const electoral360Diff = generatedData.diff;
