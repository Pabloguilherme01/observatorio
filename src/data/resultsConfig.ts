export const RESULTS_FEED_URL = `${import.meta.env.BASE_URL}data/tse-results.json`;
export const RESULTS_FEED_SCHEMA_VERSION = 3;

export const RESULTS_WINDOW = {
  start: '2026-10-04T17:00:00-03:00',
  end: '2026-10-26T23:59:59-03:00',
  note: 'Janela pública de resultados; a preparação técnica do feed ocorre antes dela, sem exibir alerta de apuração ao visitante.',
} as const;

export const RESULTS_LIVE_MAX_AGE_MS = 15 * 60 * 1000;

export const OFFICIAL_RESULTS_CONTEXT = {
  environment: 'official',
  pleito: 3220,
  allowedElectionCodes: [6257, 6259, 6261],
  uf: 'GO',
  municipalityCode: '93343',
  municipalityName: 'Águas Lindas de Goiás',
  scope: 'municipality',
  host: 'resultados.tse.jus.br',
  jwsAlgorithm: 'EdDSA',
  jwsCurve: 'Ed25519',
  officialKeyKid: 'sNbt9Q_fLS65zE1_ZLNV-XRRwPY',
} as const;

export const SIMULATION_CONTEXT = {
  baseUrl: 'https://resultados-sim.tse.jus.br/simulado/simulado2026',
  environment: 'simulado2026',
  pleito: 17801,
  electionCodes: [21270, 21272, 21274],
  simulationDates: ['2026-09-22', '2026-09-23', '2026-09-24'],
  windowsBrt: ['09:00–12:00', '14:00–17:00'],
  docsUrl: 'https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados',
} as const;

export type ResultsCargo =
  | 'Presidente'
  | 'Governador'
  | 'Senador'
  | 'Deputado Federal'
  | 'Deputado Estadual'
  | 'Deputado Distrital';

export function electionCodeMatchesCargo(electionCode: number, uf: string, cargo: string, turn: 1 | 2 = 1): boolean {
  if (!Number.isSafeInteger(electionCode) || electionCode <= 0) return false;
  if (turn === 2 && [6257, 6259, 6261].includes(electionCode)) return false;
  const presidential = cargo === 'Presidente';
  const stateOffice = ['Governador', 'Senador', 'Deputado Federal', 'Deputado Estadual'].includes(cargo);
  const districtOffice = cargo === 'Deputado Distrital';
  if (turn === 2) return presidential || (uf === 'DF' ? districtOffice : stateOffice);
  if (electionCode === 6257) return presidential;
  if (electionCode === 6259) return uf !== 'DF' && stateOffice;
  if (electionCode === 6261) return uf === 'DF' && districtOffice;
  return false;
}

export function simulationElectionCodeMatches(cargo: string, electionCode: number): boolean {
  if (electionCode === 21270) return cargo === 'Presidente' || cargo === 'Deputado Federal';
  if (electionCode === 21272) return ['Governador', 'Senador', 'Deputado Estadual'].includes(cargo);
  if (electionCode === 21274) return cargo === 'Conselheiro Distrital';
  return false;
}
