export type ElectoralModuleStatus = 'captured' | 'cataloged' | 'pending';

export interface Electoral360Module {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: ElectoralModuleStatus;
  readonly frequency: string;
  readonly sourceId: string;
  readonly datasetUrl: string;
  readonly refreshUrl?: string;
}

export interface ElectoralCandidateSnapshot {
  readonly ballotNumber: number;
  readonly name: string;
  readonly party: string;
  readonly office: string;
  readonly status: string;
  readonly snapshotDate: string;
  readonly sourceId: string;
}

export interface Electoral360Snapshot {
  readonly capturedAt: string;
  readonly captureMode: 'static-local' | 'github-actions';
  readonly candidateUniverseScope: 'GO';
  readonly localWatchlist: readonly string[];
  readonly matchedCandidates: readonly ElectoralCandidateSnapshot[];
}

export const electoral360Modules: readonly Electoral360Module[] = [
  {
    id: 'candidates',
    title: 'Candidaturas',
    description: 'Cadastro, cargo, partido, situação, bens, redes, histórico e propostas. O snapshot automatizado filtra Goiás e cruza a lista local monitorada.',
    status: 'captured',
    frequency: '4x ao dia',
    sourceId: 'tse-candidatos-2026',
    datasetUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
  },
  {
    id: 'electorate',
    title: 'Eleitorado',
    description: 'Perfil do eleitorado, locais de votação e seções eleitorais para o recorte municipal.',
    status: 'captured',
    frequency: 'sob demanda',
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
    description: 'Prestação de contas de candidatos, CNPJ de campanha e extratos bancários.',
    status: 'cataloged',
    frequency: 'conforme geração do arquivo',
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
  capturedAt: '2026-09-22',
  captureMode: 'static-local',
  candidateUniverseScope: 'GO',
  localWatchlist: [
    'Keké',
    'Anderson Teodoro',
    'Zé da Imperial',
    'Baiano dos Cocos',
    'Cambão',
    'Abadyas Damasceno',
    'Pábio Mossoró',
    'Felipe Galdino',
    'Ribeiro do Túlio',
    'André do Premium',
  ],
  matchedCandidates: [
    {
      ballotNumber: 33777,
      name: 'Keké da Vulkanic',
      party: 'MOBILIZA',
      office: 'Deputado Estadual',
      status: 'Aguardando julgamento',
      snapshotDate: '2026-09-22',
      sourceId: 'tse-candidatos-2026',
    },
    {
      ballotNumber: 25789,
      name: 'Anderson Teodoro',
      party: 'PRD',
      office: 'Deputado Estadual',
      status: 'Deferido',
      snapshotDate: '2026-09-22',
      sourceId: 'tse-candidatos-2026',
    },
  ],
};
