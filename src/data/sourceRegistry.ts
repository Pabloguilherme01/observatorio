import type { SourceRef } from '../types/observatorio.js';

export const sourceRegistry: readonly SourceRef[] = [
  {
    id: 'ibge-estimativas-2026',
    label: 'IBGE — Estimativas da População 2026',
    institution: 'IBGE',
    url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9103-estimativas-de-populacao.html',
    nature: 'official',
    referenceDate: '2026-07-01',
    publishedAt: '2026-08-28',
    note: 'Estimativas municipais com referência em 1º de julho de 2026. O IBGE publica a estimativa municipal de 2026 e informa a metodologia e a base territorial utilizada.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'inss-salario-2026',
    label: 'INSS — Tabela de contribuição mensal 2026',
    institution: 'Instituto Nacional do Seguro Social',
    url: 'https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal',
    nature: 'official',
    referenceDate: '2026-01-01',
    publishedAt: '2026-01-13',
    note: 'Tabela oficial válida a partir da competência janeiro de 2026; registra R$ 1.621,00 como salário de contribuição mínimo e referência do salário mínimo nacional.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'ibge-cidades-2026',
    label: 'IBGE — Cidades e Estados: Águas Lindas de Goiás',
    institution: 'IBGE',
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/aguas-lindas-de-goias.html',
    nature: 'official',
    note: 'Painel municipal com área territorial, população estimada, escolarização, mortalidade infantil, receitas, despesas e PIB per capita, conforme os respectivos anos-base informados pelo IBGE.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'ibge-censo-2022',
    label: 'IBGE — Censo Demográfico 2022',
    institution: 'IBGE',
    url: 'https://censo2022.ibge.gov.br/panorama/',
    nature: 'official',
    referenceDate: '2022-08-01',
    lastCheckedAt: '2026-10-05',
  },










  {
    id: 'utb-tarifas',
    label: 'UTB — Tarifas do semiurbano',
    institution: 'União Transporte Brasília',
    url: 'https://www.utb.com.br/tarifas',
    nature: 'official',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'antt-entorno-2026',
    label: 'ANTT — Tarifas do Entorno do DF',
    institution: 'ANTT',
    url: 'https://www.gov.br/antt/pt-br/assuntos/ultimas-noticias/antt-aprova-reajuste-tarifario-do-transporte-semiurbano-do-df-e-entorno-com-efeitos-condicionados-a-formalizacao-de-acordo',
    nature: 'official',
    publishedAt: '2026-06-28',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'salario-minimo-2026',
    label: 'Decreto 12.797/2025 — Salário mínimo 2026',
    institution: 'Presidência da República',
    url: 'https://www.gov.br/planejamento/pt-br/acesso-a-informacao/institucional/atos-normativos/2025/decretos',
    nature: 'official',
    referenceDate: '2026-01-01',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'sinisa-2024',
    label: 'Instituto Água e Saneamento — SINISA 2024',
    institution: 'Instituto Água e Saneamento',
    url: 'https://www.aguaesaneamento.org.br/municipios-e-saneamento/go/aguas-lindas-de-goias',
    nature: 'secondary',
    referenceDate: '2024-01-01',
    note: 'Painel secundário que reproduz indicadores do SINISA; interpretar o ano-base separadamente.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'healgo',
    label: 'SES-GO — HEAL',
    institution: 'Secretaria de Estado da Saúde de Goiás',
    url: 'https://goias.gov.br/saude/heal/',
    nature: 'official',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'healgo-200k',
    label: 'SES-GO — HEAL: primeiro ano',
    institution: 'Secretaria de Estado da Saúde de Goiás',
    url: 'https://goias.gov.br/saude/tags/hospitais-estaduais/page/69/',
    nature: 'official',
    publishedAt: '2025-06-17',
    note: 'Mais de 200 mil atendimentos no primeiro ano.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'loa-2026',
    label: 'Lei Municipal 1.847/2026 — LOA',
    institution: 'Prefeitura de Águas Lindas de Goiás',
    url: 'https://legislacao.aguaslindasdegoias.go.gov.br/leis/1654',
    nature: 'official',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'inep-ideb-2025',
    label: 'INEP — Resultados do Ideb 2025',
    institution: 'INEP',
    url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb/resultados/2005-2025',
    nature: 'official',
    publishedAt: '2026-08-05',
    note: 'Ano-base 2025. Página oficial dos resultados 2005–2025. A consulta confirma a publicação dos resultados municipais, mas o snapshot deste projeto ainda não materializa o ponto municipal de Águas Lindas de Goiás.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'qedu-ideb-2025',
    label: 'QEdu — referência secundária para Ideb 2025',
    institution: 'QEdu',
    url: 'https://qedu.org.br/',
    nature: 'secondary',
    note: 'Ano-base 2025. Referência secundária citada no levantamento de origem para uma faixa 2025. Não substitui a captura do valor municipal pontual na fonte oficial do INEP.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'inep-2023',
    label: 'INEP — Indicadores educacionais',
    institution: 'INEP',
    url: 'https://www.gov.br/inep/pt-br',
    nature: 'official',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'caged-sebrae-2026',
    label: 'CiDados / Sebrae — mercado de trabalho',
    institution: 'Sebrae',
    url: 'https://www.sebraego.com.br/',
    nature: 'secondary',
    note: 'Recorte consolidado no material de origem; manter separado de fontes primárias.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'atlas-violencia-2026',
    label: 'Atlas da Violência 2026',
    institution: 'IPEA / FBSP',
    url: 'https://www.ipea.gov.br/atlasviolencia/',
    nature: 'official',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'pee-go-educacao-2025',
    label: 'PEE Goiás — Matrículas da Educação Básica 2025',
    institution: 'Governo de Goiás',
    url: 'https://pee.goias.gov.br/diagnostico/base-dados/?indicator=ED_BASICA_MATRICULAS&page=2',
    nature: 'official',
    note: 'Ano-base 2025. Base oficial do Plano Estadual de Educação com recorte municipal de matrículas da educação básica.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'pee-go-ept-2025',
    label: 'PEE Goiás — EPT técnica articulada ao Ensino Médio 2025',
    institution: 'Governo de Goiás',
    url: 'https://pee.goias.gov.br/diagnostico/base-dados/?indicator=EPT_TEC_ARTICULADA&page=2',
    nature: 'official',
    note: 'Ano-base 2025. Base oficial com matrículas de educação profissional técnica articulada ao ensino médio.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'lei-1900-2026',
    label: 'Lei Municipal 1.900/2026 — Escola em Tempo Integral',
    institution: 'Prefeitura de Águas Lindas de Goiás',
    url: 'https://legislacao.aguaslindasdegoias.go.gov.br/leis',
    nature: 'official',
    referenceDate: '2026-08-13',
    publishedAt: '2026-08-13',
    note: 'Crédito adicional especial de R$ 1.657.103,90 para criação do projeto atividade Escola em Tempo Integral.',
    lastCheckedAt: '2026-10-05',
  },







  {
    id: 'municipal-defesa-civil-2026',
    label: 'Prefeitura — Defesa Civil',
    institution: 'Prefeitura de Águas Lindas de Goiás',
    url: 'https://aguaslindasdegoias.go.gov.br/prefeitura-de-aguas-lindas-decreta-situacao-de-emergencia-apos-chuvas-intensas-e-inundacoes/',
    nature: 'official',
    referenceDate: '2026-09-25',
    note: 'Página municipal usada para verificar o contato da Defesa Civil.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'municipal-conselho-tutelar-2026',
    label: 'Prefeitura — Conselho Tutelar',
    institution: 'Prefeitura de Águas Lindas de Goiás',
    url: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-assistencia-social-cidadania-e-juventude/conselho-tutelar/',
    nature: 'official',
    referenceDate: '2026-09-25',
    note: 'Página municipal usada para verificar telefone, endereço e horário do Conselho Tutelar.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'municipal-caps-2026',
    label: 'Prefeitura — CAPS',
    institution: 'Prefeitura de Águas Lindas de Goiás',
    url: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-saude-2/caps-centro-de-atencao-psicossocial/',
    nature: 'official',
    referenceDate: '2026-09-25',
    note: 'Página municipal usada para verificar o contato do CAPS.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'municipal-samu-2026',
    label: 'Prefeitura — SAMU',
    institution: 'Prefeitura de Águas Lindas de Goiás',
    url: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-saude-2/samu-servico-de-atendimento-movel-de-urgencia/',
    nature: 'official',
    referenceDate: '2026-09-25',
    note: 'Página municipal usada para verificar o serviço SAMU e a orientação de emergência pelo 192.',
    lastCheckedAt: '2026-10-05',
  },
  {
    id: 'saneago-atendimento-2026',
    label: 'Saneago — Atendimento ao cliente',
    institution: 'Saneamento de Goiás S.A.',
    url: 'https://www.saneago.com.br/site',
    nature: 'official',
    referenceDate: '2026-09-25',
    note: 'Canal oficial de atendimento ao cliente para água e esgotamento sanitário; a Saneago informa atendimento 24h pelo 0800 645 0115.',
    lastCheckedAt: '2026-10-05',
  },


































];
