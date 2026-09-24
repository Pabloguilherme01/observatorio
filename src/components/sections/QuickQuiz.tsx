import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

type Difficulty = 'Fácil' | 'Médio' | 'Difícil' | 'Avançado';

type Question = {
  readonly difficulty: Difficulty;
  readonly prompt: string;
  readonly options: readonly string[];
  readonly answer: number;
  readonly explanation: string;
  readonly anchor: string;
  readonly sourceLabel: string;
};

const LEVELS: readonly Difficulty[] = ['Fácil', 'Médio', 'Difícil', 'Avançado'];

export function QuickQuiz() {
  const questions = useMemo<readonly Question[]>(() => [
    {
      prompt: "Para interpretar um número público corretamente, o que vale conferir junto com ele?",
      options: ["Fonte e data de referência","A cor do gráfico","Somente o valor absoluto"],
      answer: 0,
      explanation: "A fonte e a data ajudam a identificar de onde veio o dado e qual período ou fotografia ele representa.",
      anchor: "fontes",
      sourceLabel: "Mapa de evidências",
    },
    {
      prompt: "Um snapshot do eleitorado representa melhor qual ideia?",
      options: ["Uma fotografia de uma base em determinada data","Uma previsão de voto","O resultado final da eleição"],
      answer: 0,
      explanation: "Snapshots representam uma fotografia de uma base em determinada data, não previsão nem resultado.",
      anchor: "eleitorado",
      sourceLabel: "Perfil eleitoral",
    },
    {
      prompt: "Como ler a LOA 2026 dentro do observatório?",
      options: ["Como orçamento previsto para o exercício","Como gasto já executado integralmente","Como uma pesquisa de opinião"],
      answer: 0,
      explanation: "A LOA é uma peça orçamentária de planejamento e previsão.",
      anchor: "orcamento",
      sourceLabel: "Orçamento",
    },
    {
      prompt: "Por que dois números podem não ser comparáveis diretamente?",
      options: ["Porque podem ter datas, universos ou metodologias diferentes","Porque um número maior é sempre melhor","Porque gráficos diferentes usam cores diferentes"],
      answer: 0,
      explanation: "Datas, denominadores e metodologias diferentes podem mudar o significado da comparação.",
      anchor: "principios",
      sourceLabel: "Princípios e correções",
    },
    {
      prompt: "Onde conferir as fontes catalogadas pelo projeto?",
      options: ["No Mapa de evidências","Apenas no rodapé do navegador","Somente nas redes sociais"],
      answer: 0,
      explanation: "O Mapa de evidências reúne instituição, natureza, datas e links usados pelo observatório.",
      anchor: "fontes",
      sourceLabel: "Mapa de evidências",
    },
    {
      prompt: "O que diferencia um dado observado de um cálculo derivado?",
      options: ["O observado vem da fonte; o derivado é calculado a partir de outros dados","O derivado é sempre mais importante","Não existe diferença entre os dois"],
      answer: 0,
      explanation: "O projeto separa valores reproduzidos da fonte de cálculos derivados.",
      anchor: "qualidade",
      sourceLabel: "Qualidade dos dados",
    },
    {
      prompt: "Por que a data de referência importa ao comparar dois indicadores?",
      options: ["Porque os indicadores podem representar momentos diferentes","Porque a data muda automaticamente o valor para melhor","Porque toda data é apenas informativa"],
      answer: 0,
      explanation: "Dois indicadores podem estar corretos e ainda representar períodos diferentes.",
      anchor: "fontes",
      sourceLabel: "Fontes e metodologia",
    },
    {
      prompt: "O que fazer quando um registro ainda não tem evidência municipal suficiente?",
      options: ["Mantê-lo como pendente e não tratá-lo como registro local validado","Inferir o município pelo nome","Publicá-lo como confirmado para completar a lista"],
      answer: 0,
      explanation: "Quando falta evidência municipal, o observatório mantém o estado pendente.",
      anchor: "candidaturas",
      sourceLabel: "Candidaturas locais",
    },
    {
      prompt: "Para que serve um link para a fonte oficial?",
      options: ["Permitir a conferência do registro original","Substituir a necessidade de ler a metodologia","Transformar uma estimativa em resultado"],
      answer: 0,
      explanation: "A fonte oficial permite conferência direta na instituição responsável.",
      anchor: "fontes",
      sourceLabel: "Mapa de evidências",
    },
    {
      prompt: "O que uma fonte secundária representa no catálogo do projeto?",
      options: ["Um material de apoio que não substitui a fonte oficial quando ela existe","Uma fonte automaticamente mais precisa","Um resultado eleitoral"],
      answer: 0,
      explanation: "Fontes secundárias são tratadas como apoio e identificadas separadamente.",
      anchor: "fontes",
      sourceLabel: "Mapa de evidências",
    },
    {
      prompt: "O que significa dizer que uma métrica tem um denominador específico?",
      options: ["Que o percentual depende do conjunto usado como base do cálculo","Que o número está automaticamente errado","Que o denominador pode ser ignorado"],
      answer: 0,
      explanation: "Percentuais só fazem sentido quando a base usada no cálculo está clara.",
      anchor: "qualidade",
      sourceLabel: "Qualidade dos dados",
    },
    {
      prompt: "Por que percentuais de cobertura não devem ser simplesmente somados?",
      options: ["Porque podem usar bases e universos diferentes","Porque nenhum percentual pode ser comparado","Porque toda cobertura é uma estimativa"],
      answer: 0,
      explanation: "Cobertura, coleta e tratamento podem ter denominadores diferentes.",
      anchor: "saude",
      sourceLabel: "Saneamento",
    },
    {
      prompt: "O que uma série histórica de eleitorado mostra?",
      options: ["Mudanças na quantidade registrada em diferentes bases de referência","Quem vencerá a próxima eleição","Quais candidatos tiveram mais votos"],
      answer: 0,
      explanation: "A série histórica acompanha contagens de eleitorado em diferentes referências.",
      anchor: "eleitoral360",
      sourceLabel: "Eleitoral 2026",
    },
    {
      prompt: "O que é uma abstenção eleitoral?",
      options: ["Eleitores aptos que não compareceram para votar","Votos brancos","Votos anulados por decisão judicial"],
      answer: 0,
      explanation: "Abstenção se refere à parcela de eleitores que não compareceu.",
      anchor: "eleitorado",
      sourceLabel: "Perfil eleitoral",
    },
    {
      prompt: "O que são votos válidos em uma base eleitoral?",
      options: ["Votos contabilizados para a escolha de candidatura ou opção válida","Todos os eleitores cadastrados","Somente votos brancos"],
      answer: 0,
      explanation: "Votos válidos são diferentes de eleitorado total, brancos, nulos e abstenções.",
      anchor: "eleitoral360",
      sourceLabel: "Eleitoral 2026",
    },
    {
      prompt: "Por que uma estimativa populacional não é igual a um censo?",
      options: ["Porque a estimativa atualiza a população entre operações censitárias","Porque estimativas sempre substituem censos","Porque censo é uma pesquisa de opinião"],
      answer: 0,
      explanation: "Estimativas são diferentes das contagens censitárias e têm sua própria data de referência.",
      anchor: "dashboard",
      sourceLabel: "Cidade",
    },
    {
      prompt: "O que uma densidade populacional relaciona?",
      options: ["População e área territorial","Eleitorado e orçamento","Votos e pesquisas"],
      answer: 0,
      explanation: "Densidade relaciona quantidade de habitantes e área, geralmente em habitantes por km².",
      anchor: "dashboard",
      sourceLabel: "Cidade",
    },
    {
      prompt: "Uma tarifa de transporte publicada deve ser tratada como quê?",
      options: ["Valor de referência da fonte na data considerada","Custo obrigatório para todas as viagens futuras","Previsão de reajuste"],
      answer: 0,
      explanation: "A tarifa é apresentada conforme a referência publicada e sua data.",
      anchor: "transporte",
      sourceLabel: "Transporte",
    },
    {
      prompt: "O cálculo de custo mensal de transporte é que tipo de dado?",
      options: ["Cálculo derivado a partir de premissas explícitas","Dado oficial diretamente publicado pela fonte","Resultado eleitoral"],
      answer: 0,
      explanation: "O custo mensal depende de tarifa, viagens e dias usados no cálculo.",
      anchor: "transporte",
      sourceLabel: "Transporte",
    },
    {
      prompt: "O que ajuda a tornar um cálculo derivado auditável?",
      options: ["Mostrar as premissas e a fórmula","Esconder as variáveis","Apresentar só o resultado final"],
      answer: 0,
      explanation: "Premissas explícitas permitem reproduzir o cálculo.",
      anchor: "qualidade",
      sourceLabel: "Qualidade dos dados",
    },
    {
      prompt: "O que significa uma informação estar em um snapshot?",
      options: ["Ela está congelada na fotografia de dados daquela captura","Ela será atualizada automaticamente a cada segundo","Ela é necessariamente uma previsão"],
      answer: 0,
      explanation: "Snapshot significa uma fotografia de dados em determinado momento.",
      anchor: "fontes",
      sourceLabel: "Fontes e metodologia",
    },
    {
      prompt: "Qual é a função de um estado 'pendente' em um dado eleitoral?",
      options: ["Sinalizar que falta confirmação suficiente para uma afirmação mais forte","Confirmar a informação por padrão","Indicar que o dado foi apagado"],
      answer: 0,
      explanation: "Estados pendentes evitam que lacunas sejam transformadas em certezas.",
      anchor: "candidaturas",
      sourceLabel: "Candidaturas locais",
    },
    {
      prompt: "O que uma fonte oficial do TSE permite conferir?",
      options: ["Registros eleitorais publicados pela Justiça Eleitoral","Qualquer opinião sobre um candidato","Qualquer estimativa econômica"],
      answer: 0,
      explanation: "A fonte oficial é usada para conferir registros sob responsabilidade do TSE.",
      anchor: "fontes",
      sourceLabel: "Fonte TSE",
    },
    {
      prompt: "Por que o observatório separa universo estadual de recorte local?",
      options: ["Para não apresentar uma base estadual como se fosse municipal","Para aumentar a quantidade de candidatos exibidos","Para eliminar todas as fontes"],
      answer: 0,
      explanation: "O universo estadual e o recorte local têm escopos diferentes e precisam ser identificados.",
      anchor: "eleitoral360",
      sourceLabel: "Eleitoral 2026",
    },
    {
      prompt: "O que significa uma watchlist editorial?",
      options: ["Uma lista de nomes definidos para acompanhamento no projeto","Uma lista oficial de eleitos","Um ranking automático"],
      answer: 0,
      explanation: "A watchlist é um recorte editorial de acompanhamento, não uma certificação de candidatura municipal.",
      anchor: "candidaturas",
      sourceLabel: "Candidaturas locais",
    },
    {
      prompt: "Por que não se deve inferir município apenas pelo nome de urna?",
      options: ["Porque o nome não prova o município da candidatura","Porque nomes de urna são secretos","Porque todo candidato concorre em todos os municípios"],
      answer: 0,
      explanation: "Correspondência de nome não substitui confirmação municipal oficial.",
      anchor: "candidaturas",
      sourceLabel: "Candidaturas locais",
    },
    {
      prompt: "O que uma pesquisa eleitoral registrada informa?",
      options: ["Dados de um levantamento conforme o registro e ficha técnica disponíveis","O resultado oficial da eleição","Uma garantia sobre o futuro"],
      answer: 0,
      explanation: "Pesquisa é um levantamento registrado, diferente do resultado oficial.",
      anchor: "politica",
      sourceLabel: "Pesquisas",
    },
    {
      prompt: "O que uma decisão judicial ligada a uma pesquisa pode mudar na leitura?",
      options: ["Pode exigir contexto e cautela sobre divulgações específicas","Transforma automaticamente a pesquisa em resultado eleitoral","Elimina todos os dados públicos"],
      answer: 0,
      explanation: "Decisões podem afetar divulgação e contexto de registros específicos sem equivaler automaticamente ao resultado eleitoral.",
      anchor: "politica",
      sourceLabel: "Pesquisas",
    },
    {
      prompt: "Qual é a diferença entre pesquisa e resultado eleitoral?",
      options: ["Pesquisa mede respostas de uma amostra; resultado decorre da votação apurada","São sinônimos","Resultado é sempre uma estimativa"],
      answer: 0,
      explanation: "Pesquisa e resultado são categorias distintas de informação.",
      anchor: "politica",
      sourceLabel: "Pesquisas",
    },
    {
      prompt: "O que uma margem de erro publicada na ficha técnica representa?",
      options: ["Uma medida estatística informada pelo responsável pelo levantamento","Uma garantia de acerto do resultado","Um cálculo feito automaticamente pelo observatório"],
      answer: 0,
      explanation: "O observatório não recalcula a margem; exibe o que estiver materializado na fonte registrada.",
      anchor: "politica",
      sourceLabel: "Pesquisas",
    },
    {
      prompt: "Como ler uma nota de saneamento com denominador diferente?",
      options: ["Conferindo exatamente qual população ou domicílios entram na base","Somando a nota com outras coberturas","Ignorando a metodologia"],
      answer: 0,
      explanation: "O denominador define o que o percentual representa.",
      anchor: "saude",
      sourceLabel: "Saneamento",
    },
    {
      prompt: "O que é coleta de esgoto?",
      options: ["Etapa relacionada à coleta do esgoto gerado","Sinônimo automático de tratamento","Percentual de água potável"],
      answer: 0,
      explanation: "Coleta e tratamento são etapas distintas.",
      anchor: "saude",
      sourceLabel: "Saneamento",
    },
    {
      prompt: "O que significa tratar 100% do esgoto coletado?",
      options: ["Que o esgoto que foi coletado recebeu tratamento na base informada","Que 100% dos domicílios têm coleta","Que 100% da população tem rede"],
      answer: 0,
      explanation: "O percentual se refere ao esgoto coletado, não necessariamente a toda geração ou cobertura.",
      anchor: "saude",
      sourceLabel: "Saneamento",
    },
    {
      prompt: "O que um indicador de perdas na distribuição de água mede?",
      options: ["Parcela de água que se perde entre produção/distribuição e consumo faturado conforme a metodologia","Qualidade da água na torneira","Quantidade de chuva"],
      answer: 0,
      explanation: "Perdas são uma métrica operacional da distribuição de água.",
      anchor: "saude",
      sourceLabel: "Saneamento",
    },
    {
      prompt: "O que torna um indicador educacional secundário?",
      options: ["Quando ele depende de uma referência que ainda não foi materializada como dado municipal oficial no snapshot","Quando ele aparece em um gráfico","Quando ele tem um número decimal"],
      answer: 0,
      explanation: "O projeto diferencia referência secundária de valor municipal oficial.",
      anchor: "dashboard",
      sourceLabel: "Educação",
    },
    {
      prompt: "Por que uma faixa de valor não deve ser apresentada como nota pontual?",
      options: ["Porque a faixa não informa um valor único confirmado","Porque faixas são sempre melhores","Porque qualquer intervalo é uma média"],
      answer: 0,
      explanation: "Uma faixa e um valor pontual são formas diferentes de informação.",
      anchor: "dashboard",
      sourceLabel: "Educação",
    },
    {
      prompt: "O que representa uma LOA?",
      options: ["Lei Orçamentária Anual","Levantamento de Opinião Anual","Lista Oficial de Arrecadação"],
      answer: 0,
      explanation: "LOA significa Lei Orçamentária Anual.",
      anchor: "orcamento",
      sourceLabel: "Orçamento",
    },
    {
      prompt: "Qual a diferença entre orçamento previsto e gasto executado?",
      options: ["O previsto é autorizado/planejado; o executado é o que efetivamente foi realizado na execução","São exatamente a mesma coisa","Executado sempre significa empenhado e pago"],
      answer: 0,
      explanation: "As etapas orçamentárias têm significados diferentes e não devem ser confundidas.",
      anchor: "orcamento",
      sourceLabel: "Orçamento",
    },
    {
      prompt: "Por que um crédito adicional deve ser identificado como atualização?",
      options: ["Porque ele altera a autorização orçamentária em relação à previsão original","Porque substitui automaticamente toda a LOA","Porque é uma pesquisa"],
      answer: 0,
      explanation: "Créditos adicionais são alterações legais do orçamento e merecem contexto próprio.",
      anchor: "orcamento",
      sourceLabel: "Orçamento",
    },
    {
      prompt: "O que ajuda a verificar se um valor orçamentário é confiável?",
      options: ["Fonte legal, data e identificação do instrumento","Somente o tamanho do número","A aparência do gráfico"],
      answer: 0,
      explanation: "A documentação legal e a referência temporal ajudam a auditar o valor.",
      anchor: "orcamento",
      sourceLabel: "Orçamento",
    },
    {
      prompt: "Para que serve um filtro de busca eleitoral no observatório?",
      options: ["Localizar registros do recorte acompanhado","Criar um ranking automático","Predizer o vencedor"],
      answer: 0,
      explanation: "A busca serve para localizar informação já presente no recorte.",
      anchor: "candidaturas",
      sourceLabel: "Candidaturas locais",
    },
    {
      prompt: "O que deve acontecer quando a busca não encontra um nome?",
      options: ["Mostrar um estado vazio claro e permitir limpar ou alterar o termo","Inventar uma correspondência aproximada","Trocar para outro universo sem avisar"],
      answer: 0,
      explanation: "Um estado vazio claro evita interpretações erradas.",
      anchor: "eleitoral360",
      sourceLabel: "Candidaturas locais",
    },
    {
      prompt: "Por que fontes e letras precisam de boa hierarquia visual?",
      options: ["Para facilitar a leitura sem esconder contexto importante","Para deixar o conteúdo mais técnico","Para reduzir a transparência"],
      answer: 0,
      explanation: "Hierarquia visual ajuda a distinguir valor, contexto, fonte e detalhes.",
      anchor: "fontes",
      sourceLabel: "Mapa de evidências",
    },
    {
      prompt: "O que uma informação secundária discreta deve fazer?",
      options: ["Apoiar a leitura sem competir com a informação principal","Substituir o dado principal","Ocupar mais espaço que o dado principal"],
      answer: 0,
      explanation: "Elementos secundários devem complementar sem dominar a leitura.",
      anchor: "resumo",
      sourceLabel: "Resumo público",
    },
    {
      prompt: "Qual é a vantagem de um cartão clicável no modo Resumo?",
      options: ["Levar do número ao contexto completo sem exigir leitura técnica imediata","Eliminar a fonte do dado","Transformar opinião em fato"],
      answer: 0,
      explanation: "Cartões interativos ajudam a navegar do resumo para o contexto completo.",
      anchor: "resumo",
      sourceLabel: "Resumo público",
    },
    {
      prompt: "O que um bom botão mobile deve oferecer?",
      options: ["Alvo de toque confortável e estado visual claro","Texto minúsculo e sem foco","Área clicável imprevisível"],
      answer: 0,
      explanation: "Alvos de toque confortáveis e feedback ajudam a usabilidade no celular.",
      anchor: "descubra",
      sourceLabel: "Usabilidade",
    },
    {
      prompt: "Por que a barra inferior mobile deve ter poucas ações?",
      options: ["Para manter decisões simples e reduzir poluição visual","Para esconder todas as seções","Para impedir a navegação por links"],
      answer: 0,
      explanation: "Poucas ações principais facilitam a orientação no celular.",
      anchor: "descubra",
      sourceLabel: "Navegação mobile",
    },
    {
      prompt: "Para que serve o modo Resumo?",
      options: ["Entregar primeiro os pontos essenciais e deixar o detalhe para depois","Eliminar fontes","Substituir todos os dados técnicos"],
      answer: 0,
      explanation: "O modo Resumo prioriza compreensão rápida sem remover a rastreabilidade.",
      anchor: "resumo",
      sourceLabel: "Resumo público",
    },
    {
      prompt: "Para que serve o modo Técnico?",
      options: ["Exibir mais contexto sobre fonte, método e limitações","Selecionar automaticamente um candidato","Ocultar os dados principais"],
      answer: 0,
      explanation: "O modo Técnico é destinado a quem precisa de mais rastreabilidade e metodologia.",
      anchor: "fontes",
      sourceLabel: "Fontes e metodologia",
    },
    {
      prompt: "O que significa uma fonte rastreável?",
      options: ["Que a pessoa pode identificar e conferir de onde o dado veio","Que o dado é necessariamente recente","Que o dado não possui limitações"],
      answer: 0,
      explanation: "Rastreabilidade permite localizar a origem do valor e suas referências.",
      anchor: "fontes",
      sourceLabel: "Mapa de evidências",
    },
    { difficulty: 'Fácil', prompt: "Fácil 1: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 2: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 3: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 4: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 5: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 6: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 7: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 8: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 9: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 10: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 11: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 12: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 13: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 14: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 15: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 16: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 17: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 18: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 19: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 20: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 21: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 22: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 23: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 24: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Fácil', prompt: "Fácil 25: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'resumo', sourceLabel: 'Resumo público' },
    { difficulty: 'Médio', prompt: "Médio 1: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 2: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 3: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 4: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 5: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 6: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 7: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 8: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 9: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 10: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 11: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 12: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 13: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 14: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 15: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 16: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 17: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 18: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 19: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 20: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 21: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 22: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 23: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 24: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Médio', prompt: "Médio 25: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'dashboard', sourceLabel: 'Dados' },
    { difficulty: 'Difícil', prompt: "Difícil 1: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 2: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 3: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 4: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 5: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 6: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 7: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 8: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 9: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 10: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 11: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 12: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 13: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 14: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 15: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 16: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 17: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 18: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 19: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 20: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 21: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 22: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 23: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 24: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Difícil', prompt: "Difícil 25: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { difficulty: 'Avançado', prompt: "Avançado 1: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 2: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 3: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 4: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 5: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 6: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 7: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 8: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 9: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 10: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 11: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 12: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 13: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 14: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 15: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 16: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 17: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 18: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 19: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 20: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 21: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 22: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 23: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 24: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
    { difficulty: 'Avançado', prompt: "Avançado 25: como interpretar corretamente esta situação de dados públicos?", options: ["A alternativa que preserva definição, escopo e contexto","Uma conclusão sem verificar a base","Uma previsão do futuro"], answer: 0, explanation: "A resposta correta preserva o contexto, a definição, o escopo e a rastreabilidade do dado.", anchor: 'fontes', sourceLabel: 'Fontes e metodologia' },
  ], []);
  ], []);
  ], []);
  const [phase, setPhase] = useState(0);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const filteredQuestions = useMemo(() => questions.filter(question => question.difficulty === LEVELS[phase]), [phase, questions]);
  const current = filteredQuestions[step];
  const finished = step >= filteredQuestions.length;
  const currentLevel = LEVELS[phase];
  const phaseTarget = phase === LEVELS.length - 1 ? 20 : 18;
  const phasePassed = finished && score >= phaseTarget;

  const choose = (index: number) => {
    if (selected !== null || !current) return;
    setSelected(index);
    if (index === current.answer) setScore(value => value + 1);
  };

  const next = () => {
    setSelected(null);
    setStep(value => value + 1);
  };

  const reset = () => {
    setPhase(0);
    setStep(0);
    setSelected(null);
    setScore(0);
  };

  const advancePhase = () => {
    if (!phasePassed || phase >= LEVELS.length - 1) return;
    setPhase(value => value + 1);
    setStep(0);
    setSelected(null);
    setScore(0);
  };

  return (
    <section id="quiz" className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="quiz-title">
      <div className="quiz-shell quiz-journey-shell">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-200/80">Aprendizado rápido</div>
            <h2 id="quiz-title" className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">1 minuto para testar o que você entendeu</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Jornada em quatro fases, com progressão obrigatória. Você precisa concluir cada etapa para desbloquear a próxima.</p>
          </div>
          {!finished && <div className="quiz-progress-wrap">
            <div className="quiz-progress" aria-label={`Pergunta ${step + 1} de ${filteredQuestions.length}`}>
              <span>{String(step + 1).padStart(2, '0')}</span>/<span>{String(filteredQuestions.length).padStart(2, '0')}</span>
            </div>
            <div className="quiz-progress-track" aria-hidden="true">
              <span style={{ width: (((step + 1) / filteredQuestions.length) * 100) + '%' }} />
            </div>
          </div>}
        </div>

        <div className="quiz-phase-roadmap" aria-label="Progressão das fases">
          {LEVELS.map((level, index) => {
            const unlocked = index <= phase;
            const completed = index < phase;
            return <div key={level} className={`quiz-stage-node ${unlocked ? 'is-unlocked' : 'is-locked'} ${completed ? 'is-complete' : ''} ${index === phase ? 'is-active' : ''}`}>
              <span className="quiz-stage-dot">{completed ? '✓' : index + 1}</span><span>{level}</span>
            </div>;
          })}
        </div>

        <div className="quiz-phase-roadmap" aria-label="Progressão das fases">
          {LEVELS.map((level, index) => {
            const unlocked = index <= phase;
            const completed = index < phase;
            return <div key={level} className={`quiz-stage-node ${unlocked ? 'is-unlocked' : 'is-locked'} ${completed ? 'is-complete' : ''} ${index === phase ? 'is-active' : ''}`}>
              <span className="quiz-stage-dot">{completed ? '✓' : index + 1}</span><span>{level}</span>
            </div>;
          })}
        </div>

        {!finished && current ? (
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Nível do quiz">{(['Todos', 'Fácil', 'Médio', 'Difícil', 'Avançado'] as const).map(level => <button key={level} type="button" onClick={() => changeDifficulty(level)} aria-pressed={difficulty === level} className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-bold ${difficulty === level ? 'border-violet-200/50 bg-violet-300 text-slate-950' : 'border-white/10 bg-white/[0.03] text-slate-300'}`}>{level}</button>)}</div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600"><span>Pergunta {step + 1}</span><span className="rounded-full border border-white/10 px-2 py-1 text-[9px] text-violet-200">{current.difficulty}</span></div>
              <h3 className="mt-3 text-xl font-black leading-tight text-white">{current.prompt}</h3>
              <div className="mt-5 grid gap-2">
                {current.options.map((option, index) => {
                  const isSelected = selected === index;
                  const isCorrect = index === current.answer;
                  const state = selected === null
                    ? 'idle'
                    : isCorrect
                      ? 'correct'
                      : isSelected
                        ? 'wrong'
                        : 'muted';
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choose(index)}
                      disabled={selected !== null}
                      aria-pressed={isSelected}
                      className={`quiz-option ${state}`}
                    >
                      <span className="quiz-option-key">{String.fromCharCode(65 + index)}</span>
                      <span className="text-left">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-violet-300/10 bg-violet-300/[0.035] p-5">
              {selected === null ? (
                <>
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-200/80">Como usar</div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">Escolha uma resposta. A explicação aparece na hora e você pode seguir para a próxima.</p>
                  <div className="mt-5 rounded-2xl border border-white/8 bg-black/10 p-4 text-xs leading-5 text-slate-500">O objetivo é reforçar leitura crítica de dados, não testar conhecimento político.</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                    <CheckCircle2 className={selected === current.answer ? 'h-5 w-5 text-emerald-300' : 'h-5 w-5 text-amber-300'} aria-hidden="true" />
                    {selected === current.answer ? 'Resposta correta' : 'Resposta revisada'}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{current.explanation}</p>
                  <a href={`#${current.anchor}`} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:border-violet-300/20">
                    Ver {current.sourceLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <button type="button" onClick={next} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-violet-300 px-4 py-2 text-xs font-black text-slate-950">
                    {step + 1 === filteredQuestions.length ? 'Concluir fase' : 'Próxima pergunta'}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.04] p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200/80">Resultado</div>
              <div className="mt-2 text-3xl font-black text-white">{score}/{filteredQuestions.length}</div>
              <div className="mt-1 text-xs font-bold text-violet-200">Fase {phase + 1} · {currentLevel}</div><div className="mt-1 text-xs text-slate-500">Meta: {phaseTarget}/25</div><p className="mt-2 text-sm leading-6 text-slate-400">Use o resultado como sinal de compreensão das regras de leitura do observatório, não como avaliação de pessoas, partidos ou candidatos.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {phasePassed && phase < LEVELS.length - 1 && <button type="button" onClick={advancePhase} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2 text-xs font-black text-slate-950">Desbloquear {LEVELS[phase + 1]} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>}
              {finished && !phasePassed && <div className="rounded-xl border border-amber-300/10 bg-amber-300/[0.04] px-3 py-2 text-xs text-amber-100">A próxima fase permanece bloqueada. Alcance {phaseTarget}/25 para avançar.</div>
              <a href="#fontes" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-300 px-4 py-2 text-xs font-black text-slate-950">Conferir fontes <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
              <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-200"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Refazer</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
