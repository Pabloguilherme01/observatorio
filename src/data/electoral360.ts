import generated from './generated/tse2026-candidates.json';
import type { ElectoralCandidateSnapshot, Electoral360Module, Electoral360Snapshot } from '../types/electoral360';

const generatedData = generated as {
  meta: {
    snapshotId: string;
    downloadedAt: string;
    state: 'first_capture' | 'synced' | 'unchanged' | 'changed' | 'stale' | 'failed' | 'not_synced';
  };
  watchlist: string[];
  matched: Array<{
    sqCandidate: string;
    ballotNumber: number | null;
    name: string;
    party: string | null;
    office: string | null;
    status: string | null;
  }>;
  diff: {
    state: string;
    added: number;
    removed: number;
    changed: number;
    records: unknown[];
  };
};

const candidateStatus = generatedData.meta.state === 'not_synced' ? 'pending' : 'captured';

export const electoral360Modules: readonly Electoral360Module[] = [
  {
    id: 'candidates',
    title: 'Candidaturas',
    description: 'Cadastro, cargo, partido, situação, bens, redes, histórico e propostas. O recorte automatizado utiliza identidade SQ_CANDIDATO e preserva o manifesto do snapshot.',
    status: candidateStatus,
    frequency: '4x ao dia',
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
    datasetUrl: 'https://dadosabertos.tse.jus.br/dataset/groups/eleitorado-2026',
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
    datasetUrl: 'https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/tse-disponibiliza-dados-da-prestacao-de-contas-parcial-das-campanhas-eleitorais',
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
  capturedAt: generatedData.meta.downloadedAt,
  captureMode: generatedData.meta.state === 'not_synced' ? 'static-local' : 'github-actions',
  candidateUniverseScope: 'GO',
  localWatchlist: generatedData.watchlist,
  matchedCandidates: generatedData.matched.map(candidate => ({
    sqCandidate: candidate.sqCandidate,
    ballotNumber: candidate.ballotNumber ?? 0,
    name: candidate.name,
    party: candidate.party ?? '—',
    office: candidate.office ?? '—',
    status: candidate.status ?? '—',
    snapshotDate: generatedData.meta.downloadedAt.slice(0, 10),
    sourceId: 'tse-candidatos-2026',
  })),
};

export const electoral360Diff = generatedData.diff;
