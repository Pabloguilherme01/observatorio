export const RESULTS_FEED_URL = '/observatorio/data/tse-results.json';

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
  scope: 'municipality',
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

export function electionCodeMatchesCargo(electionCode: number, uf: string, cargo: string): boolean {
  if (electionCode === 6257) return cargo === 'Presidente';
  if (electionCode === 6259) return uf !== 'DF' && cargo !== 'Presidente' && cargo !== 'Deputado Distrital';
  if (electionCode === 6261) return uf === 'DF' && cargo === 'Deputado Distrital';
  return false;
}

export function simulationElectionCodeMatches(cargo: string, electionCode: number): boolean {
  if (electionCode === 21270) return cargo === 'Presidente' || cargo === 'Deputado Federal';
  if (electionCode === 21272) return ['Governador', 'Senador', 'Deputado Estadual'].includes(cargo);
  if (electionCode === 21274) return cargo === 'Conselheiro Distrital';
  return false;
}
