import generated from './generated/tse2026-candidates.json';
import type { Electoral360Module, Electoral360Snapshot } from '../types/electoral360';

const generatedData = generated as {
  meta: {
    snapshotId: string;
    downloadedAt: string | null;
    state: 'first_capture' | 'synced' | 'unchanged' | 'changed' | 'stale' | 'failed' | 'not_synced' | 'local_filter_pending';
  };
  coverage: 'watchlist' | 'municipality_required' | 'municipality' | 'state_watchlist';
  watchlist: string[];
  matched: Array<{
    sqCandidate: string;
    ballotNumber: number | null;
    name: string;
    party: string | null;
    office: string | null;
    status: string | null;
    municipality?: string | null;
    photoUrl?: string | null;
    instagramUrl?: string | null;
  }>;
  diff: {
    state: string;
    added: number;
    removed: number;
    changed: number;
    records: unknown[];
  };
};

const candidateStatus = ['first_capture', 'synced', 'unchanged', 'changed'].includes(generatedData.meta.state)
  ? ('captured' as const)
  : ('pending' as const);

const snapshotDate = generatedData.meta.downloadedAt ? generatedData.meta.downloadedAt.slice(0, 10) : '—';

export const electoral360Modules: readonly Electoral360Module[] = [
  {
    id: 'candidates',
    title: 'Candidaturas',
    description: 'A lista pública mostra candidaturas oficiais de Goiás dentro da watchlist monitorada no recorte editorial de Águas Lindas de Goiás. Isso não representa um universo municipal de candidaturas.',
    status: candidateStatus,
    frequency: 'conforme captura oficial',
    sourceId: 'tse-candidatos-2026',
    datasetUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
  },
  {
    id: 'electorate',
    title: 'Eleitorado',
    description: 'Perfil do eleitorado, locais de votação e seções eleitorais para o recorte municipal.',
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
    description: 'Prestação de contas, CNPJ de campanha e movimentações publicadas pelo TSE.',
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
  captureMode: generatedData.meta.state === 'not_synced' || generatedData.meta.state === 'local_filter_pending' ? 'static-local' : 'github-actions',
  candidateUniverseScope: 'GO',
  localWatchlist: generatedData.watchlist,
  matchedCandidates: generatedData.matched.map(candidate => ({
    sqCandidate: candidate.sqCandidate,
    ballotNumber: candidate.ballotNumber ?? 0,
    name: candidate.name,
    party: candidate.party ?? '—',
    office: candidate.office ?? '—',
    status: candidate.status ?? '—',
    municipality: candidate.municipality ?? null,
    photoUrl: candidate.photoUrl ?? null,
    instagramUrl: candidate.instagramUrl ?? null,
    snapshotDate,
    sourceId: 'tse-candidatos-2026',
  })),
};

export const electoral360Diff = generatedData.diff;
