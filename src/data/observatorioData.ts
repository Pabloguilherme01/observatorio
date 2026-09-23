import type { ObservatoryData } from '../types/observatorio';
import { sourceRegistry } from './sourceRegistry';

/**
 * Snapshot inicial do V22, normalizado para o novo domínio React.
 * Correções metodológicas aplicadas na migração:
 * - densidade 2026 é derivada de 249.978 / 191,817 km²;
 * - tarifa Brasília segue o valor indicado no levantamento atual (R$ 11,43);
 * - abstenção de 2024 fica separada de votos brancos e nulos;
 * - margem de erro da pesquisa de 400 entrevistas é tratada como teórica,
 *   não como margem oficial, enquanto a ficha técnica não a informar.
 */
export const observatorioData: ObservatoryData = {
  meta: {
    name: 'Observatório Eleitoral Águas Lindas de Goiás 2026',
    edition: 'V22.1 • hardening, acessibilidade e UX',
    municipality: 'Águas Lindas de Goiás',
    timezone: 'America/Sao_Paulo',
    updatedAt: '2026-09-22',
  },
  sources: sourceRegistry,

  populationSeries: [
    { year: 2010, value: 159378, kind: 'census', referenceDate: '2010-08-01', sourceId: 'ibge-censo-2022' },
    { year: 2022, value: 225693, kind: 'census', referenceDate: '2022-08-01', sourceId: 'ibge-censo-2022' },
    { year: 2025, value: 245352, kind: 'estimate', referenceDate: '2025-07-01', sourceId: 'ibge-estimativas-2026' },
    { year: 2026, value: 249978, kind: 'estimate', referenceDate: '2026-07-01', sourceId: 'ibge-estimativas-2026' },
  ],

  electoral: {
    zone: '28ª Zona Eleitoral',
    electorate: 125062,
    snapshotDate: '2026-07-15',
    tseConsolidated: 125501,
    ageGroups: [
      { id: 'under24', label: 'Até 24 anos', voters: 24265, sharePct: 19.4 },
      { id: '25to59', label: '25–59 anos', voters: 86928, sharePct: 69.5 },
      { id: '60plus', label: '60 anos ou mais', voters: 13869, sharePct: 11.1 },
    ],
    womenPct: 52.98,
    menPct: 47.02,
    socialNameCount: 891,
    indigenousPopulation: 941,
    indigenousElectorate: 33,
    electorate2018: 95200,
    electorate2022: 107255,
    electorate2024: 121788,
    zoneVsTseDifference: 125501 - 125062,
    turnout2024Pct: 78.17,
    abstention2024Pct: 21.83,
    abstention2024Count: 26585,
    blankVotes2024Count: 3230,
    nullVotes2024Count: 2934,
    validVotes2024Count: 89039,
    sourceId: 'tse-eleitorado-2026',
  },

  polls: [
    {
      registrationNumber: 'GO-04133/2026',
      pollster: 'EXATA.GO Pesquisa Ltda.',
      contractor: 'HERZ Locadora de Motos Ltda.',
      collectionDate: '2026-08-25',
      interviews: 400,
      method: 'spontaneous',
      results: [
        { label: 'Keké', percentage: 35.25 },
        { label: 'Anderson Teodoro', percentage: 14.5 },
        { label: 'Zé da Imperial', percentage: 8.25 },
        { label: 'Baiano dos Cocos', percentage: 5.5 },
        { label: 'Cambão', percentage: 3.0 },
      ],
      nonePct: 15.5,
      notSurePct: 10.25,
      theoreticalMarginErrorPct: 4.9,
      sourceId: 'tse-eleicoes-2026',
      note: 'Os 4,9 pontos são aproximação teórica para amostra de 400; não substituem a ficha técnica oficial.',
    },
  ],

  candidates: [
    { name: 'Keké da Vulkanic', party: 'MOBILIZA', ballotNumber: 33777, status: 'Aguardando julgamento', occupation: 'Vendedor pracista / representante', education: 'Superior completo', declaredAssetsBrl: 270700, sourceId: 'tse-eleicoes-2026', snapshotDate: '2026-09-22' },
    { name: 'Anderson Teodoro', party: 'PRD', ballotNumber: 25789, status: 'Deferido', occupation: 'Vereador', education: 'Superior incompleto', declaredAssetsBrl: 990000, sourceId: 'tse-eleicoes-2026', snapshotDate: '2026-09-22' },
  ],

  transport: {
    routes: [
      { id: 'brasilia', label: 'Águas Lindas → Brasília / Plano Piloto', fareBrl: 11.43, regulator: 'Tabela publicada pela UTB', sourceId: 'utb-tarifas' },
      { id: 'taguatinga', label: 'Águas Lindas → Taguatinga', fareBrl: 7.65, regulator: 'ANTT / Taguatur', sourceId: 'antt-entorno-2026' },
      { id: 'ceilandia', label: 'Águas Lindas → Ceilândia', fareBrl: 5.85, regulator: 'ANTT / Taguatur', sourceId: 'antt-entorno-2026' },
    ],
    defaultWorkDaysPerMonth: 22,
    defaultTripsPerDay: 2,
    minimumWageBrl: 1621,
  },

  sanitation: {
    waterAccessPct: 95.8,
    publicSewerServicePct: 84.8,
    sewerCollectionPct: 60.1,
    sewerTreatmentOfGeneratedPct: 60.1,
    collectedSewerTreatedPct: 100,
    waterDistributionLossPct: 40.9,
    hydrometeringPct: 99.5,
    waterConsumptionLitersPerPersonDay: 104.1,
    averageWaterTariffBrlPerM3: 3.6,
    householdWasteCollectionPct: 99.8,
    sourceId: 'sinisa-2024',
    note: 'Os indicadores têm bases e denominadores distintos; não somar cobertura, coleta e tratamento como se fossem a mesma métrica.',
  },

  health: {
    hospitalName: 'Hospital Estadual de Águas Lindas Ronaldo Ramos Caiado Filho (HEAL)',
    openingReportedBeds: 164,
    currentStatedWardBeds: 32,
    currentStatedIcuBeds: 53,
    firstYearAttendancesAtLeast: 200000,
    openingInvestmentBrl: 157_000_000,
    plannedBeds: 298,
    sourceIds: ['healgo', 'healgo-200k'],
  },

  budget: {
    year: 2026,
    totalBrl: 771_255_334.51,
    sourceId: 'loa-2026',
    organizations: [
      { id: 'executivo', level: 'governmentBody', name: 'Poder Executivo', amountBrl: 209_032_766.95, sourceId: 'loa-2026' },
      { id: 'fundeb', level: 'governmentBody', name: 'FUNDEB', amountBrl: 175_000_000, sourceId: 'loa-2026' },
      { id: 'fms', level: 'governmentBody', name: 'Fundo Municipal de Saúde', amountBrl: 138_093_749.06, sourceId: 'loa-2026' },
      { id: 'funpreval', level: 'governmentBody', name: 'FUNPREVAL', amountBrl: 111_412_166.21, sourceId: 'loa-2026' },
      { id: 'fazenda', level: 'organizationalUnit', name: 'Secretaria de Fazenda', amountBrl: 74_920_109.86, sourceId: 'loa-2026' },
      { id: 'educacao', level: 'organizationalUnit', name: 'Educação', amountBrl: 70_469_752.28, sourceId: 'loa-2026' },
      { id: 'infra', level: 'organizationalUnit', name: 'Infraestrutura e Obras', amountBrl: 60_672_539.57, sourceId: 'loa-2026' },
    ],
    functions: [
      { id: 'educacao-f', level: 'function', name: 'Educação', amountBrl: 245_469_752.28, sourceId: 'loa-2026' },
      { id: 'saude-f', level: 'function', name: 'Saúde', amountBrl: 138_093_749.06, sourceId: 'loa-2026' },
      { id: 'administracao-f', level: 'function', name: 'Administração', amountBrl: 87_550_700, sourceId: 'loa-2026' },
      { id: 'urbanismo-f', level: 'function', name: 'Urbanismo', amountBrl: 55_116_400, sourceId: 'loa-2026' },
      { id: 'encargos-f', level: 'function', name: 'Encargos especiais', amountBrl: 65_469_900, sourceId: 'loa-2026' },
      { id: 'previdencia-f', level: 'function', name: 'Previdência', amountBrl: 35_002_000, sourceId: 'loa-2026' },
      { id: 'saneamento-f', level: 'function', name: 'Saneamento', amountBrl: 14_630_500, sourceId: 'loa-2026' },
    ],
  },

  indicators: [
    { id: 'population-2026', label: 'População 2026', value: 249978, unit: 'habitantes', status: 'current', referenceDate: '2026-07-01', sourceId: 'ibge-estimativas-2026' },
    { id: 'area', label: 'Área territorial', value: 191.817, unit: 'km²', status: 'current', sourceId: 'ibge-cidades-2026', referenceDate: '2025-01-01' },
    { id: 'density-2022', label: 'Densidade demográfica oficial', value: 1176.61, unit: 'hab/km²', status: 'historical', referenceDate: '2022-08-01', sourceId: 'ibge-censo-2022', note: 'Valor informado pelo IBGE para o Censo 2022.' },
    { id: 'density', label: 'Densidade 2026 (derivada)', value: 249978 / 191.817, unit: 'hab/km²', status: 'derived', referenceDate: '2026-07-01', sourceId: 'ibge-estimativas-2026', note: 'Estimativa de 2026 ÷ área territorial de 191,817 km²; não é o indicador oficial do Censo.' },
    { id: 'electorate', label: 'Eleitorado 2026', value: 125062, unit: 'eleitores', status: 'snapshot', referenceDate: '2026-07-15', sourceId: 'tse-eleitorado-2026' },
    { id: 'electorateShare', label: 'Razão eleitorado/população', value: (125062 / 249978) * 100, unit: '%', status: 'derived', sourceId: 'tse-eleitorado-2026', note: 'Razão estatística entre universos distintos; não é comparecimento.' },
    { id: 'fare', label: 'Tarifa Brasília', value: 11.43, unit: 'BRL/trecho', status: 'current', sourceId: 'utb-tarifas' },
    { id: 'budget', label: 'LOA 2026', value: 771255334.51, unit: 'BRL', status: 'current', sourceId: 'loa-2026' },
    { id: 'companies', label: 'Empresas ativas', value: 20096, unit: 'empresas', status: 'snapshot', sourceId: 'caged-sebrae-2026' },
    { id: 'cagedBalance', label: 'Saldo celetista até jul/2026', value: 762, unit: 'postos', status: 'snapshot', sourceId: 'caged-sebrae-2026' },
    { id: 'idebInitial', label: 'IDEB anos iniciais', value: 5.5, unit: 'pontos', status: 'historical', referenceDate: '2023-12-31', sourceId: 'inei-2023' },
    { id: 'idebFinal', label: 'IDEB anos finais', value: 4.9, unit: 'pontos', status: 'historical', referenceDate: '2023-12-31', sourceId: 'inei-2023' },
    { id: 'urbanized-area', label: 'Área urbanizada', value: 43.87, unit: 'km²', status: 'historical', referenceDate: '2019-01-01', sourceId: 'ibge-cidades-2026' },
    { id: 'street-arborization', label: 'Arborização de vias públicas', value: 54.66, unit: '%', status: 'historical', referenceDate: '2022-08-01', sourceId: 'ibge-cidades-2026' },
    { id: 'adequate-sewerage', label: 'Esgotamento sanitário adequado', value: 49.69, unit: '%', status: 'historical', referenceDate: '2022-08-01', sourceId: 'ibge-cidades-2026' },
    { id: 'formal-salary', label: 'Salário médio mensal formal', value: 1.9, unit: 'salários mínimos', status: 'historical', referenceDate: '2024-12-31', sourceId: 'ibge-cidades-2026' },
    { id: 'formal-workers', label: 'Pessoal ocupado', value: 22005, unit: 'pessoas', status: 'historical', referenceDate: '2024-12-31', sourceId: 'ibge-cidades-2026' },
    { id: 'homicideRate', label: 'Homicídios', value: 18.7, unit: 'por 100 mil', status: 'historical', sourceId: 'atlas-violencia-2026' },
    { id: 'schooling-6-14', label: 'Escolarização 6–14 anos', value: 98.1, unit: '%', status: 'historical', referenceDate: '2022-08-01', sourceId: 'ibge-cidades-2026' },
    { id: 'infant-mortality', label: 'Mortalidade infantil', value: 11.23, unit: 'óbitos por mil', status: 'current', referenceDate: '2025-01-01', sourceId: 'ibge-cidades-2026' },
    { id: 'revenue-2025', label: 'Receitas brutas realizadas 2025', value: 825112043.1, unit: 'BRL', status: 'historical', referenceDate: '2025-12-31', sourceId: 'ibge-cidades-2026' },
    { id: 'expenses-2025', label: 'Despesas brutas empenhadas 2025', value: 691558004.38, unit: 'BRL', status: 'historical', referenceDate: '2025-12-31', sourceId: 'ibge-cidades-2026' },
    { id: 'gdp-per-capita-2023', label: 'PIB per capita', value: 13567.92, unit: 'BRL', status: 'historical', referenceDate: '2023-12-31', sourceId: 'ibge-cidades-2026' },
    { id: 'sanitation-investment', label: 'Investimento em saneamento', value: 30004882.01, unit: 'BRL', status: 'historical', referenceDate: '2024-01-01', sourceId: 'sinisa-2024' },
    { id: 'sanitation-investment-per-capita', label: 'Investimento em saneamento per capita', value: 124.70, unit: 'BRL/pessoa', status: 'historical', referenceDate: '2024-01-01', sourceId: 'sinisa-2024' },
    { id: 'water-related-deaths', label: 'Óbitos por doenças relacionadas à água', value: 3, unit: 'óbitos', status: 'historical', referenceDate: '2024-01-01', sourceId: 'sinisa-2024' },
    { id: 'water-related-hospitalizations', label: 'Internações por doenças relacionadas à água', value: 427, unit: 'internações', status: 'historical', referenceDate: '2024-01-01', sourceId: 'sinisa-2024' },
    { id: 'companies-new', label: 'Empresas novas no recorte', value: 25848, unit: 'empresas', status: 'snapshot', referenceDate: '2026-01-01', sourceId: 'caged-sebrae-2026' },
  ],
};