import { CheckCircle2, Lock, Medal, RotateCcw, Share2, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import '../../assets/styles/summary-polish.css';
import { readQuizHighScores, recordQuizHighScore, type QuizHighScore } from '../../lib/quizLeaderboard';

type Difficulty = 'Fácil' | 'Médio' | 'Difícil' | 'Avançado' | 'Expert';

export type QuizQuestion = {
  readonly id: string;
  readonly difficulty: Difficulty;
  readonly prompt: string;
  readonly options: readonly string[];
  readonly answerIndex: number;
  readonly explanation: string;
  readonly sourceId: string;
};

export const QUIZ_TOTAL = 200;
export const QUESTIONS_PER_LEVEL = 40;
export const QUIZ_LEVELS: readonly Difficulty[] = ['Fácil', 'Médio', 'Difícil', 'Avançado', 'Expert'];

export const QUESTION_BANK: readonly QuizQuestion[] = [
    { id: "q001", difficulty:'Fácil', prompt: "Qual é a população estimada de Águas Lindas de Goiás em 2026?", options: ["249.978", "225.693", "245.352", "159.378"], answerIndex: 0, explanation: "Estimativa do IBGE com referência em 1º de julho de 2026.", sourceId: "ibge-estimativas-2026" },
    { id: "q002", difficulty:'Fácil', prompt: "Quantos eleitores estavam aptos a votar no snapshot de julho de 2026?", options: ["121.788", "125.062", "107.255", "125.501"], answerIndex: 1, explanation: "Snapshot TSE da 28ª Zona Eleitoral, referência 15/07/2026.", sourceId: "tse-eleitorado-2026" },
    { id: "q003", difficulty:'Fácil', prompt: "Em qual estado fica Águas Lindas de Goiás?", options: ["Distrito Federal", "Minas Gerais", "Goiás", "Tocantins"], answerIndex: 2, explanation: "Município goiano localizado no Entorno do DF.", sourceId: "ibge-cidades-2026" },
    { id: "q004", difficulty:'Fácil', prompt: "Qual zona eleitoral atende o município?", options: ["27ª Zona Eleitoral", "29ª Zona Eleitoral", "118ª Zona Eleitoral", "28ª Zona Eleitoral"], answerIndex: 3, explanation: "O eleitorado local é registrado na 28ª Zona Eleitoral.", sourceId: "tse-eleitorado-2026" },
    { id: "q005", difficulty:'Fácil', prompt: "Qual foi a população apurada no Censo 2022?", options: ["225.693", "249.978", "159.378", "245.352"], answerIndex: 0, explanation: "Contagem censitária do IBGE de 2022.", sourceId: "ibge-censo-2022" },
    { id: "q006", difficulty:'Fácil', prompt: "Qual o valor total do orçamento municipal de 2026 (LOA)?", options: ["R$ 691,56 milhões", "R$ 771,26 milhões", "R$ 825,11 milhões", "R$ 209,03 milhões"], answerIndex: 1, explanation: "LOA 2026 autoriza R$ 771,3 milhões para o exercício.", sourceId: "loa-2026" },
    { id: "q007", difficulty:'Fácil', prompt: "Qual a porcentagem de comparecimento dos eleitores em 2024?", options: ["21,83%", "69,5%", "78,17%", "84,8%"], answerIndex: 2, explanation: "O turnout de 2024 foi de 78,17%.", sourceId: "tse-eleitorado-2024" },
    { id: "q008", difficulty:'Fácil', prompt: "Qual a porcentagem de domicílios com água encanada?", options: ["84,8%", "60,1%", "99,8%", "95,8%"], answerIndex: 3, explanation: "Indicador SINISA 2024 de acesso à rede de abastecimento.", sourceId: "sinisa-2024" },
    { id: "q009", difficulty:'Fácil', prompt: "Quanto custa a passagem de ônibus para Brasília (Plano Piloto)?", options: ["R$ 11,45", "R$ 7,65", "R$ 5,85", "R$ 4,40"], answerIndex: 0, explanation: "Tarifa da tabela publicada pela UTB.", sourceId: "utb-tarifas" },
    { id: "q010", difficulty:'Fácil', prompt: "Qual o hospital estadual da cidade?", options: ["Hospital Municipal de Águas Lindas", "HEAL — Hospital Estadual Ronaldo Ramos Caiado Filho", "Hospital Regional do Entorno", "UPA 24h Central"], answerIndex: 1, explanation: "O HEAL é o hospital estadual de Águas Lindas.", sourceId: "healgo" },
    { id: "q011", difficulty:'Fácil', prompt: "Qual o IDEB dos anos iniciais em 2023?", options: ["4,9", "6,2", "5,5", "5,7"], answerIndex: 2, explanation: "IDEB 2023 do INEP para os anos iniciais.", sourceId: "inep-2023" },
    { id: "q012", difficulty:'Fácil', prompt: "Qual a área territorial do município?", options: ["43,87 km²", "117,61 km²", "391,817 km²", "191,817 km²"], answerIndex: 3, explanation: "Área registrada na base municipal do IBGE.", sourceId: "ibge-cidades-2026" },
    { id: "q013", difficulty:'Fácil', prompt: "Qual o salário mínimo usado como referência no simulador de transporte?", options: ["R$ 1.621,00", "R$ 1.412,00", "R$ 1.518,00", "R$ 1.320,00"], answerIndex: 0, explanation: "O dataset registra R$ 1.621 como referência.", sourceId: "inss-salario-2026" },
    { id: "q014", difficulty:'Fácil', prompt: "Quantos leitos são planejados no HEAL?", options: ["164", "298", "32", "53"], answerIndex: 1, explanation: "O planejamento do hospital indica 298 leitos.", sourceId: "healgo" },
    { id: "q015", difficulty:'Fácil', prompt: "Qual o investimento divulgado na construção do HEAL?", options: ["R$ 77 milhões", "R$ 138,09 milhões", "R$ 157 milhões", "R$ 245,47 milhões"], answerIndex: 2, explanation: "Investimento de R$ 157 milhões na unidade.", sourceId: "healgo" },
    { id: "q016", difficulty:'Fácil', prompt: "Qual faixa de idade concentra mais eleitores?", options: ["Até 24 anos", "60 anos ou mais", "16–17 anos", "25–59 anos"], answerIndex: 3, explanation: "O grupo de 25 a 59 anos reúne 69,5% do eleitorado.", sourceId: "tse-eleitorado-2026" },
    { id: "q017", difficulty:'Fácil', prompt: "As mulheres representam qual porcentagem do eleitorado?", options: ["52,98%", "47,02%", "69,5%", "19,4%"], answerIndex: 0, explanation: "Eleitoras são 52,98% do total.", sourceId: "tse-eleitorado-2026" },
    { id: "q018", difficulty:'Fácil', prompt: "Qual sistema oficial reúne informações sobre candidaturas e contas eleitorais?", options: ["DivulgaCandContas", "e-Título", "Pardal", "CANDex"], answerIndex: 0, explanation: "O DivulgaCandContas reúne informações sobre candidatas, candidatos, partidos e contas eleitorais.", sourceId: "tse-eleicoes-2026" },
    { id: "q019", difficulty:'Fácil', prompt: "Qual informação pode ser consultada no DivulgaCandContas em 2026?", options: ["Nome, número, partido e situação do registro", "Senha bancária pessoal", "Conversas privadas de campanha", "Histórico médico"], answerIndex: 0, explanation: "A Justiça Eleitoral informa que o sistema permite consultar, entre outros dados, nome, número, partido ou federação e situação do registro.", sourceId: "tse-eleicoes-2026" },
    { id: "q020", difficulty:'Fácil', prompt: "Qual portal disponibiliza dados brutos das eleições?", options: ["Portal de Dados Abertos do TSE", "Portal da Receita Federal", "e-SUS", "Portal de Transparência Municipal"], answerIndex: 0, explanation: "O Portal de Dados Abertos do TSE disponibiliza conjuntos de dados brutos das eleições.", sourceId: "tse-eleicoes-2026" },
    { id: "q021", difficulty:'Fácil', prompt: "Com que frequência o TSE informa atualização de receitas e despesas no DivulgaCandContas?", options: ["A cada hora", "Uma vez por mês", "A cada seis meses", "Somente após a eleição"], answerIndex: 0, explanation: "O TSE informa que receitas e despesas declaradas no sistema recebem atualizações a cada hora.", sourceId: "tse-eleicoes-2026" },
    { id: "q022", difficulty:'Fácil', prompt: "Quanto custa a passagem para Taguatinga?", options: ["R$ 11,45", "R$ 7,65", "R$ 5,85", "R$ 6,65"], answerIndex: 1, explanation: "Tarifa ANTT/Taguatur para Taguatinga.", sourceId: "antt-entorno-2026" },
    { id: "q023", difficulty:'Fácil', prompt: "Quanto custa a passagem para Ceilândia?", options: ["R$ 7,65", "R$ 11,45", "R$ 5,85", "R$ 4,85"], answerIndex: 2, explanation: "Tarifa ANTT/Taguatur para Ceilândia.", sourceId: "antt-entorno-2026" },
    { id: "q024", difficulty:'Fácil', prompt: "Quantas matrículas havia na educação básica em 2025?", options: ["23.847", "493", "22.005", "58.138"], answerIndex: 3, explanation: "Total de 58.138 matrículas na educação básica.", sourceId: "pee-go-educacao-2025" },
    { id: "q025", difficulty:'Fácil', prompt: "Quantas matrículas na rede municipal em 2025?", options: ["23.847", "58.138", "493", "58.000"], answerIndex: 0, explanation: "A rede municipal registrou 23.847 matrículas.", sourceId: "pee-go-educacao-2025" },
    { id: "q026", difficulty:'Fácil', prompt: "Qual o IDEB dos anos finais em 2023?", options: ["5,5", "4,9", "6,2", "4,5"], answerIndex: 1, explanation: "IDEB 2023 do INEP para os anos finais.", sourceId: "inep-2023" },
    { id: "q027", difficulty:'Fácil', prompt: "Qual a porcentagem de coleta de lixo domiciliar?", options: ["95,8%", "84,8%", "99,8%", "90,1%"], answerIndex: 2, explanation: "Coleta de resíduos domiciliares chega a 99,8%.", sourceId: "sinisa-2024" },
    { id: "q028", difficulty:'Fácil', prompt: "Quantas empresas ativas há no recorte?", options: ["25.848", "22.005", "762", "20.096"], answerIndex: 3, explanation: "O recorte registra 20.096 empresas ativas.", sourceId: "caged-sebrae-2026" },
    { id: "q029", difficulty:'Fácil', prompt: "Qual o PIB per capita do município (2023)?", options: ["R$ 13.567,92", "R$ 1.621,00", "R$ 124,70", "R$ 19,00"], answerIndex: 0, explanation: "PIB per capita de 2023: R$ 13.567,92.", sourceId: "ibge-cidades-2026" },
    { id: "q030", difficulty:'Fácil', prompt: "Qual o eleitorado na eleição de 2022?", options: ["121.788", "107.255", "95.200", "125.062"], answerIndex: 1, explanation: "Em 2022 eram 107.255 eleitores.", sourceId: "tse-eleitorado-2022" },
    { id: "q031", difficulty:'Fácil', prompt: "Qual o eleitorado na eleição de 2018?", options: ["107.255", "121.788", "95.200", "89.100"], answerIndex: 2, explanation: "Em 2018 eram 95.200 eleitores.", sourceId: "tse-eleitorado-2018" },
    { id: "q032", difficulty:'Fácil', prompt: "Qual a taxa de escolarização de 6 a 14 anos?", options: ["95,8%", "84,8%", "99,8%", "98,1%"], answerIndex: 3, explanation: "98,1% das crianças de 6 a 14 anos estão escolarizadas.", sourceId: "ibge-cidades-2026" },
    { id: "q033", difficulty:'Fácil', prompt: "Qual a taxa de homicídios por 100 mil habitantes?", options: ["18,7", "11,23", "40,9", "4,9"], answerIndex: 0, explanation: "Taxa do Atlas da Violência: 18,7 por 100 mil.", sourceId: "atlas-violencia-2026" },
    { id: "q034", difficulty:'Fácil', prompt: "Qual a mortalidade infantil (por mil nascidos vivos)?", options: ["18,7", "11,23", "3", "104,1"], answerIndex: 1, explanation: "Mortalidade infantil de 11,23 por mil.", sourceId: "ibge-cidades-2026" },
    { id: "q035", difficulty:'Fácil', prompt: "Qual o salário médio mensal formal (em salários mínimos)?", options: ["2,9 salários mínimos", "0,9 salários mínimos", "1,9 salários mínimos", "3,9 salários mínimos"], answerIndex: 2, explanation: "O salário médio formal é 1,9 salário mínimo.", sourceId: "ibge-cidades-2026" },
    { id: "q036", difficulty:'Fácil', prompt: "Qual a porcentagem de arborização das vias públicas?", options: ["49,69%", "95,8%", "99,8%", "54,66%"], answerIndex: 3, explanation: "54,66% das vias públicas têm arborização.", sourceId: "ibge-cidades-2026" },
    { id: "q037", difficulty:'Fácil', prompt: "Quem regula a tarifa do trecho para Brasília?", options: ["UTB — tabela oficial", "ANTT", "SETRAN-GO", "DER-GO"], answerIndex: 0, explanation: "A tarifa de Brasília vem da tabela da UTB.", sourceId: "utb-tarifas" },
    { id: "q038", difficulty:'Fácil', prompt: "Quem opera os trechos para Taguatinga e Ceilândia?", options: ["UTB", "Taguatur (sob regulação ANTT)", "Viação Águas Claras", "DER-GO"], answerIndex: 1, explanation: "Trechos semiurbanos operados pela Taguatur.", sourceId: "antt-entorno-2026" },
    { id: "q039", difficulty:'Fácil', prompt: "Qual a fonte dos indicadores de saneamento?", options: ["SNIS 2024", "IBGE Cidades", "SINISA 2024", "TSE"], answerIndex: 2, explanation: "Os indicadores de saneamento vêm do SINISA 2024.", sourceId: "sinisa-2024" },
    { id: "q040", difficulty:'Fácil', prompt: "Qual função de governo recebe a maior verba na LOA 2026?", options: ["Saúde", "Urbanismo", "Saneamento", "Educação"], answerIndex: 3, explanation: "Educação recebe R$ 245,5 milhões na LOA 2026.", sourceId: "loa-2026" },
    { id: "q041", difficulty:'Médio', prompt: "Qual a população apurada no Censo 2010?", options: ["159.378", "225.693", "249.978", "95.200"], answerIndex: 0, explanation: "O Censo 2010 registrou 159.378 habitantes.", sourceId: "ibge-censo-2022" },
    { id: "q042", difficulty:'Médio', prompt: "Qual a estimativa populacional de 2025?", options: ["249.978", "245.352", "225.693", "159.378"], answerIndex: 1, explanation: "Estimativa IBGE 2025: 245.352 habitantes.", sourceId: "ibge-estimativas-2026" },
    { id: "q043", difficulty:'Médio', prompt: "Qual o eleitorado consolidado do TSE para 2026?", options: ["125.062", "121.788", "125.501", "107.255"], answerIndex: 2, explanation: "O consolidado do TSE aponta 125.501 eleitores.", sourceId: "reconciliacao-eleitorado-2026" },
    { id: "q044", difficulty:'Médio', prompt: "Qual a diferença entre o snapshot da zona e o consolidado do TSE?", options: ["4.390", "43.900", "43", "439"], answerIndex: 3, explanation: "A diferença registrada é de 439 eleitores.", sourceId: "reconciliacao-eleitorado-2026" },
    { id: "q045", difficulty:'Médio', prompt: "Qual a taxa de abstenção em 2024?", options: ["21,83%", "78,17%", "15,5%", "10,25%"], answerIndex: 0, explanation: "21,83% dos eleitores não compareceram em 2024.", sourceId: "tse-eleitorado-2024" },
    { id: "q046", difficulty:'Médio', prompt: "Quantos eleitores se abstiveram em 2024?", options: ["3.230", "26.585", "2.934", "89.039"], answerIndex: 1, explanation: "Foram 26.585 abstenções.", sourceId: "tse-eleitorado-2024" },
    { id: "q047", difficulty:'Médio', prompt: "Quantos votos brancos houve em 2024?", options: ["2.934", "26.585", "3.230", "89.039"], answerIndex: 2, explanation: "3.230 votos brancos em 2024.", sourceId: "tse-eleitorado-2024" },
    { id: "q048", difficulty:'Médio', prompt: "Quantos votos nulos houve em 2024?", options: ["3.230", "26.585", "24.265", "2.934"], answerIndex: 3, explanation: "2.934 votos nulos em 2024.", sourceId: "tse-eleitorado-2024" },
    { id: "q049", difficulty:'Médio', prompt: "Quantos votos válidos houve em 2024?", options: ["89.039", "26.585", "3.230", "2.934"], answerIndex: 0, explanation: "89.039 votos válidos em 2024.", sourceId: "tse-eleitorado-2024" },
    { id: "q050", difficulty:'Médio', prompt: "Qual o eleitorado na eleição de 2024?", options: ["125.062", "121.788", "107.255", "95.200"], answerIndex: 1, explanation: "Em 2024 eram 121.788 eleitores.", sourceId: "tse-eleitorado-2024" },
    { id: "q051", difficulty:'Médio', prompt: "Quantos eleitores têm 60 anos ou mais?", options: ["24.265", "86.928", "13.869", "33"], answerIndex: 2, explanation: "13.869 eleitores com 60+ (11,1%).", sourceId: "tse-eleitorado-2026" },
    { id: "q052", difficulty:'Médio', prompt: "Quantos eleitores têm até 24 anos?", options: ["13.869", "86.928", "941", "24.265"], answerIndex: 3, explanation: "24.265 eleitores até 24 anos (19,4%).", sourceId: "tse-eleitorado-2026" },
    { id: "q053", difficulty:'Médio', prompt: "Quantas pessoas usam nome social registrado no eleitorado?", options: ["891", "941", "33", "13.869"], answerIndex: 0, explanation: "891 registros de nome social.", sourceId: "tse-eleitorado-2026" },
    { id: "q054", difficulty:'Médio', prompt: "Qual é a data do primeiro turno das Eleições 2026?", options: ["4 de outubro de 2026", "25 de outubro de 2026", "15 de novembro de 2026", "6 de setembro de 2026"], answerIndex: 0, explanation: "O calendário oficial do TSE fixa o primeiro turno em 4 de outubro de 2026; o segundo turno, se houver, será em 25 de outubro.", sourceId: "tse-calendario-2026" },
    { id: "q055", difficulty:'Médio', prompt: "Quantos eleitores indígenas há no município?", options: ["941", "891", "33", "13.869"], answerIndex: 2, explanation: "33 eleitores indígenas registrados.", sourceId: "tse-eleitorado-2026" },
    { id: "q056", difficulty:'Médio', prompt: "Qual a porcentagem de perda de água na distribuição?", options: ["95,8%", "60,1%", "99,5%", "40,9%"], answerIndex: 3, explanation: "40,9% da água distribuída é perdida na rede.", sourceId: "sinisa-2024" },
    { id: "q057", difficulty:'Médio', prompt: "Qual a taxa de hidrometração?", options: ["99,5%", "95,8%", "84,8%", "40,9%"], answerIndex: 0, explanation: "99,5% das ligações são hidrometradas.", sourceId: "sinisa-2024" },
    { id: "q058", difficulty:'Médio', prompt: "Qual o consumo médio de água (litros por pessoa ao dia)?", options: ["86,4", "104,1", "128,9", "54,3"], answerIndex: 1, explanation: "104,1 litros por pessoa ao dia.", sourceId: "sinisa-2024" },
    { id: "q059", difficulty:'Médio', prompt: "Qual a tarifa média de água?", options: ["R$ 11,45", "R$ 7,65", "R$ 3,60", "R$ 5,85"], answerIndex: 2, explanation: "R$ 3,60 por m³.", sourceId: "sinisa-2024" },
    { id: "q060", difficulty:'Médio', prompt: "Qual a porcentagem de esgoto coletado?", options: ["84,8%", "95,8%", "99,5%", "60,1%"], answerIndex: 3, explanation: "60,1% do esgoto gerado é coletado.", sourceId: "sinisa-2024" },
    { id: "q061", difficulty:'Médio', prompt: "Qual a porcentagem de esgoto tratado em relação ao gerado?", options: ["60,1%", "84,8%", "100%", "40,9%"], answerIndex: 0, explanation: "60,1% do esgoto gerado recebe tratamento.", sourceId: "sinisa-2024" },
    { id: "q062", difficulty:'Médio', prompt: "Qual o indicador de esgotamento sanitário adequado (IBGE 2022)?", options: ["84,8%", "49,69%", "54,66%", "95,8%"], answerIndex: 1, explanation: "49,69% segundo o IBGE Cidades 2022.", sourceId: "ibge-cidades-2026" },
    { id: "q063", difficulty:'Médio', prompt: "Quantas internações por doenças relacionadas à água?", options: ["3", "33", "427", "13.869"], answerIndex: 2, explanation: "427 internações registradas.", sourceId: "sinisa-2024" },
    { id: "q064", difficulty:'Médio', prompt: "Quantos óbitos por doenças relacionadas à água?", options: ["427", "33", "891", "3"], answerIndex: 3, explanation: "3 óbitos registrados.", sourceId: "sinisa-2024" },
    { id: "q065", difficulty:'Médio', prompt: "Qual o investimento em saneamento per capita?", options: ["R$ 124,70", "R$ 3,60", "R$ 104,10", "R$ 1.621,00"], answerIndex: 0, explanation: "R$ 124,70 por pessoa.", sourceId: "sinisa-2024" },
    { id: "q066", difficulty:'Médio', prompt: "Qual o investimento total em saneamento?", options: ["R$ 14,63 milhões", "R$ 30 milhões", "R$ 55,12 milhões", "R$ 157 milhões"], answerIndex: 1, explanation: "R$ 30 milhões investidos em saneamento.", sourceId: "sinisa-2024" },
    { id: "q067", difficulty:'Médio', prompt: "Qual a pontuação de Anderson Teodoro na pesquisa?", options: ["35,25%", "8,25%", "14,5%", "5,5%"], answerIndex: 2, explanation: "Anderson Teodoro: 14,5%.", sourceId: "tse-pesquisas-2026" },
    { id: "q068", difficulty:'Médio', prompt: "Qual a pontuação de Zé da Imperial?", options: ["14,5%", "5,5%", "3%", "8,25%"], answerIndex: 3, explanation: "Zé da Imperial: 8,25%.", sourceId: "tse-pesquisas-2026" },
    { id: "q069", difficulty:'Médio', prompt: "Qual a pontuação de Baiano dos Cocos?", options: ["5,5%", "3%", "8,25%", "14,5%"], answerIndex: 0, explanation: "Baiano dos Cocos: 5,5%.", sourceId: "tse-pesquisas-2026" },
    { id: "q070", difficulty:'Médio', prompt: "Qual a pontuação de Cambão?", options: ["5,5%", "3%", "8,25%", "14,5%"], answerIndex: 1, explanation: "Cambão: 3,0%.", sourceId: "tse-pesquisas-2026" },
    { id: "q071", difficulty:'Médio', prompt: "Qual a porcentagem que respondeu \"nenhum candidato\"?", options: ["10,25%", "7,75%", "15,5%", "35,25%"], answerIndex: 2, explanation: "15,5% não citaram nenhum candidato.", sourceId: "tse-pesquisas-2026" },
    { id: "q072", difficulty:'Médio', prompt: "Qual a porcentagem de \"não sabe\"?", options: ["15,5%", "7,75%", "14,5%", "10,25%"], answerIndex: 3, explanation: "10,25% não souberam responder.", sourceId: "tse-pesquisas-2026" },
    { id: "q073", difficulty:'Médio', prompt: "Quantos dias de trabalho por mês o simulador usa por padrão?", options: ["22", "20", "30", "25"], answerIndex: 0, explanation: "22 dias úteis por mês.", sourceId: "antt-entorno-2026" },
    { id: "q074", difficulty:'Médio', prompt: "Quantas viagens por dia o simulador usa por padrão?", options: ["1", "2", "3", "4"], answerIndex: 1, explanation: "2 viagens por dia (ida e volta).", sourceId: "antt-entorno-2026" },
    { id: "q075", difficulty:'Médio', prompt: "Quantas empresas novas há no recorte?", options: ["20.096", "22.005", "25.848", "762"], answerIndex: 2, explanation: "25.848 empresas novas no recorte.", sourceId: "caged-sebrae-2026" },
    { id: "q076", difficulty:'Médio', prompt: "Qual o saldo celetista até julho de 2026?", options: ["20.096", "22.005", "25.848", "762"], answerIndex: 3, explanation: "Saldo de +762 postos celetistas.", sourceId: "caged-sebrae-2026" },
    { id: "q077", difficulty:'Médio', prompt: "Quantas pessoas estão formalmente ocupadas?", options: ["22.005", "20.096", "25.848", "762"], answerIndex: 0, explanation: "22.005 pessoas ocupadas.", sourceId: "ibge-cidades-2026" },
    { id: "q078", difficulty:'Médio', prompt: "Qual o valor das receitas brutas realizadas em 2025?", options: ["R$ 771,26 milhões", "R$ 825,11 milhões", "R$ 691,56 milhões", "R$ 138,09 milhões"], answerIndex: 1, explanation: "R$ 825,1 milhões de receitas em 2025.", sourceId: "ibge-cidades-2026" },
    { id: "q079", difficulty:'Médio', prompt: "Qual o valor das despesas brutas empenhadas em 2025?", options: ["R$ 825,11 milhões", "R$ 771,26 milhões", "R$ 691,56 milhões", "R$ 138,09 milhões"], answerIndex: 2, explanation: "R$ 691,6 milhões empenhados em 2025.", sourceId: "ibge-cidades-2026" },
    { id: "q080", difficulty:'Médio', prompt: "Qual a segunda maior função da LOA 2026?", options: ["Educação", "Urbanismo", "Previdência", "Saúde"], answerIndex: 3, explanation: "Saúde recebe R$ 138,1 milhões.", sourceId: "loa-2026" },
    { id: "q081", difficulty:'Difícil', prompt: "Quanto a função Educação recebe na LOA 2026?", options: ["R$ 245,47 milhões", "R$ 138,09 milhões", "R$ 87,55 milhões", "R$ 55,12 milhões"], answerIndex: 0, explanation: "Educação: R$ 245,5 milhões.", sourceId: "loa-2026" },
    { id: "q082", difficulty:'Difícil', prompt: "Quanto a função Saúde recebe na LOA 2026?", options: ["R$ 245,47 milhões", "R$ 138,09 milhões", "R$ 87,55 milhões", "R$ 35 milhões"], answerIndex: 1, explanation: "Saúde: R$ 138,1 milhões.", sourceId: "loa-2026" },
    { id: "q083", difficulty:'Difícil', prompt: "Quanto a função Administração recebe na LOA 2026?", options: ["R$ 138,09 milhões", "R$ 65,47 milhões", "R$ 87,55 milhões", "R$ 55,12 milhões"], answerIndex: 2, explanation: "Administração: R$ 87,6 milhões.", sourceId: "loa-2026" },
    { id: "q084", difficulty:'Difícil', prompt: "Quanto a função Urbanismo recebe na LOA 2026?", options: ["R$ 65,47 milhões", "R$ 87,55 milhões", "R$ 14,63 milhões", "R$ 55,12 milhões"], answerIndex: 3, explanation: "Urbanismo: R$ 55,1 milhões.", sourceId: "loa-2026" },
    { id: "q085", difficulty:'Difícil', prompt: "Quanto a função Encargos especiais recebe na LOA 2026?", options: ["R$ 65,47 milhões", "R$ 35 milhões", "R$ 55,12 milhões", "R$ 14,63 milhões"], answerIndex: 0, explanation: "Encargos especiais: R$ 65,5 milhões.", sourceId: "loa-2026" },
    { id: "q086", difficulty:'Difícil', prompt: "Quanto a função Previdência recebe na LOA 2026?", options: ["R$ 65,47 milhões", "R$ 35 milhões", "R$ 14,63 milhões", "R$ 55,12 milhões"], answerIndex: 1, explanation: "Previdência: R$ 35 milhões.", sourceId: "loa-2026" },
    { id: "q087", difficulty:'Difícil', prompt: "Quanto a função Saneamento recebe na LOA 2026?", options: ["R$ 35 milhões", "R$ 55,12 milhões", "R$ 14,63 milhões", "R$ 65,47 milhões"], answerIndex: 2, explanation: "Saneamento: R$ 14,6 milhões.", sourceId: "loa-2026" },
    { id: "q088", difficulty:'Difícil', prompt: "Qual o maior órgão da LOA 2026?", options: ["FUNDEB", "Fundo Municipal de Saúde", "FUNPREVAL", "Poder Executivo"], answerIndex: 3, explanation: "Poder Executivo: R$ 209 milhões.", sourceId: "loa-2026" },
    { id: "q089", difficulty:'Difícil', prompt: "Quanto o FUNDEB recebe na LOA 2026?", options: ["R$ 175 milhões", "R$ 138,09 milhões", "R$ 111,41 milhões", "R$ 209,03 milhões"], answerIndex: 0, explanation: "FUNDEB: R$ 175 milhões.", sourceId: "loa-2026" },
    { id: "q090", difficulty:'Difícil', prompt: "Quanto o Fundo Municipal de Saúde recebe na LOA 2026?", options: ["R$ 111,41 milhões", "R$ 138,09 milhões", "R$ 175 milhões", "R$ 74,92 milhões"], answerIndex: 1, explanation: "FMS: R$ 138,1 milhões.", sourceId: "loa-2026" },
    { id: "q091", difficulty:'Difícil', prompt: "Quanto o FUNPREVAL recebe na LOA 2026?", options: ["R$ 74,92 milhões", "R$ 138,09 milhões", "R$ 111,41 milhões", "R$ 60,67 milhões"], answerIndex: 2, explanation: "FUNPREVAL: R$ 111,4 milhões.", sourceId: "loa-2026" },
    { id: "q092", difficulty:'Difícil', prompt: "Quanto a Secretaria de Fazenda recebe na LOA 2026?", options: ["R$ 70,47 milhões", "R$ 60,67 milhões", "R$ 111,41 milhões", "R$ 74,92 milhões"], answerIndex: 3, explanation: "Fazenda: R$ 74,9 milhões.", sourceId: "loa-2026" },
    { id: "q093", difficulty:'Difícil', prompt: "Quanto o órgão Educação recebe na LOA 2026?", options: ["R$ 70,47 milhões", "R$ 60,67 milhões", "R$ 74,92 milhões", "R$ 245,47 milhões"], answerIndex: 0, explanation: "Educação (órgão): R$ 70,5 milhões.", sourceId: "loa-2026" },
    { id: "q094", difficulty:'Difícil', prompt: "Quanto Infraestrutura e Obras recebe na LOA 2026?", options: ["R$ 55,12 milhões", "R$ 60,67 milhões", "R$ 74,92 milhões", "R$ 14,63 milhões"], answerIndex: 1, explanation: "Infra: R$ 60,7 milhões.", sourceId: "loa-2026" },
    { id: "q095", difficulty:'Difícil', prompt: "Qual o orçamento planejado por habitante em 2026?", options: ["R$ 2.871,05", "R$ 3.342,28", "R$ 3.085,29", "R$ 2.589,99"], answerIndex: 2, explanation: "LOA 2026 ÷ população estimada — razão de planejamento, não gasto realizado.", sourceId: "loa-2026" },
    { id: "q096", difficulty:'Difícil', prompt: "Qual o valor do crédito adicional da Lei 1.900/2026?", options: ["R$ 900.000,00", "R$ 157.000.000,00", "R$ 14.630.532,88", "R$ 1.657.103,90"], answerIndex: 3, explanation: "Lei 1.900/2026: R$ 1.657.103,90 para a Escola em Tempo Integral.", sourceId: "lei-1900-2026" },
    { id: "q097", difficulty:'Difícil', prompt: "Qual o objeto da Lei 1.900/2026?", options: ["Escola em Tempo Integral", "Ampliação do HEAL", "Pavimentação de vias", "Saneamento básico"], answerIndex: 0, explanation: "A lei cria o projeto Escola em Tempo Integral.", sourceId: "lei-1900-2026" },
    { id: "q098", difficulty:'Difícil', prompt: "Qual o superávit entre receitas e despesas de 2025?", options: ["R$ 771,26 milhões", "R$ 133,55 milhões", "R$ 138,09 milhões", "R$ 157 milhões"], answerIndex: 1, explanation: "Receitas menos despesas empenhadas: R$ 133,6 milhões.", sourceId: "ibge-cidades-2026" },
    { id: "q099", difficulty:'Difícil', prompt: "Qual a densidade demográfica oficial do Censo 2022?", options: ["1.303,21", "954,6", "1.176,61", "1.502,3"], answerIndex: 2, explanation: "1.176,61 hab/km² — indicador oficial do IBGE.", sourceId: "ibge-censo-2022" },
    { id: "q100", difficulty:'Difícil', prompt: "Qual a densidade demográfica derivada de 2026?", options: ["1.176,61", "1.502,3", "1.080,5", "1.303,21"], answerIndex: 3, explanation: "Estimativa 2026 ÷ área: ~1.303 hab/km² (valor derivado).", sourceId: "ibge-estimativas-2026" },
    { id: "q101", difficulty:'Difícil', prompt: "Qual o crescimento populacional entre 2022 e 2026?", options: ["10,76%", "8,42%", "13,16%", "6,72%"], answerIndex: 0, explanation: "Crescimento de ~10,8% no período.", sourceId: "ibge-estimativas-2026" },
    { id: "q102", difficulty:'Difícil', prompt: "Quanto cresceu o eleitorado entre 2018 e 2026?", options: ["15.862", "29.862", "24.806", "4.306"], answerIndex: 1, explanation: "De 95.200 para 125.062: +29.862 eleitores.", sourceId: "tse-eleitorado-2026" },
    { id: "q103", difficulty:'Difícil', prompt: "Qual a margem teórica da pesquisa GO-04133/2026?", options: ["3", "5,5", "4,9", "2,5"], answerIndex: 2, explanation: "Margem teórica de 4,9 pontos percentuais.", sourceId: "tse-pesquisas-2026" },
    { id: "q104", difficulty:'Difícil', prompt: "Quem contratou a pesquisa GO-04133/2026?", options: ["Prefeitura de Águas Lindas", "Câmara Municipal", "Um partido político", "HERZ Locadora de Motos"], answerIndex: 3, explanation: "A contratante registrada é a HERZ Locadora de Motos Ltda.", sourceId: "tse-pesquisas-2026" },
    { id: "q105", difficulty:'Difícil', prompt: "Quando foi feita a coleta da pesquisa?", options: ["25/08/2026", "15/07/2026", "17/09/2026", "13/08/2026"], answerIndex: 0, explanation: "Coleta em 25 de agosto de 2026.", sourceId: "tse-pesquisas-2026" },
    { id: "q106", difficulty:'Difícil', prompt: "Qual o método da pesquisa GO-04133/2026?", options: ["Estimulada", "Espontânea", "Online", "Boca de urna"], answerIndex: 1, explanation: "Pergunta espontânea: o eleitor responde sem cartela de nomes.", sourceId: "tse-pesquisas-2026" },
    { id: "q107", difficulty:'Difícil', prompt: "Quantos leitos de enfermaria o HEAL declara atualmente?", options: ["53", "164", "32", "298"], answerIndex: 2, explanation: "32 leitos de enfermaria declarados.", sourceId: "healgo" },
    { id: "q108", difficulty:'Difícil', prompt: "Quantos leitos de UTI o HEAL declara atualmente?", options: ["32", "164", "298", "53"], answerIndex: 3, explanation: "53 leitos de UTI declarados.", sourceId: "healgo" },
    { id: "q109", difficulty:'Difícil', prompt: "Quantos leitos foram divulgados na abertura do HEAL?", options: ["164", "298", "32", "53"], answerIndex: 0, explanation: "164 leitos no relatório de abertura.", sourceId: "healgo" },
    { id: "q110", difficulty:'Difícil', prompt: "Quantos atendimentos o HEAL registrou no primeiro ano (pelo menos)?", options: ["100 mil", "200 mil", "50 mil", "20 mil"], answerIndex: 1, explanation: "Pelo menos 200 mil atendimentos no primeiro ano.", sourceId: "healgo-200k" },
    { id: "q111", difficulty:'Difícil', prompt: "Qual a área urbanizada do município?", options: ["191,82 km²", "54,66 km²", "43,87 km²", "117,61 km²"], answerIndex: 2, explanation: "43,87 km² de área urbanizada (2019).", sourceId: "ibge-cidades-2026" },
    { id: "q112", difficulty:'Difícil', prompt: "Qual a faixa de IDEB usada como referência de 2025?", options: ["4,9 a 5,5", "6,2 a 7,0", "5,0 a 5,5", "5,7 a 6,2"], answerIndex: 3, explanation: "Faixa 5,7–6,2 como referência secundária do QEdu.", sourceId: "qedu-ideb-2025" },
    { id: "q113", difficulty:'Difícil', prompt: "Qual a fonte da faixa de IDEB 2025?", options: ["QEdu", "INEP", "IBGE", "TSE"], answerIndex: 0, explanation: "Faixa registrada no levantamento do QEdu; o INEP ainda não publicou o valor municipal pontual.", sourceId: "qedu-ideb-2025" },
    { id: "q114", difficulty:'Difícil', prompt: "Qual o custo mensal padrão para Brasília (2 viagens/dia, 22 dias)?", options: ["R$ 336,60", "R$ 503,80", "R$ 257,40", "R$ 589,60"], answerIndex: 1, explanation: "11,45 × 2 × 22 = R$ 503,80.", sourceId: "utb-tarifas" },
    { id: "q115", difficulty:'Difícil', prompt: "Qual a diferença entre a tarifa de Brasília e a de Ceilândia?", options: ["R$ 3,80", "R$ 7,65", "R$ 5,60", "R$ 2,20"], answerIndex: 2, explanation: "R$ 11,45 − R$ 5,85 = R$ 5,60.", sourceId: "utb-tarifas" },
    { id: "q116", difficulty:'Difícil', prompt: "Quanto cresceu o eleitorado entre 2018 e 2024?", options: ["29.862", "15.467", "4.306", "26.588"], answerIndex: 3, explanation: "De 95.200 para 121.788: +26.588 eleitores.", sourceId: "tse-eleitorado-2024" },
    { id: "q117", difficulty:'Difícil', prompt: "Que porcentagem do eleitorado de 2024 correspondeu a votos válidos?", options: ["73,11%", "78,17%", "69,5%", "21,83%"], answerIndex: 0, explanation: "89.039 válidos ÷ 121.788 eleitores ≈ 73,1%.", sourceId: "tse-eleitorado-2024" },
    { id: "q118", difficulty:'Difícil', prompt: "Qual a razão entre eleitorado e população em 2026?", options: ["78,17%", "50,03%", "21,83%", "69,5%"], answerIndex: 1, explanation: "125.062 ÷ 249.978 ≈ 50% — razão estatística, não comparecimento.", sourceId: "tse-eleitorado-2026" },
    { id: "q119", difficulty:'Difícil', prompt: "Quantas matrículas a menos tem a rede municipal em relação ao total da educação básica?", options: ["23.847", "493", "34.291", "4.306"], answerIndex: 2, explanation: "58.138 − 23.847 = 34.291 matrículas de diferença.", sourceId: "pee-go-educacao-2025" },
    { id: "q120", difficulty:'Difícil', prompt: "Qual a terceira maior função da LOA 2026?", options: ["Urbanismo", "Encargos especiais", "Previdência", "Administração"], answerIndex: 3, explanation: "Administração: R$ 87,6 milhões — terceira maior.", sourceId: "loa-2026" },
    { id: "q121", difficulty:'Avançado', prompt: "Por que não se deve somar cobertura de água, coleta e tratamento de esgoto?", options: ["Os indicadores têm bases e denominadores distintos", "São valores do IBGE e não do SINISA", "Os dados são de anos diferentes", "Não há fonte oficial"], answerIndex: 0, explanation: "Nota metodológica do dataset: não somar coberturas como se fossem a mesma métrica.", sourceId: "sinisa-2024" },
    { id: "q122", difficulty:'Avançado', prompt: "O que caracteriza uma pesquisa espontânea?", options: ["O eleitor escolhe entre nomes apresentados", "O eleitor responde sem cartela de nomes", "A coleta é feita por mensagem", "A coleta é feita na saída da urna"], answerIndex: 1, explanation: "Na espontânea, o nome não é sugerido ao entrevistado.", sourceId: "tse-pesquisas-2026" },
    { id: "q123", difficulty:'Avançado', prompt: "Quem calcula a margem de erro da pesquisa no observatório?", options: ["O próprio observatório", "O TSE", "Ninguém — só é exibida quando a ficha oficial existe", "O instituto contratado"], answerIndex: 2, explanation: "A margem não é calculada pelo observatório; o painel só exibe o valor oficial registrado.", sourceId: "tse-pesquisas-2026" },
    { id: "q124", difficulty:'Avançado', prompt: "O que é o eleitorado \"consolidado\" de 125.501?", options: ["Soma de eleitores e votos", "Eleitorado do Distrito Federal", "Projeção para 2028", "Número reconciliado pelo TSE para 2026"], answerIndex: 3, explanation: "O consolidado serve à reconciliação oficial com o TSE.", sourceId: "reconciliacao-eleitorado-2026" },
    { id: "q125", difficulty:'Avançado', prompt: "O que representa a diferença de 439 eleitores?", options: ["Divergência entre o snapshot da zona e o consolidado do TSE", "Erro do IBGE", "Total de votos nulos", "Abstenções de 2024"], answerIndex: 0, explanation: "A zona registrou 125.062; o consolidado do TSE, 125.501.", sourceId: "reconciliacao-eleitorado-2026" },
    { id: "q126", difficulty:'Avançado', prompt: "Qual o efeito da decisão judicial sobre a GO-04133/2026?", options: ["Anulou automaticamente a pesquisa", "Reconheceu irregularidade formal na divulgação de publicações específicas", "Cassou um candidato", "Multou o instituto"], answerIndex: 1, explanation: "A decisão reconheceu irregularidade formal na divulgação, sem anulação automática.", sourceId: "tre-go-decisao-go04133-2026" },
    { id: "q127", difficulty:'Avançado', prompt: "A decisão judicial anulou a pesquisa GO-04133?", options: ["Sim, integralmente", "Sim, apenas em parte", "Não — admitiu nova divulgação com as informações exigidas", "Sim, até 2028"], answerIndex: 2, explanation: "O contexto não deve ser apresentado como anulação automática do levantamento.", sourceId: "tre-go-decisao-go04133-2026" },
    { id: "q128", difficulty:'Avançado', prompt: "Quando foi a decisão judicial sobre a pesquisa?", options: ["25/08/2026", "15/07/2026", "13/08/2026", "17/09/2026"], answerIndex: 3, explanation: "Referência de 17 de setembro de 2026.", sourceId: "tre-go-decisao-go04133-2026" },
    { id: "q129", difficulty:'Avançado', prompt: "Qual a data de referência da estimativa populacional de 2026?", options: ["1º de julho de 2026", "31 de dezembro de 2026", "15 de julho de 2026", "1º de janeiro de 2026"], answerIndex: 0, explanation: "As estimativas do IBGE têm referência em 1º de julho.", sourceId: "ibge-estimativas-2026" },
    { id: "q130", difficulty:'Avançado', prompt: "Por que a densidade de 2026 é marcada como \"derivada\"?", options: ["Porque é um cálculo do TSE", "Estimativa populacional ÷ área territorial, não indicador oficial", "Porque a área mudou em 2026", "Porque vem da LOA"], answerIndex: 1, explanation: "A densidade derivada não substitui o indicador oficial do Censo.", sourceId: "ibge-estimativas-2026" },
    { id: "q131", difficulty:'Avançado', prompt: "O que o orçamento por habitante representa?", options: ["Gasto efetivo por habitante", "Receita por eleitor", "Razão de planejamento, não gasto realizado", "Investimento por domicílio"], answerIndex: 2, explanation: "LOA ÷ população estimada é uma razão de planejamento.", sourceId: "loa-2026" },
    { id: "q132", difficulty:'Avançado', prompt: "A faixa de IDEB 5,7–6,2 deve ser tratada como?", options: ["Nota oficial do INEP", "Cálculo do observatório", "Média estadual de Goiás", "Referência secundária, não nota municipal oficial"], answerIndex: 3, explanation: "O valor municipal pontual de 2025 ainda não foi materializado no snapshot.", sourceId: "qedu-ideb-2025" },
    { id: "q133", difficulty:'Avançado', prompt: "A razão eleitorado/população é?", options: ["Uma razão estatística entre universos distintos", "Uma taxa de comparecimento", "Uma taxa de abstenção", "Receita per capita"], answerIndex: 0, explanation: "A razão não é comparecimento — os universos são distintos.", sourceId: "tse-eleitorado-2026" },
    { id: "q134", difficulty:'Avançado', prompt: "O comparecimento de 78,17% em 2024 inclui votos brancos e nulos?", options: ["Não, só votos válidos", "Sim — comparecimento soma válidos, brancos e nulos", "Não, só votos nominais", "Não, só votos de prefeito"], answerIndex: 1, explanation: "Válidos + brancos + nulos ÷ eleitorado = 78,17%.", sourceId: "tse-eleitorado-2024" },
    { id: "q135", difficulty:'Avançado', prompt: "O que é a categoria \"não classificadas\" (7,75%) da pesquisa?", options: ["Votos nulos", "Eleitores ausentes", "Respostas não classificadas nas categorias divulgadas", "Votos brancos"], answerIndex: 2, explanation: "7,75% das respostas ficaram fora das categorias divulgadas.", sourceId: "tse-pesquisas-2026" },
    { id: "q136", difficulty:'Avançado', prompt: "O que significa o \"nenhum candidato\" (15,5%) da pesquisa?", options: ["Não souberam responder", "Recusaram a entrevista", "Votaram nulo", "Entrevistados que não citaram nenhum candidato"], answerIndex: 3, explanation: "Categoria distinta de \"não sabe\" (10,25%).", sourceId: "tse-pesquisas-2026" },
    { id: "q137", difficulty:'Avançado', prompt: "Qual órgão publica a tabela da tarifa para Brasília?", options: ["UTB", "ANTT", "TSE", "Governo de Goiás"], answerIndex: 0, explanation: "A tarifa de Brasília vem da tabela publicada pela UTB.", sourceId: "utb-tarifas" },
    { id: "q138", difficulty:'Avançado', prompt: "Como são classificados os trechos para Taguatinga e Ceilândia?", options: ["Tarifa urbana municipal", "Tarifa semiurbana do Entorno do DF (ANTT/Taguatur)", "Tarifa intermunicipal goiana", "Tarifa noturna"], answerIndex: 1, explanation: "O hero contextualiza a tarifa semiurbana do Entorno-DF.", sourceId: "antt-entorno-2026" },
    { id: "q139", difficulty:'Avançado', prompt: "Que fator o cálculo do transporte usa para converter dias por semana em mês?", options: ["4", "5", "4,4", "4,5"], answerIndex: 2, explanation: "A conversão semanal para mensal usa 4,4 semanas.", sourceId: "antt-entorno-2026" },
    { id: "q140", difficulty:'Avançado', prompt: "Qual a fonte do snapshot de eleitorado de 2026?", options: ["IBGE Cidades", "LOA 2026", "SINISA 2024", "TSE · snapshot de 15/07/2026"], answerIndex: 3, explanation: "O eleitorado vem do snapshot TSE de julho de 2026.", sourceId: "tse-eleitorado-2026" },
    { id: "q141", difficulty:'Avançado', prompt: "Qual a fonte do orçamento de 2026?", options: ["Lei Orçamentária Anual (LOA 2026)", "TSE", "IBGE", "CAGED"], answerIndex: 0, explanation: "Os valores autorizados vêm da LOA 2026.", sourceId: "loa-2026" },
    { id: "q142", difficulty:'Avançado', prompt: "Qual a fonte do recorte de empresas ativas?", options: ["IBGE Cidades", "CAGED/Sebrae 2026", "TSE", "SINISA"], answerIndex: 1, explanation: "O recorte de empresas vem do CAGED/Sebrae.", sourceId: "caged-sebrae-2026" },
    { id: "q143", difficulty:'Avançado', prompt: "Qual a fonte da taxa de homicídios?", options: ["SSP-GO", "IBGE Cidades", "Atlas da Violência", "TSE"], answerIndex: 2, explanation: "A taxa vem do Atlas da Violência.", sourceId: "atlas-violencia-2026" },
    { id: "q144", difficulty:'Avançado', prompt: "Qual a fonte do PIB per capita?", options: ["TSE", "Sebrae", "QEdu", "IBGE Cidades"], answerIndex: 3, explanation: "O PIB per capita de 2023 vem do IBGE Cidades.", sourceId: "ibge-cidades-2026" },
    { id: "q145", difficulty:'Avançado', prompt: "Qual a fonte do IDEB 2023?", options: ["INEP", "QEdu", "IBGE", "SEDUC-GO"], answerIndex: 0, explanation: "O IDEB é produzido pelo INEP.", sourceId: "inep-2023" },
    { id: "q146", difficulty:'Avançado', prompt: "De onde vem a taxa de escolarização de 6 a 14 anos?", options: ["INEP", "IBGE Cidades (Censo 2022)", "TSE", "SINISA"], answerIndex: 1, explanation: "Indicador do IBGE Cidades com base no Censo 2022.", sourceId: "ibge-cidades-2026" },
    { id: "q147", difficulty:'Avançado', prompt: "Se 100% do esgoto coletado é tratado, por que o tratamento do gerado é 60,1%?", options: ["Por falha na estação de tratamento", "Por erro de coleta de dados", "Porque apenas 60,1% do esgoto gerado é coletado", "Porque os dados são de anos diferentes"], answerIndex: 2, explanation: "Tudo o que é coletado é tratado; o gargalo está na coleta.", sourceId: "sinisa-2024" },
    { id: "q148", difficulty:'Avançado', prompt: "A perda de 40,9% na distribuição indica que?", options: ["O esgoto é tratado", "O consumo é alto", "A hidrometração é baixa", "Quase metade da água distribuída não chega a gerar faturamento"], answerIndex: 3, explanation: "Perda na rede de distribuição de água.", sourceId: "sinisa-2024" },
    { id: "q149", difficulty:'Avançado', prompt: "O consumo de 104,1 litros/pessoa/dia refere-se a?", options: ["Consumo médio de água distribuída", "Esgoto tratado", "Consumo de energia", "Coleta de lixo"], answerIndex: 0, explanation: "Indicador de consumo de água do SINISA.", sourceId: "sinisa-2024" },
    { id: "q150", difficulty:'Avançado', prompt: "O investimento per capita em saneamento (R$ 124,70) resulta de?", options: ["LOA 2026 ÷ eleitorado", "Investimento em saneamento ÷ população", "Tarifa de água × consumo", "Receita própria de 2025"], answerIndex: 1, explanation: "Razão entre investimento e população do recorte.", sourceId: "sinisa-2024" },
    { id: "q151", difficulty:'Avançado', prompt: "Como é definido o recorte público de candidatos?", options: ["Todos os candidatos de Goiás", "Lista oficial do TSE de eleitos", "Watchlist editorial com evidência documental local", "Candidatos com registro suspenso"], answerIndex: 2, explanation: "O recorte usa watchlist com evidência de vínculo local.", sourceId: "tse-candidatos-2026" },
    { id: "q152", difficulty:'Avançado', prompt: "O que é o SQ_CANDIDATO?", options: ["Número de urna", "Título de eleitor", "Número da pesquisa", "Identificador único do candidato nos sistemas do TSE"], answerIndex: 3, explanation: "Cada candidato possui um SQ_CANDIDATO exclusivo.", sourceId: "tse-candidatos-2026" },
    { id: "q153", difficulty:'Avançado', prompt: "O registro de nome social no eleitorado garante?", options: ["Identificação conforme a identidade da pessoa eleitora", "Voto em separado", "Isenção de fila", "Candidatura automática"], answerIndex: 0, explanation: "891 registros de nome social no município.", sourceId: "tse-eleitorado-2026" },
    { id: "q154", difficulty:'Avançado', prompt: "O que são as 493 matrículas de EPT?", options: ["Ensino superior", "Ensino Médio técnico articulado", "EJA — educação de jovens e adultos", "Educação infantil"], answerIndex: 1, explanation: "EPT: Educação Profissional e Tecnológica.", sourceId: "pee-go-ept-2025" },
    { id: "q155", difficulty:'Avançado', prompt: "Qual o status cadastral dos 7 candidatos do recorte público?", options: ["INDEFERIDO", "SUB JUDICE", "DEFERIDO", "PENDENTE"], answerIndex: 2, explanation: "Todos os mapeados têm registro deferido.", sourceId: "tse-candidatos-2026" },
    { id: "q156", difficulty:'Avançado', prompt: "Quantos candidatos há no recorte público mapeado?", options: ["5", "10", "3", "7"], answerIndex: 3, explanation: "O recorte público possui 7 nomes mapeados.", sourceId: "tse-candidatos-2026" },
    { id: "q157", difficulty:'Avançado', prompt: "Como usar snapshot da zona e consolidado do TSE?", options: ["Zona para o painel local; consolidado para reconciliação oficial", "Sempre o consolidado", "Sempre o snapshot", "Nenhum dos dois"], answerIndex: 0, explanation: "Os dois números têm funções distintas na apuração.", sourceId: "reconciliacao-eleitorado-2026" },
    { id: "q158", difficulty:'Avançado', prompt: "Por que o simulador usa o salário mínimo do dataset?", options: ["Para reajustar tarifas", "Como referência para comparar o custo da passagem", "Porque a tarifa é indexada", "Para calcular impostos"], answerIndex: 1, explanation: "A comparação contextualiza o peso da tarifa no orçamento familiar.", sourceId: "antt-entorno-2026" },
    { id: "q159", difficulty:'Avançado', prompt: "Além do quiz, como conferir cada número citado nas perguntas?", options: ["Só por mensagem ao autor", "Baixando o app do TSE", "No painel de fontes e evidências do observatório", "Não é possível conferir"], answerIndex: 2, explanation: "O observatório publica o registro de fontes de cada indicador.", sourceId: "ibge-cidades-2026" },
    { id: "q160", difficulty:'Avançado', prompt: "Por que o quiz exige 60% de acerto para liberar a fase seguinte?", options: ["Por exigência do TSE", "Porque o INEP define assim", "Para limitar o tempo de uso", "Para garantir retenção do essencial antes de avançar"], answerIndex: 3, explanation: "A progressão por fases reforça o aprendizado essencial.", sourceId: "ibge-cidades-2026" },
    { id: "q161", difficulty:'Expert', prompt: "Qual o valor exato da densidade demográfica oficial de 2022?", options: ["1.176,61", "1.176,16", "1.177,61", "1.167,61"], answerIndex: 0, explanation: "Valor informado pelo IBGE para o Censo 2022: 1.176,61 hab/km².", sourceId: "ibge-censo-2022" },
    { id: "q162", difficulty:'Expert', prompt: "Qual o valor exato da densidade derivada de 2026?", options: ["1.303,41", "1.303,21", "1.033,14", "1.314,03"], answerIndex: 1, explanation: "249.978 ÷ 191,817 ≈ 1.303 hab/km² (derivada).", sourceId: "ibge-estimativas-2026" },
    { id: "q163", difficulty:'Expert', prompt: "Qual o comparecimento de 2024 com duas casas decimais?", options: ["78,71%", "78,07%", "78,17%", "71,87%"], answerIndex: 2, explanation: "78,17% de comparecimento.", sourceId: "tse-eleitorado-2024" },
    { id: "q164", difficulty:'Expert', prompt: "Qual a abstenção de 2024 com duas casas decimais?", options: ["21,38%", "21,88%", "28,13%", "21,83%"], answerIndex: 3, explanation: "21,83% de abstenção.", sourceId: "tse-eleitorado-2024" },
    { id: "q165", difficulty:'Expert', prompt: "Qual a porcentagem exata de mulheres no eleitorado?", options: ["52,98%", "52,89%", "52,99%", "29,89%"], answerIndex: 0, explanation: "52,98% do eleitorado são mulheres.", sourceId: "tse-eleitorado-2026" },
    { id: "q166", difficulty:'Expert', prompt: "Qual a perda exata na distribuição de água?", options: ["40,09%", "40,9%", "49%", "4,09%"], answerIndex: 1, explanation: "40,9% de perda na distribuição.", sourceId: "sinisa-2024" },
    { id: "q167", difficulty:'Expert', prompt: "Qual a taxa exata de hidrometração?", options: ["99,05%", "95,9%", "99,5%", "9,95%"], answerIndex: 2, explanation: "99,5% de hidrometração.", sourceId: "sinisa-2024" },
    { id: "q168", difficulty:'Expert', prompt: "Qual a porcentagem exata de esgoto coletado?", options: ["61%", "60,01%", "6,01%", "60,1%"], answerIndex: 3, explanation: "60,1% de coleta de esgoto.", sourceId: "sinisa-2024" },
    { id: "q169", difficulty:'Expert', prompt: "Qual o valor exato do esgotamento adequado (IBGE)?", options: ["49,69%", "49,96%", "46,99%", "44,96%"], answerIndex: 0, explanation: "49,69% de esgotamento adequado.", sourceId: "ibge-cidades-2026" },
    { id: "q170", difficulty:'Expert', prompt: "Qual o valor exato da arborização de vias públicas?", options: ["54,46%", "54,66%", "56,64%", "45,66%"], answerIndex: 1, explanation: "54,66% de arborização.", sourceId: "ibge-cidades-2026" },
    { id: "q171", difficulty:'Expert', prompt: "Qual o consumo exato de água por pessoa ao dia?", options: ["104,01", "110,4", "104,1", "101,4"], answerIndex: 2, explanation: "104,1 litros por pessoa ao dia.", sourceId: "sinisa-2024" },
    { id: "q172", difficulty:'Expert', prompt: "Qual a tarifa exata de água por m³?", options: ["R$ 3,06", "R$ 36,00", "R$ 6,30", "R$ 3,60"], answerIndex: 3, explanation: "R$ 3,60 por metro cúbico.", sourceId: "sinisa-2024" },
    { id: "q173", difficulty:'Expert', prompt: "Qual a mortalidade infantil exata?", options: ["11,23", "11,32", "12,13", "1,12"], answerIndex: 0, explanation: "11,23 óbitos por mil nascidos vivos.", sourceId: "ibge-cidades-2026" },
    { id: "q174", difficulty:'Expert', prompt: "Qual a taxa exata de homicídios?", options: ["18,07", "18,7", "17,8", "8,71"], answerIndex: 1, explanation: "18,7 por 100 mil habitantes.", sourceId: "atlas-violencia-2026" },
    { id: "q175", difficulty:'Expert', prompt: "Qual a pontuação exata de Keké?", options: ["35,52%", "35,2%", "35,25%", "32,55%"], answerIndex: 2, explanation: "35,25% na espontânea.", sourceId: "tse-pesquisas-2026" },
    { id: "q176", difficulty:'Expert', prompt: "Qual a pontuação exata de Anderson Teodoro?", options: ["15,4%", "14,05%", "41,5%", "14,5%"], answerIndex: 3, explanation: "14,5%.", sourceId: "tse-pesquisas-2026" },
    { id: "q177", difficulty:'Expert', prompt: "Qual a pontuação exata de Zé da Imperial?", options: ["8,25%", "8,52%", "8,2%", "82,5%"], answerIndex: 0, explanation: "8,25%.", sourceId: "tse-pesquisas-2026" },
    { id: "q178", difficulty:'Expert', prompt: "Qual a pontuação exata de Baiano dos Cocos?", options: ["5,05%", "5,5%", "55%", "5,55%"], answerIndex: 1, explanation: "5,5%.", sourceId: "tse-pesquisas-2026" },
    { id: "q179", difficulty:'Expert', prompt: "Qual a pontuação exata de Cambão?", options: ["3,3%", "0,3%", "3%", "30%"], answerIndex: 2, explanation: "3,0%.", sourceId: "tse-pesquisas-2026" },
    { id: "q180", difficulty:'Expert', prompt: "Qual a porcentagem exata de respostas não classificadas?", options: ["7,57%", "7,5%", "77,5%", "7,75%"], answerIndex: 3, explanation: "7,75%.", sourceId: "tse-pesquisas-2026" },
    { id: "q181", difficulty:'Expert', prompt: "Qual a porcentagem exata de \"nenhum candidato\"?", options: ["15,5%", "15,05%", "51,5%", "1,55%"], answerIndex: 0, explanation: "15,5%.", sourceId: "tse-pesquisas-2026" },
    { id: "q182", difficulty:'Expert', prompt: "Qual a porcentagem exata de \"não sabe\"?", options: ["10,52%", "10,25%", "10,2%", "102,5%"], answerIndex: 1, explanation: "10,25%.", sourceId: "tse-pesquisas-2026" },
    { id: "q183", difficulty:'Expert', prompt: "Qual a margem teórica exata da pesquisa?", options: ["4,09", "9,4", "4,9", "4,4"], answerIndex: 2, explanation: "4,9 pontos percentuais.", sourceId: "tse-pesquisas-2026" },
    { id: "q184", difficulty:'Expert', prompt: "Qual a diferença exata entre zona e consolidado?", options: ["493", "934", "349", "439"], answerIndex: 3, explanation: "125.501 − 125.062 = 439.", sourceId: "reconciliacao-eleitorado-2026" },
    { id: "q185", difficulty:'Expert', prompt: "Quantos registros de nome social existem?", options: ["891", "918", "8.910", "941"], answerIndex: 0, explanation: "891 registros.", sourceId: "tse-eleitorado-2026" },
    { id: "q186", difficulty:'Expert', prompt: "Qual a população indígena exata no recorte do TSE?", options: ["914", "941", "891", "9.410"], answerIndex: 1, explanation: "941 pessoas.", sourceId: "tse-eleitorado-2026" },
    { id: "q187", difficulty:'Expert', prompt: "Quantos eleitores indígenas exatos?", options: ["303", "93", "33", "39"], answerIndex: 2, explanation: "33 eleitores indígenas.", sourceId: "tse-eleitorado-2026" },
    { id: "q188", difficulty:'Expert', prompt: "Quantos votos brancos exatos em 2024?", options: ["3.320", "323", "32.300", "3.230"], answerIndex: 3, explanation: "3.230 votos brancos.", sourceId: "tse-eleitorado-2024" },
    { id: "q189", difficulty:'Expert', prompt: "Quantos votos nulos exatos em 2024?", options: ["2.934", "2.943", "293", "9.234"], answerIndex: 0, explanation: "2.934 votos nulos.", sourceId: "tse-eleitorado-2024" },
    { id: "q190", difficulty:'Expert', prompt: "Quantos votos válidos exatos em 2024?", options: ["89.309", "89.039", "89.093", "80.939"], answerIndex: 1, explanation: "89.039 votos válidos.", sourceId: "tse-eleitorado-2024" },
    { id: "q191", difficulty:'Expert', prompt: "Quantas abstenções exatas em 2024?", options: ["26.558", "25.685", "26.585", "26.855"], answerIndex: 2, explanation: "26.585 abstenções.", sourceId: "tse-eleitorado-2024" },
    { id: "q192", difficulty:'Expert', prompt: "Quantas empresas ativas exatas no recorte?", options: ["20.690", "20.069", "20.960", "20.096"], answerIndex: 3, explanation: "20.096 empresas ativas.", sourceId: "caged-sebrae-2026" },
    { id: "q193", difficulty:'Expert', prompt: "Quantas empresas novas exatas no recorte?", options: ["25.848", "25.488", "25.884", "28.548"], answerIndex: 0, explanation: "25.848 empresas novas.", sourceId: "caged-sebrae-2026" },
    { id: "q194", difficulty:'Expert', prompt: "Qual o saldo celetista exato até julho de 2026?", options: ["726", "762", "7.620", "276"], answerIndex: 1, explanation: "+762 postos.", sourceId: "caged-sebrae-2026" },
    { id: "q195", difficulty:'Expert', prompt: "Quantas pessoas ocupadas exatas?", options: ["22.050", "20.205", "22.005", "22.500"], answerIndex: 2, explanation: "22.005 pessoas ocupadas.", sourceId: "ibge-cidades-2026" },
    { id: "q196", difficulty:'Expert', prompt: "Qual a área urbanizada exata?", options: ["43,78", "48,37", "34,87", "43,87"], answerIndex: 3, explanation: "43,87 km².", sourceId: "ibge-cidades-2026" },
    { id: "q197", difficulty:'Expert', prompt: "Qual o valor exato das receitas brutas de 2025?", options: ["R$ 825,11 milhões", "R$ 852,11 milhões", "R$ 815,11 milhões", "R$ 825,12 milhões"], answerIndex: 0, explanation: "R$ 825.112.043,10.", sourceId: "ibge-cidades-2026" },
    { id: "q198", difficulty:'Expert', prompt: "Qual o valor exato das despesas empenhadas de 2025?", options: ["R$ 698,16 milhões", "R$ 691,56 milhões", "R$ 661,59 milhões", "R$ 961,56 milhões"], answerIndex: 1, explanation: "R$ 691.558.004,38.", sourceId: "ibge-cidades-2026" },
    { id: "q199", difficulty:'Expert', prompt: "Qual o valor exato do investimento em saneamento?", options: ["R$ 33 milhões", "R$ 3 milhões", "R$ 30 milhões", "R$ 36,71 milhões"], answerIndex: 2, explanation: "R$ 30.004.882,01.", sourceId: "sinisa-2024" },
    { id: "q200", difficulty:'Expert', prompt: "Qual o valor exato do investimento per capita em saneamento?", options: ["R$ 124,07", "R$ 142,70", "R$ 120,47", "R$ 124,70"], answerIndex: 3, explanation: "R$ 124,70 por pessoa.", sourceId: "sinisa-2024" },
];

if (QUESTION_BANK.length !== QUIZ_TOTAL) {
  throw new Error('Contrato do quiz violado: QUESTION_BANK deve conter exatamente ' + QUIZ_TOTAL + ' perguntas.');
}
if (!QUIZ_LEVELS.every(level => QUESTION_BANK.filter(q => q.difficulty === level).length === QUESTIONS_PER_LEVEL)) {
  throw new Error('Contrato do quiz violado: cada nível deve conter exatamente ' + QUESTIONS_PER_LEVEL + ' perguntas.');
}

const PHASES = QUIZ_LEVELS.map((level, index) => ({ level, index, questions: QUESTION_BANK.filter(q => q.difficulty === level) }));
const PASS_THRESHOLD = Math.ceil(QUESTIONS_PER_LEVEL * 0.6);

export function QuickQuiz() {
  const [unlockedPhase, setUnlockedPhase] = useState(0);
  const [activePhase, setActivePhase] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<readonly number[]>([0, 0, 0, 0, 0]);
  const [showResult, setShowResult] = useState(false);
  const [shared, setShared] = useState('');
  const [leaderboard, setLeaderboard] = useState<readonly QuizHighScore[]>([]);

  useEffect(() => {
    setLeaderboard(readQuizHighScores());
  }, []);

  const phaseData = PHASES[activePhase];
  const questions = phaseData?.questions ?? [];
  const totalQuestions = questions.length;
  const safeIndex = Math.min(index, totalQuestions - 1);
  const question = totalQuestions > 0 ? questions[safeIndex] : undefined;
  const nextIndex = safeIndex + 1;
  const isLast = nextIndex >= totalQuestions;
  const unlockedNext = activePhase < QUIZ_LEVELS.length - 1 && unlockedPhase > activePhase;

  const startPhase = (phaseIndex: number) => {
    setActivePhase(phaseIndex);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setShared('');
  };

  const answer = (optionIndex: number) => {
    if (selected !== null || !question) return;
    setSelected(optionIndex);
    if (optionIndex === question.answerIndex) setScore(previous => previous + 1);
  };

  const next = () => {
    if (selected === null || !question) return;
    if (isLast) {
      // Include the answer just selected: React state updates are asynchronous.
      const finalScore = score + (selected === question.answerIndex ? 1 : 0);
      const nextScores = best.map((value, phaseIndex) => (phaseIndex === activePhase ? Math.max(value, finalScore) : value));
      setBest(nextScores);
      if (finalScore >= PASS_THRESHOLD && activePhase < QUIZ_LEVELS.length - 1) {
        setUnlockedPhase(previous => Math.max(previous, activePhase + 1));
      }
      const nextLeaderboard = recordQuizHighScore({
        phase: activePhase + 1,
        level: phaseData?.level ?? 'Nível',
        score: finalScore,
        total: QUESTIONS_PER_LEVEL,
        percentage: Math.round((finalScore / QUESTIONS_PER_LEVEL) * 100),
        playedAt: new Date().toISOString(),
      });
      setLeaderboard(nextLeaderboard);
      setShowResult(true);
      return;
    }
    setIndex(nextIndex);
    setSelected(null);
  };

  const restart = () => startPhase(activePhase);

  const share = async () => {
    const text = 'Observatório Eleitoral Águas Lindas 2026 — quiz: ' + score + ' de ' + QUESTIONS_PER_LEVEL + ' acertos na fase ' + (activePhase + 1) + ' (' + (phaseData?.level ?? '') + ').';
    try {
      if (navigator.share) {
        await navigator.share({ text });
        setShared('Compartilhado!');
      } else {
        await navigator.clipboard.writeText(text);
        setShared('Copiado!');
      }
    } catch {
      setShared('');
    }
  };

  return (
    <section id="quiz" className="quiz-shell" aria-labelledby="quiz-title">
      <header className="quiz-head">
        <p className="quiz-kicker">Aprenda conferindo as fontes</p>
        <h2 id="quiz-title">Quiz de dados · 2026</h2>
        <p className="quiz-subtitle">{QUIZ_TOTAL} perguntas · {QUIZ_LEVELS.length} fases · 40 por fase. Cada resposta mostra sua fonte.</p>
      </header>

      <div className="quiz-phase-grid" role="list" aria-label="Fases do quiz">
        {PHASES.map((phase, index) => {
          const locked = index > unlockedPhase;
          const isActive = index === activePhase && !showResult;
          const phaseBest = best[index] ?? 0;
          return (
            <button
              key={phase.level}
              type="button"
              role="listitem"
              disabled={locked}
              aria-disabled={locked}
              aria-label={locked ? 'Fase ' + (index + 1) + ', ' + phase.level + ', bloqueada. Libere com 60% na fase anterior.' : 'Fase ' + (index + 1) + ', ' + phase.level + ', disponível.'}
              onClick={() => startPhase(index)}
              className={'quiz-phase-card' + (isActive ? ' is-active' : '') + (locked ? ' is-locked' : '')}
            >
              <span className="quiz-phase-kicker">Fase {index + 1}</span>
              <strong className="quiz-phase-name">{phase.level}</strong>
              <span className="quiz-phase-meta">{locked ? 'Bloqueada' : QUESTIONS_PER_LEVEL + ' perguntas'}</span>
              <span className="quiz-phase-best">{locked ? 'Complete a fase anterior com 60% para liberar' : 'Melhor marca: ' + phaseBest + '/' + QUESTIONS_PER_LEVEL}</span>
              {locked ? <Lock className="quiz-phase-lock" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      <aside className="quiz-high-scores" aria-labelledby="quiz-high-scores-title">
        <div className="quiz-high-scores-head">
          <div>
            <div className="quiz-phase-kicker">Sua marca</div>
            <h3 id="quiz-high-scores-title"><Trophy className="h-4 w-4" aria-hidden="true" /> Melhores resultados</h3>
          </div>
          <span>{leaderboard.length ? leaderboard.length + ' registros' : 'Seu primeiro resultado aparece aqui'}</span>
        </div>
        {leaderboard.length ? (
          <ol className="quiz-high-scores-list">
            {leaderboard.slice(0, 5).map((entry, index) => (
              <li key={entry.id} className="quiz-high-score-row">
                <span className="quiz-high-score-rank"><Medal className="h-3.5 w-3.5" aria-hidden="true" /> {index + 1}</span>
                <span className="min-w-0">
                  <strong>Fase {entry.phase} · {entry.level}</strong>
                  <small>{new Date(entry.playedAt).toLocaleDateString('pt-BR')} · {entry.percentage}%</small>
                </span>
                <b>{entry.score}/{entry.total}</b>
              </li>
            ))}
          </ol>
        ) : (
          <p className="quiz-high-scores-empty">Conclua uma fase para registrar sua marca neste dispositivo. Nada é enviado para um servidor.</p>
        )}
      </aside>

      {showResult ? (
        <div className="quiz-card quiz-result" role="status">
          <CheckCircle2 className="quiz-result-icon" aria-hidden="true" />
          <h3>Fase {activePhase + 1} · {phaseData?.level} concluída</h3>
          <p className="quiz-result-score">{score + (selected === question?.answerIndex ? 1 : 0)} de {QUESTIONS_PER_LEVEL} acertos</p>
          <p className="quiz-result-hint">{score >= PASS_THRESHOLD ? 'Resultado registrado. A fonte de cada resposta está disponível no painel de fontes.' : 'Revise o Resumo e tente novamente. A próxima fase exige 60% de acertos.'}</p>
          <div className="quiz-result-actions">
            <button type="button" onClick={restart} className="quiz-action"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Refazer fase</button>
            <button type="button" onClick={() => { void share(); }} className="quiz-action"><Share2 className="h-4 w-4" aria-hidden="true" /> Compartilhar</button>
            {unlockedNext ? (
              <button type="button" onClick={() => startPhase(activePhase + 1)} className="quiz-action is-primary">Próxima fase →</button>
            ) : null}
          </div>
          {shared ? <span className="quiz-shared" role="status">{shared}</span> : null}
        </div>
      ) : null}

      {!showResult && question ? (
        <div className="quiz-card">
          <div className="quiz-progress" aria-label={'Pergunta ' + (safeIndex + 1) + ' de ' + totalQuestions}>
            <div className="quiz-progress-track">
              <div className="quiz-progress-fill" style={{ width: (((safeIndex + (selected !== null ? 1 : 0)) / totalQuestions) * 100) + '%' }} />
            </div>
            <span className="quiz-progress-label">{safeIndex + 1} / {totalQuestions}</span>
          </div>
          <p className="quiz-prompt">{question.prompt}</p>
          <div className="quiz-options" role="group" aria-label="Alternativas">
            {question.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex;
              const reveal = selected !== null;
              const isCorrect = optionIndex === question.answerIndex;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => answer(optionIndex)}
                  disabled={reveal}
                  aria-pressed={isSelected}
                  className={'quiz-option' + (isSelected ? ' is-selected' : '') + (reveal && isCorrect ? ' is-correct' : '') + (reveal && isSelected && !isCorrect ? ' is-wrong' : '')}
                >
                  <span className="quiz-option-dot" aria-hidden="true" />
                  <span className="quiz-option-text">{option}</span>
                  {reveal && isCorrect ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
          {selected !== null ? (
            <div className={'quiz-feedback ' + (selected === question.answerIndex ? 'correct' : 'wrong')} role="status">
              <strong>{selected === question.answerIndex ? 'Resposta correta' : 'Resposta conferida'}</strong>
              <p>{question.explanation}</p>
            </div>
          ) : null}
          <div className="quiz-footer">
            <span>{selected !== null ? 'Resposta registrada' : 'Escolha uma resposta'}</span>
            <button type="button" onClick={next} disabled={selected === null} className="quiz-next">
              {isLast ? 'Finalizar fase' : 'Próxima'} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
