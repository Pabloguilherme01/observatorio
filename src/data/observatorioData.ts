import type { ObservatoryData } from '../types/observatorio.js';
import { sourceRegistry } from './sourceRegistry.js';
import { EDITION } from '../config/version.js';
const TRANSPORT_FARES_BRL = {
  brasilia: 11.45,
  taguatinga: 7.65,
  ceilandia: 5.85,
} as const;

const MINIMUM_WAGE_2026_BRL = 1621;

/**
 * Dataset municipal V46, normalizado para o domínio React.
 * Correções metodológicas aplicadas na migração:
 * - densidade 2026 é derivada de 249.978 / 191,817 km²;
 * - tarifa Brasília usa a tarifa atual publicada pela UTB (R$ 11,45);
 */
export const observatorioData: ObservatoryData = {
  meta: {
    name: 'Observatório Público de Águas Lindas de Goiás',
    edition: `${EDITION} • leitura pública + investigação + evidências`,
    municipality: 'Águas Lindas de Goiás',
    timezone: 'America/Sao_Paulo',
    updatedAt: '2026-10-05',
  },
  sources: sourceRegistry,

  populationSeries: [
    { year: 2010, value: 159378, kind: 'census', referenceDate: '2010-08-01', sourceId: 'ibge-censo-2022' },
    { year: 2022, value: 225693, kind: 'census', referenceDate: '2022-08-01', sourceId: 'ibge-censo-2022' },
    { year: 2025, value: 245352, kind: 'estimate', referenceDate: '2025-07-01', sourceId: 'ibge-estimativas-2026' },
    { year: 2026, value: 249978, kind: 'estimate', referenceDate: '2026-07-01', sourceId: 'ibge-estimativas-2026' },
  ],

  transport: {
    routes: [
      { id: 'brasilia', label: 'Águas Lindas → Brasília / Plano Piloto', fareBrl: TRANSPORT_FARES_BRL.brasilia, regulator: 'Tabela publicada pela UTB', sourceId: 'utb-tarifas' },
      { id: 'taguatinga', label: 'Águas Lindas → Taguatinga', fareBrl: TRANSPORT_FARES_BRL.taguatinga, regulator: 'ANTT / Taguatur', sourceId: 'antt-entorno-2026' },
      { id: 'ceilandia', label: 'Águas Lindas → Ceilândia', fareBrl: TRANSPORT_FARES_BRL.ceilandia, regulator: 'ANTT / Taguatur', sourceId: 'antt-entorno-2026' },
    ],
    defaultWorkDaysPerMonth: 22,
    defaultTripsPerDay: 2,
    minimumWageBrl: MINIMUM_WAGE_2026_BRL,
    minimumWageYear: 2026,
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

  education: {
    ideb2025Range: [5.7, 6.2],
    basicEducationEnrollments2025: 58138,
    municipalBasicEducationEnrollments2025: 23847,
    technicalEptEnrollments2025: 493,
    sourceId: 'qedu-ideb-2025',
    note: 'A faixa 5,7–6,2 é a referência secundária registrada no levantamento de origem (QEdu). O INEP confirma a publicação dos resultados de 2025, mas o valor municipal pontual de Águas Lindas ainda não foi materializado neste snapshot; a faixa não deve ser apresentada como nota municipal oficial.',
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

  budgetUpdates: [
    {
      date: '2026-08-13',
      law: 'Lei 1.900/2026',
      title: 'Escola em Tempo Integral',
      // Lei municipal nº 1.900/2026, art. 1º: R$ 1.657.103,90. O valor R$ 1.657.104,00 não corresponde ao texto oficial da lei.
      amountBrl: 1_657_103.90,
      description: 'Crédito adicional especial para criação do projeto atividade Escola em Tempo Integral no orçamento de 2026.',
      sourceId: 'lei-1900-2026',
    },
  ],

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
      { id: 'saude-f', level: 'function', name: 'Saúde', amountBrl: 138_093_749.09, sourceId: 'loa-2026' },
      { id: 'administracao-f', level: 'function', name: 'Administração', amountBrl: 87_550_682.04, sourceId: 'loa-2026' },
      { id: 'urbanismo-f', level: 'function', name: 'Urbanismo', amountBrl: 55_116_420.94, sourceId: 'loa-2026' },
      { id: 'encargos-f', level: 'function', name: 'Encargos especiais', amountBrl: 65_469_900, sourceId: 'loa-2026' },
      { id: 'previdencia-f', level: 'function', name: 'Previdência', amountBrl: 35_002_000, sourceId: 'loa-2026' },
      { id: 'saneamento-f', level: 'function', name: 'Saneamento', amountBrl: 14_630_532.88, sourceId: 'loa-2026' },
    ],
  },

  indicators: [
    { id: 'population-2026', label: 'População 2026', value: 249978, unit: 'habitantes', status: 'published', referenceDate: '2026-07-01', sourceId: 'ibge-estimativas-2026' },
    { id: 'population-change-2022-2026', label: 'Variação absoluta da população 2022–2026', value: 249978 - 225693, unit: 'habitantes', status: 'derived', referenceDate: '2026-07-01', sourceId: 'ibge-estimativas-2026', note: 'Estimativa de 2026 menos população do Censo 2022. O resultado combina censo e estimativa e deve ser lido como mudança de referência, não como contagem direta de entradas no município.' },
    { id: 'population-growth-2022-2026', label: 'Variação percentual da população 2022–2026', value: ((249978 - 225693) / 225693) * 100, unit: '%', status: 'derived', referenceDate: '2026-07-01', sourceId: 'ibge-estimativas-2026', note: 'Variação percentual entre o Censo 2022 e a estimativa de 2026. Censo e estimativa têm naturezas estatísticas diferentes.' },
    { id: 'area', label: 'Área territorial', value: 191.817, unit: 'km²', status: 'published', sourceId: 'ibge-cidades-2026', referenceDate: '2025-04-30' },
    { id: 'density-2022', label: 'Densidade demográfica oficial', value: 1176.61, unit: 'hab/km²', status: 'historical', referenceDate: '2022-08-01', sourceId: 'ibge-censo-2022', note: 'Valor informado pelo IBGE para o Censo 2022.' },
    { id: 'density', label: 'Densidade 2026 (derivada)', value: 249978 / 191.817, unit: 'hab/km²', status: 'derived', referenceDate: '2026-07-01', sourceId: 'ibge-estimativas-2026', note: 'Estimativa de 2026 ÷ área territorial de 191,817 km²; não é o indicador oficial do Censo.' },
    { id: 'fare', label: 'Tarifa Brasília', value: 11.45, unit: 'BRL/trecho', status: 'published', sourceId: 'utb-tarifas' },
    { id: 'transport-monthly-brasilia-default', label: 'Transporte mensal por pessoa · Brasília · cenário padrão', value: TRANSPORT_FARES_BRL.brasilia * 2 * 22, unit: 'BRL/mês', status: 'derived', sourceId: 'utb-tarifas', note: 'Tarifa × 2 trechos por dia × 22 dias por mês. Cenário de referência; não considera integrações, gratuidades, vale-transporte, faltas ou feriados.' },
    { id: 'transport-monthly-taguatinga-default', label: 'Transporte mensal por pessoa · Taguatinga · cenário padrão', value: TRANSPORT_FARES_BRL.taguatinga * 2 * 22, unit: 'BRL/mês', status: 'derived', sourceId: 'antt-entorno-2026', note: 'Tarifa × 2 trechos por dia × 22 dias por mês. Cenário de referência; não considera integrações, gratuidades, vale-transporte, faltas ou feriados.' },
    { id: 'transport-monthly-ceilandia-default', label: 'Transporte mensal por pessoa · Ceilândia · cenário padrão', value: TRANSPORT_FARES_BRL.ceilandia * 2 * 22, unit: 'BRL/mês', status: 'derived', sourceId: 'antt-entorno-2026', note: 'Tarifa × 2 trechos por dia × 22 dias por mês. Cenário de referência; não considera integrações, gratuidades, vale-transporte, faltas ou feriados.' },
    { id: 'transport-brasilia-min-wage-share-default', label: 'Transporte para Brasília no salário mínimo · cenário padrão', value: ((TRANSPORT_FARES_BRL.brasilia * 2 * 22) / MINIMUM_WAGE_2026_BRL) * 100, unit: '%', status: 'derived', sourceId: 'utb-tarifas', note: 'Custo mensal de referência para Brasília ÷ salário mínimo de 2026. É uma relação de contexto, não mede renda disponível nem benefício de vale-transporte.' },
    { id: 'water-access-2024', label: 'Acesso à água', value: 95.8, unit: '%', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'public-sewer-service-2024', label: 'Acesso ao serviço público de esgoto', value: 84.8, unit: '%', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'sewer-collection-2024', label: 'Coleta do esgoto gerado', value: 60.1, unit: '%', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'sewer-treatment-generated-2024', label: 'Tratamento do esgoto gerado', value: 60.1, unit: '%', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'collected-sewer-treated-2024', label: 'Esgoto coletado que recebe tratamento', value: 100, unit: '%', status: 'historical', sourceId: 'sinisa-2024', note: 'Ano-base 2024. Percentual do esgoto coletado que recebe tratamento. O denominador é o volume coletado, não todo o esgoto gerado.' },
    { id: 'water-distribution-loss-2024', label: 'Perdas na distribuição de água', value: 40.9, unit: '%', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'hydrometering-2024', label: 'Hidrometração', value: 99.5, unit: '%', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'water-consumption-2024', label: 'Consumo de água por pessoa/dia', value: 104.1, unit: 'L/pessoa/dia', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'average-water-tariff-2024', label: 'Tarifa média de água', value: 3.6, unit: 'BRL/m³', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'household-waste-collection-2024', label: 'Coleta domiciliar de resíduos', value: 99.8, unit: '%', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'water-access-gap-2024', label: 'Parcela sem acesso à água', value: 100 - 95.8, unit: '%', status: 'derived', sourceId: 'sinisa-2024', note: 'Ano-base 2024. Complemento de 100% menos o indicador de acesso à água do SINISA 2024. Não representa contagem de pessoas.' },
    { id: 'public-sewer-service-gap-2024', label: 'Parcela fora do serviço público de esgoto', value: 100 - 84.8, unit: '%', status: 'derived', sourceId: 'sinisa-2024', note: 'Ano-base 2024. Complemento de 100% menos o indicador de acesso ao serviço público de esgoto do SINISA 2024. Não equivale a esgoto sem tratamento.' },
    { id: 'sewer-collection-gap-2024', label: 'Esgoto gerado sem coleta', value: 100 - 60.1, unit: '%', status: 'derived', sourceId: 'sinisa-2024', note: 'Ano-base 2024. Complemento de 100% menos o percentual de coleta do esgoto gerado. O denominador é o esgoto gerado.' },
    { id: 'sewer-treatment-gap-2024', label: 'Esgoto gerado sem tratamento', value: 100 - 60.1, unit: '%', status: 'derived', sourceId: 'sinisa-2024', note: 'Ano-base 2024. Complemento de 100% menos o percentual de tratamento do esgoto gerado. Não confundir com o percentual do esgoto coletado que recebe tratamento.' },
    { id: 'budget', label: 'LOA 2026', value: 771255334.51, unit: 'BRL', status: 'planned', sourceId: 'loa-2026', note: 'Ano-base 2026. Orçamento autorizado para o exercício; não representa gasto executado ou pago.' },
    { id: 'budget-per-capita-2026', label: 'LOA 2026 por habitante', value: 771255334.51 / 249978, unit: 'BRL/habitante', status: 'derived', referenceDate: '2026-07-01', sourceId: 'loa-2026', note: 'LOA 2026 ÷ população estimada de 2026. É uma razão de planejamento e não representa gasto executado por pessoa.' },
    { id: 'budget-education-per-capita-2026', label: 'Educação na LOA 2026 por habitante', value: 245469752.28 / 249978, unit: 'BRL/habitante', status: 'derived', referenceDate: '2026-07-01', sourceId: 'loa-2026', note: 'Função Educação na LOA 2026 ÷ população estimada de 2026. É uma razão de planejamento, não execução por pessoa.' },
    { id: 'budget-health-per-capita-2026', label: 'Saúde na LOA 2026 por habitante', value: 138093749.09 / 249978, unit: 'BRL/habitante', status: 'derived', referenceDate: '2026-07-01', sourceId: 'loa-2026', note: 'Função Saúde na LOA 2026 ÷ população estimada de 2026. É uma razão de planejamento, não execução por pessoa.' },
    { id: 'budget-sanitation-per-capita-2026', label: 'Saneamento na LOA 2026 por habitante', value: 14630532.88 / 249978, unit: 'BRL/habitante', status: 'derived', referenceDate: '2026-07-01', sourceId: 'loa-2026', note: 'Função Saneamento na LOA 2026 ÷ população estimada de 2026. É uma razão de planejamento, não execução por pessoa.' },
    { id: 'budget-education-share-2026', label: 'Educação na LOA 2026', value: (245469752.28 / 771255334.51) * 100, unit: '%', status: 'derived', sourceId: 'loa-2026', note: 'Ano-base 2026. Função Educação ÷ total da LOA 2026. Participação orçamentária não mede execução nem qualidade do serviço.' },
    { id: 'budget-health-share-2026', label: 'Saúde na LOA 2026', value: (138093749.09 / 771255334.51) * 100, unit: '%', status: 'derived', sourceId: 'loa-2026', note: 'Ano-base 2026. Função Saúde ÷ total da LOA 2026. Participação orçamentária não mede execução nem qualidade do serviço.' },
    { id: 'budget-sanitation-share-2026', label: 'Saneamento na LOA 2026', value: (14630532.88 / 771255334.51) * 100, unit: '%', status: 'derived', sourceId: 'loa-2026', note: 'Ano-base 2026. Função Saneamento ÷ total da LOA 2026. Participação orçamentária não mede execução nem qualidade do serviço.' },
    { id: 'companies', label: 'Empresas ativas', value: 20096, unit: 'empresas', status: 'snapshot', sourceId: 'caged-sebrae-2026' },
    { id: 'cagedBalance', label: 'Saldo celetista até jul/2026', value: 762, unit: 'postos', status: 'snapshot', sourceId: 'caged-sebrae-2026' },
    { id: 'idebInitial', label: 'IDEB anos iniciais', value: 5.5, unit: 'pontos', status: 'historical', note: 'Ano-base 2023.', sourceId: 'inep-2023' },
    { id: 'idebFinal', label: 'IDEB anos finais', value: 4.9, unit: 'pontos', status: 'historical', note: 'Ano-base 2023.', sourceId: 'inep-2023' },
    { id: 'urbanized-area', label: 'Área urbanizada', value: 43.87, unit: 'km²', status: 'historical', note: 'Ano-base 2019.', sourceId: 'ibge-cidades-2026' },
    { id: 'street-arborization', label: 'Arborização de vias públicas', value: 54.66, unit: '%', status: 'historical', referenceDate: '2022-08-01', sourceId: 'ibge-cidades-2026' },
    { id: 'adequate-sewerage', label: 'Esgotamento sanitário adequado', value: 49.69, unit: '%', status: 'historical', referenceDate: '2022-08-01', sourceId: 'ibge-cidades-2026' },
    { id: 'formal-salary', label: 'Salário médio mensal formal', value: 1.9, unit: 'salários mínimos', status: 'historical', note: 'Ano-base 2024.', sourceId: 'ibge-cidades-2026' },
    { id: 'formal-workers', label: 'Pessoal ocupado', value: 22005, unit: 'pessoas', status: 'historical', note: 'Ano-base 2024.', sourceId: 'ibge-cidades-2026' },
    { id: 'homicideRate', label: 'Homicídios', value: 18.7, unit: 'por 100 mil', status: 'historical', sourceId: 'atlas-violencia-2026' },
    { id: 'schooling-6-14', label: 'Escolarização 6–14 anos', value: 98.1, unit: '%', status: 'historical', referenceDate: '2022-08-01', sourceId: 'ibge-cidades-2026' },
    { id: 'infant-mortality', label: 'Mortalidade infantil', value: 11.23, unit: 'óbitos por mil', status: 'published', sourceId: 'ibge-cidades-2026', note: 'Ano-base 2025. A fonte municipal informa o ano do indicador, mas não sustenta uma data diária específica; por isso o campo de referência exata permanece vazio.' },
    { id: 'heal-opening-beds', label: 'HEAL · leitos reportados na inauguração', value: 164, unit: 'leitos', status: 'historical', sourceId: 'healgo', note: 'Referência reportada na inauguração; não deve ser tratada automaticamente como capacidade atual.' },
    { id: 'heal-current-stated-beds', label: 'HEAL · leitos explicitados no portal institucional', value: 85, unit: 'leitos', status: 'published', sourceId: 'healgo', note: 'Soma dos 32 leitos de enfermaria e 53 de UTI explicitados no portal institucional. Data da capacidade não informada; consulte a fonte antes de tratar como disponibilidade atual. O conjunto não documenta, por si só, a causa da diferença para a referência de inauguração.' },
    { id: 'heal-planned-beds', label: 'HEAL · leitos no planejamento registrado', value: 298, unit: 'leitos', status: 'planned', sourceId: 'healgo', note: 'Número de planejamento registrado no dataset; não representa capacidade já instalada.' },
    { id: 'heal-first-year-attendances', label: 'HEAL · atendimentos no primeiro ano', value: 200000, unit: 'atendimentos', status: 'historical', referenceDate: '2025-06-17', sourceId: 'healgo-200k', note: 'A fonte informa mais de 200 mil atendimentos; o valor 200.000 é usado como piso para cálculos derivados.' },
    { id: 'heal-opening-investment', label: 'HEAL · investimento reportado na inauguração', value: 157000000, unit: 'BRL', status: 'historical', sourceId: 'healgo' },
    { id: 'heal-attendances-per-opening-bed', label: 'HEAL · atendimentos por leito de referência', value: 200000 / 164, unit: 'atendimentos/leito', status: 'derived', referenceDate: '2025-06-17', sourceId: 'healgo-200k', note: 'Piso de 200 mil atendimentos ÷ 164 leitos reportados na inauguração. É uma razão descritiva e não mede ocupação, giro de leitos ou qualidade assistencial.' },
    { id: 'revenue-2025', label: 'Receitas brutas realizadas 2025', value: 825112043.1, unit: 'BRL', status: 'historical', note: 'Ano-base 2025.', sourceId: 'ibge-cidades-2026' },
    { id: 'expenses-2025', label: 'Despesas brutas empenhadas 2025', value: 691558004.38, unit: 'BRL', status: 'historical', note: 'Ano-base 2025.', sourceId: 'ibge-cidades-2026' },
    { id: 'revenue-per-capita-2025', label: 'Receitas realizadas por habitante 2025', value: 825112043.1 / 245352, unit: 'BRL/habitante', status: 'derived', referenceDate: '2025-12-31', sourceId: 'ibge-cidades-2026', note: 'Ano-base 2025. Receitas brutas realizadas em 2025 ÷ população estimada de 2025 (245.352). É uma razão descritiva e não representa renda recebida por cada morador.' },
    { id: 'expenses-per-capita-2025', label: 'Despesas empenhadas por habitante 2025', value: 691558004.38 / 245352, unit: 'BRL/habitante', status: 'derived', referenceDate: '2025-12-31', sourceId: 'ibge-cidades-2026', note: 'Ano-base 2025. Despesas brutas empenhadas em 2025 ÷ população estimada de 2025 (245.352). Empenho não equivale necessariamente a pagamento realizado.' },
    { id: 'revenue-expense-difference-per-capita-2025', label: 'Diferença receita–despesa por habitante 2025', value: (825112043.1 - 691558004.38) / 245352, unit: 'BRL/habitante', status: 'derived', referenceDate: '2025-12-31', sourceId: 'ibge-cidades-2026', note: 'Ano-base 2025. Diferença entre receitas realizadas e despesas empenhadas ÷ população estimada de 2025. Não deve ser interpretada automaticamente como superávit fiscal por habitante.' },
    { id: 'revenue-expense-difference-2025', label: 'Diferença entre receitas realizadas e despesas empenhadas 2025', value: 825112043.1 - 691558004.38, unit: 'BRL', status: 'derived', sourceId: 'ibge-cidades-2026', note: 'Ano-base 2025. Receitas brutas realizadas menos despesas brutas empenhadas. É uma diferença entre dois totais publicados e não deve ser interpretada automaticamente como superávit fiscal.' },
    { id: 'gdp-per-capita-2023', label: 'PIB per capita', value: 13567.92, unit: 'BRL', status: 'historical', note: 'Ano-base 2023.', sourceId: 'ibge-cidades-2026' },
    { id: 'sanitation-investment', label: 'Investimento em saneamento', value: 30004882.01, unit: 'BRL', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'sanitation-investment-per-capita', label: 'Investimento em saneamento per capita', value: 124.70, unit: 'BRL/pessoa', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'water-related-deaths', label: 'Óbitos por doenças relacionadas à água', value: 3, unit: 'óbitos', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'water-related-hospitalizations', label: 'Internações por doenças relacionadas à água', value: 427, unit: 'internações', status: 'historical', note: 'Ano-base 2024.', sourceId: 'sinisa-2024' },
    { id: 'companies-new', label: 'Empresas novas no recorte', value: 25848, unit: 'empresas', status: 'snapshot', note: 'Ano-base 2026.', sourceId: 'caged-sebrae-2026' },
    { id: 'basic-enrollments-2025', label: 'Matrículas na educação básica 2025', value: 58138, unit: 'matrículas', status: 'historical', note: 'Ano-base 2025.', sourceId: 'pee-go-educacao-2025' },
    { id: 'municipal-enrollments-2025', label: 'Matrículas municipais 2025', value: 23847, unit: 'matrículas', status: 'historical', note: 'Ano-base 2025.', sourceId: 'pee-go-educacao-2025' },
    { id: 'municipal-enrollment-share-2025', label: 'Participação das matrículas municipais na educação básica', value: (23847 / 58138) * 100, unit: '%', status: 'derived', sourceId: 'pee-go-educacao-2025', note: 'Ano-base 2025. Matrículas municipais ÷ matrículas totais da educação básica em 2025.' },
    { id: 'ept-technical-2025', label: 'EPT técnica articulada ao Ensino Médio', value: 493, unit: 'matrículas', status: 'historical', note: 'Ano-base 2025.', sourceId: 'pee-go-ept-2025' },
  ],
};
