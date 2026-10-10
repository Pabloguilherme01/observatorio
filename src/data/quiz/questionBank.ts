export type Difficulty = 'Começar' | 'Entender' | 'Comparar' | 'Conferir' | 'Aplicar';
export type QuizQuestion = { readonly id: string; readonly difficulty: Difficulty; readonly prompt: string; readonly options: readonly string[]; readonly answerIndex: number; readonly explanation: string; readonly sourceId: string; };
export const QUIZ_TOTAL = 200;
export const QUESTIONS_PER_LEVEL = 40;
export const QUIZ_LEVELS: readonly Difficulty[] = ["Começar","Entender","Comparar","Conferir","Aplicar"];
export const QUESTION_BANK: readonly QuizQuestion[] = [
  {
    "id": "q001",
    "difficulty": "Começar",
    "prompt": "O que a população municipal conta?",
    "options": [
      "Moradores do município",
      "Somente trabalhadores",
      "Somente estudantes",
      "Somente usuários de ônibus"
    ],
    "answerIndex": 0,
    "explanation": "População descreve moradores de um território; outros cadastros contam grupos diferentes.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q002",
    "difficulty": "Começar",
    "prompt": "Para que serve olhar a unidade ao lado de um valor?",
    "options": [
      "Descobrir a cor do gráfico",
      "Saber o que está sendo medido",
      "Garantir atualização diária",
      "Dispensar a fonte"
    ],
    "answerIndex": 1,
    "explanation": "Habitantes, reais e porcentagens representam medidas diferentes.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q003",
    "difficulty": "Começar",
    "prompt": "O que significa Censo na série de população?",
    "options": [
      "Previsão de orçamento",
      "Cadastro hospitalar",
      "Contagem censitária",
      "Pesquisa de tarifas"
    ],
    "answerIndex": 2,
    "explanation": "O Censo tem metodologia de contagem; não é uma estimativa anual.",
    "sourceId": "ibge-censo-2022"
  },
  {
    "id": "q004",
    "difficulty": "Começar",
    "prompt": "Como deve ser lida uma estimativa populacional?",
    "options": [
      "Como contagem diária",
      "Como total de atendimentos",
      "Como promessa de crescimento",
      "Como cálculo para um período definido"
    ],
    "answerIndex": 3,
    "explanation": "A estimativa usa uma metodologia e uma referência temporal identificadas.",
    "sourceId": "ibge-estimativas-2026"
  },
  {
    "id": "q005",
    "difficulty": "Começar",
    "prompt": "Qual informação acompanha uma tarifa de ônibus para ser útil?",
    "options": [
      "Trecho e referência da tabela",
      "Número de habitantes apenas",
      "Nota escolar",
      "Área territorial"
    ],
    "answerIndex": 0,
    "explanation": "Tarifas dependem do trecho e da tabela consultada.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q006",
    "difficulty": "Começar",
    "prompt": "O que o simulador de transporte calcula?",
    "options": [
      "Uma tarifa oficial nova",
      "Um custo com as premissas escolhidas",
      "O horário de todos os ônibus",
      "A renda de cada família"
    ],
    "answerIndex": 1,
    "explanation": "O simulador produz uma conta; não publica uma nova tabela de tarifas.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q007",
    "difficulty": "Começar",
    "prompt": "O que representa a LOA?",
    "options": [
      "Todo gasto já pago",
      "Saldo bancário pessoal",
      "Planejamento autorizado do orçamento",
      "Total de habitantes"
    ],
    "answerIndex": 2,
    "explanation": "A autorização orçamentária não comprova execução nem pagamento.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q008",
    "difficulty": "Começar",
    "prompt": "Qual documento permite conferir a origem do orçamento mostrado?",
    "options": [
      "Uma captura sem endereço",
      "Uma mensagem anônima",
      "Uma tabela sem título",
      "A lei orçamentária indicada"
    ],
    "answerIndex": 3,
    "explanation": "A fonte da LOA permite verificar o planejamento municipal.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q009",
    "difficulty": "Começar",
    "prompt": "O que significa uma porcentagem de cobertura de água?",
    "options": [
      "Parte do universo definido na medida",
      "Quantidade de reais gastos",
      "Tarifa de ônibus",
      "Número de empregos"
    ],
    "answerIndex": 0,
    "explanation": "É preciso ler qual população ou domicílio está no denominador do indicador.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q010",
    "difficulty": "Começar",
    "prompt": "Água e esgoto são o mesmo indicador?",
    "options": [
      "Sim, sempre têm o mesmo valor",
      "Não, descrevem serviços distintos",
      "Sim, ambos medem renda",
      "Sim, ambos contam escolas"
    ],
    "answerIndex": 1,
    "explanation": "Abastecimento de água e esgotamento sanitário têm medidas próprias.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q011",
    "difficulty": "Começar",
    "prompt": "Para que serve o link de atendimento da Saneago?",
    "options": [
      "Garantir solução automática",
      "Calcular o IDEB",
      "Consultar o canal responsável pelo serviço",
      "Consultar salários"
    ],
    "answerIndex": 2,
    "explanation": "O canal de atendimento ajuda a encaminhar uma necessidade de saneamento.",
    "sourceId": "saneago-atendimento-2026"
  },
  {
    "id": "q012",
    "difficulty": "Começar",
    "prompt": "Qual cuidado ajuda antes de usar um contato de serviço?",
    "options": [
      "Confiar apenas na cor do botão",
      "Enviar senha pessoal",
      "Ignorar o órgão responsável",
      "Confirmar o canal oficial"
    ],
    "answerIndex": 3,
    "explanation": "A fonte identifica a instituição responsável pelo atendimento.",
    "sourceId": "municipal-caps-2026"
  },
  {
    "id": "q013",
    "difficulty": "Começar",
    "prompt": "O que um número de leitos planejados informa?",
    "options": [
      "Uma capacidade prevista",
      "Todos os leitos ocupados hoje",
      "Todas as consultas realizadas",
      "A fila atual inteira"
    ],
    "answerIndex": 0,
    "explanation": "Planejamento de estrutura não informa sozinho operação ou ocupação.",
    "sourceId": "healgo"
  },
  {
    "id": "q014",
    "difficulty": "Começar",
    "prompt": "Atendimentos hospitalares e pessoas atendidas são iguais?",
    "options": [
      "Sempre",
      "Não necessariamente",
      "Apenas se o gráfico for azul",
      "Apenas em municípios pequenos"
    ],
    "answerIndex": 1,
    "explanation": "Uma pessoa pode receber mais de um atendimento; confira a definição publicada.",
    "sourceId": "healgo-200k"
  },
  {
    "id": "q015",
    "difficulty": "Começar",
    "prompt": "Onde conferir informações sobre o hospital estadual mostrado?",
    "options": [
      "Em qualquer comentário",
      "Na tabela de ônibus",
      "Na fonte institucional do hospital",
      "No total da LOA"
    ],
    "answerIndex": 2,
    "explanation": "A instituição que publica o dado permite conferir seu contexto.",
    "sourceId": "healgo"
  },
  {
    "id": "q016",
    "difficulty": "Começar",
    "prompt": "O que a referência do SAMU ajuda a localizar?",
    "options": [
      "A nota de uma escola",
      "A execução de uma obra",
      "Uma tarifa de saneamento",
      "Um canal de serviço de saúde"
    ],
    "answerIndex": 3,
    "explanation": "A página de serviço indica o canal responsável; confirme suas orientações nela.",
    "sourceId": "municipal-samu-2026"
  },
  {
    "id": "q017",
    "difficulty": "Começar",
    "prompt": "Qual é a utilidade do contato do Conselho Tutelar no catálogo?",
    "options": [
      "Encontrar o serviço responsável",
      "Substituir todo atendimento presencial",
      "Calcular crescimento populacional",
      "Consultar preços de ônibus"
    ],
    "answerIndex": 0,
    "explanation": "O catálogo oferece acesso ao canal institucional e à sua descrição.",
    "sourceId": "municipal-conselho-tutelar-2026"
  },
  {
    "id": "q018",
    "difficulty": "Começar",
    "prompt": "Para que serve a referência da Defesa Civil?",
    "options": [
      "Prever qualquer desastre",
      "Identificar o canal de atendimento",
      "Garantir ausência de risco",
      "Medir aprendizagem escolar"
    ],
    "answerIndex": 1,
    "explanation": "O contato oficial é um caminho para consultar orientações e atendimento.",
    "sourceId": "municipal-defesa-civil-2026"
  },
  {
    "id": "q019",
    "difficulty": "Começar",
    "prompt": "O que o IDEB ajuda a observar?",
    "options": [
      "O custo do transporte",
      "A população diária",
      "Um indicador educacional",
      "A quantidade de água produzida"
    ],
    "answerIndex": 2,
    "explanation": "O IDEB é uma medida de educação, com recorte e período próprios.",
    "sourceId": "inep-2023"
  },
  {
    "id": "q020",
    "difficulty": "Começar",
    "prompt": "Que detalhe distingue séries de IDEB?",
    "options": [
      "Somente a cor da linha",
      "Somente o nome do site",
      "Somente o tamanho do município",
      "Etapa de ensino e ano"
    ],
    "answerIndex": 3,
    "explanation": "Anos iniciais e finais não devem ser confundidos na leitura.",
    "sourceId": "inep-2023"
  },
  {
    "id": "q021",
    "difficulty": "Começar",
    "prompt": "O que a área territorial mede?",
    "options": [
      "Extensão do município",
      "Número de moradores",
      "Receita por mês",
      "Consultas por dia"
    ],
    "answerIndex": 0,
    "explanation": "A área é uma medida espacial; não é uma contagem de pessoas.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q022",
    "difficulty": "Começar",
    "prompt": "O que significa km² numa ficha municipal?",
    "options": [
      "Unidade de renda",
      "Unidade de área",
      "Unidade de tempo",
      "Unidade de temperatura"
    ],
    "answerIndex": 1,
    "explanation": "Quilômetro quadrado mede superfície territorial.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q023",
    "difficulty": "Começar",
    "prompt": "O que a fonte de emprego formal ajuda a contextualizar?",
    "options": [
      "Todos os trabalhos informais",
      "Todas as rendas familiares",
      "Dados do mercado de trabalho no recorte",
      "Todos os deslocamentos"
    ],
    "answerIndex": 2,
    "explanation": "O recorte de emprego formal não representa sozinho toda atividade econômica.",
    "sourceId": "caged-sebrae-2026"
  },
  {
    "id": "q024",
    "difficulty": "Começar",
    "prompt": "Qual informação é necessária para entender uma taxa?",
    "options": [
      "Só a posição no gráfico",
      "Só o título do site",
      "Só a quantidade de cores",
      "Sua base de cálculo"
    ],
    "answerIndex": 3,
    "explanation": "Uma taxa relaciona uma medida com um universo definido.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q025",
    "difficulty": "Começar",
    "prompt": "O que informa o ano-base de um dado?",
    "options": [
      "O período medido",
      "O dia em que você abriu a página",
      "A data do próximo atendimento",
      "A validade eterna do valor"
    ],
    "answerIndex": 0,
    "explanation": "Ano-base identifica o período a que a medida se refere.",
    "sourceId": "inep-ideb-2025"
  },
  {
    "id": "q026",
    "difficulty": "Começar",
    "prompt": "Data de publicação e período medido podem diferir?",
    "options": [
      "Nunca",
      "Sim",
      "Só em planilhas coloridas",
      "Só em dados sem fonte"
    ],
    "answerIndex": 1,
    "explanation": "Um resultado pode ser publicado depois do período que mede.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q027",
    "difficulty": "Começar",
    "prompt": "Qual elemento permite rastrear um indicador?",
    "options": [
      "O número de curtidas",
      "O tamanho do cartão",
      "A fonte identificada",
      "A posição do botão"
    ],
    "answerIndex": 2,
    "explanation": "A fonte permite voltar à origem e verificar o contexto.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q028",
    "difficulty": "Começar",
    "prompt": "O que fazer quando a referência temporal não está informada?",
    "options": [
      "Supor que é de hoje",
      "Inventar uma data",
      "Copiar a data do computador",
      "Reconhecer essa limitação"
    ],
    "answerIndex": 3,
    "explanation": "Ausência de referência não é prova de atualidade.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q029",
    "difficulty": "Começar",
    "prompt": "O que a busca municipal pode ajudar a encontrar?",
    "options": [
      "Dados e canais de serviços",
      "Uma garantia de atendimento",
      "Uma senha institucional",
      "Uma previsão individual de renda"
    ],
    "answerIndex": 0,
    "explanation": "A busca organiza conteúdos e encaminha à fonte ou ao serviço.",
    "sourceId": "municipal-caps-2026"
  },
  {
    "id": "q030",
    "difficulty": "Começar",
    "prompt": "Por que ler a explicação junto do valor?",
    "options": [
      "Decorá-lo mais rápido",
      "Entender significado e limites",
      "Evitar conferir período",
      "Substituir a fonte"
    ],
    "answerIndex": 1,
    "explanation": "O contexto evita conclusões que o indicador não sustenta.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q031",
    "difficulty": "Começar",
    "prompt": "Qual cuidado tomar ao baixar um CSV?",
    "options": [
      "Assumir que todos os números são atuais",
      "Apagar as fontes",
      "Ler nomes, unidades e referências",
      "Somar todas as colunas"
    ],
    "answerIndex": 2,
    "explanation": "O arquivo deve ser interpretado com seus metadados.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q032",
    "difficulty": "Começar",
    "prompt": "O que uma referência de salário mínimo oferece ao simulador?",
    "options": [
      "A renda de cada usuário",
      "Uma tarifa garantida",
      "A despesa real de toda família",
      "Uma base declarada de comparação"
    ],
    "answerIndex": 3,
    "explanation": "A referência salarial não representa a renda individual de todos.",
    "sourceId": "inss-salario-2026"
  },
  {
    "id": "q033",
    "difficulty": "Começar",
    "prompt": "O que distingue dado observado de projeção?",
    "options": [
      "A natureza da medida",
      "A fonte ter logotipo",
      "A página abrir no celular",
      "O tamanho da fonte"
    ],
    "answerIndex": 0,
    "explanation": "Observe se o valor é medido, estimado ou planejado.",
    "sourceId": "ibge-estimativas-2026"
  },
  {
    "id": "q034",
    "difficulty": "Começar",
    "prompt": "Qual fonte está ligada às informações de educação do painel?",
    "options": [
      "Tabela de tarifas",
      "INEP",
      "Atendimento da Saneago",
      "Contato hospitalar"
    ],
    "answerIndex": 1,
    "explanation": "O órgão e a etapa educacional ajudam a identificar a série correta.",
    "sourceId": "inep-2023"
  },
  {
    "id": "q035",
    "difficulty": "Começar",
    "prompt": "Qual fonte está ligada aos indicadores de saneamento?",
    "options": [
      "Tabela salarial",
      "Página do hospital",
      "SINISA",
      "Tabela de transporte"
    ],
    "answerIndex": 2,
    "explanation": "A base de saneamento descreve indicadores e seus universos.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q036",
    "difficulty": "Começar",
    "prompt": "Como interpretar um valor em milhões de reais?",
    "options": [
      "Como número de moradores",
      "Como porcentagem",
      "Como distância",
      "Como uma quantia monetária com escala indicada"
    ],
    "answerIndex": 3,
    "explanation": "A escala em milhões precisa ser considerada ao ler e exportar a quantia.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q037",
    "difficulty": "Começar",
    "prompt": "Por que o serviço tem uma descrição além do nome?",
    "options": [
      "Para explicar o que o canal atende",
      "Para comprovar que não há filas",
      "Para garantir prazo individual",
      "Para substituir toda a fonte"
    ],
    "answerIndex": 0,
    "explanation": "A descrição ajuda a escolher o órgão adequado à necessidade.",
    "sourceId": "municipal-caps-2026"
  },
  {
    "id": "q038",
    "difficulty": "Começar",
    "prompt": "O que a trilha guiada ensina?",
    "options": [
      "Decorar todos os valores",
      "Ler e verificar dados municipais",
      "Prever tarifas futuras",
      "Garantir um atendimento"
    ],
    "answerIndex": 1,
    "explanation": "A trilha trabalha indicador, período, significado, comparação e fonte.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q039",
    "difficulty": "Começar",
    "prompt": "O que uma nota metodológica acrescenta?",
    "options": [
      "Uma garantia de ausência de erros",
      "Uma nova tarifa",
      "Como a medida foi produzida",
      "Uma senha de acesso"
    ],
    "answerIndex": 2,
    "explanation": "Método e limites ajudam a avaliar o uso do indicador.",
    "sourceId": "ibge-estimativas-2026"
  },
  {
    "id": "q040",
    "difficulty": "Começar",
    "prompt": "Qual pergunta iniciar ao ver um número da cidade?",
    "options": [
      "Quantas curtidas ele tem?",
      "Qual cor parece melhor?",
      "Ele cabe numa mensagem?",
      "O que este valor mede?"
    ],
    "answerIndex": 3,
    "explanation": "Identificar a medida vem antes de comparar ou concluir.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q041",
    "difficulty": "Entender",
    "prompt": "Uma estimativa maior que o Censo prova erro no Censo?",
    "options": [
      "Não; período e método podem diferir",
      "Sim, sempre",
      "Sim, se arredondada",
      "Só se tiver fonte"
    ],
    "answerIndex": 0,
    "explanation": "Censo e estimativa são medidas de natureza e referência distintas.",
    "sourceId": "ibge-estimativas-2026"
  },
  {
    "id": "q042",
    "difficulty": "Entender",
    "prompt": "Por que a população não informa sozinha a procura por um serviço?",
    "options": [
      "Porque nunca pode ser medida",
      "Não descreve o uso individual do serviço",
      "Porque é uma tarifa",
      "Porque equivale ao orçamento"
    ],
    "answerIndex": 1,
    "explanation": "Demografia contextualiza a cidade, mas utilização requer dados próprios.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q043",
    "difficulty": "Entender",
    "prompt": "O que significa densidade demográfica?",
    "options": [
      "Total de consultas",
      "Receita dividida por escolas",
      "Relação entre população e área",
      "Tarifa multiplicada por dias"
    ],
    "answerIndex": 2,
    "explanation": "A densidade relaciona moradores à superfície e depende das bases usadas.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q044",
    "difficulty": "Entender",
    "prompt": "Uma média municipal descreve igualmente cada bairro?",
    "options": [
      "Sim, sem exceção",
      "Só em gráficos",
      "Só em dados antigos",
      "Não"
    ],
    "answerIndex": 3,
    "explanation": "Uma média agregada pode esconder diferenças dentro do território.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q045",
    "difficulty": "Entender",
    "prompt": "Um índice de educação resume toda a experiência escolar?",
    "options": [
      "Não; é uma medida parcial",
      "Sim, inclui toda vivência",
      "Sim, substitui visitas",
      "Sim, dispensa metodologia"
    ],
    "answerIndex": 0,
    "explanation": "Indicadores educacionais têm objetivos e limites; não esgotam o tema.",
    "sourceId": "inep-2023"
  },
  {
    "id": "q046",
    "difficulty": "Entender",
    "prompt": "Por que ler a etapa de ensino no IDEB?",
    "options": [
      "Para saber a tarifa",
      "Para não misturar grupos diferentes",
      "Para estimar população",
      "Para calcular leitos"
    ],
    "answerIndex": 1,
    "explanation": "Cada etapa possui um recorte educacional específico.",
    "sourceId": "inep-2023"
  },
  {
    "id": "q047",
    "difficulty": "Entender",
    "prompt": "Um orçamento aprovado indica quanto já saiu do caixa?",
    "options": [
      "Sim, todo o valor",
      "Sim, metade sempre",
      "Não",
      "Sim, se publicado"
    ],
    "answerIndex": 2,
    "explanation": "Planejamento autorizado e pagamento realizado são etapas diferentes.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q048",
    "difficulty": "Entender",
    "prompt": "O que uma distribuição da LOA por área representa?",
    "options": [
      "Avaliação automática da qualidade",
      "Pagamentos individuais",
      "Número de servidores presentes",
      "Alocação planejada de recursos"
    ],
    "answerIndex": 3,
    "explanation": "A distribuição mostra planejamento; qualidade e execução exigem outras evidências.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q049",
    "difficulty": "Entender",
    "prompt": "Uma participação maior de saúde no orçamento prova melhora do atendimento?",
    "options": [
      "Não, sozinha",
      "Sim, obrigatoriamente",
      "Sim, imediatamente",
      "Só quando arredondada"
    ],
    "answerIndex": 0,
    "explanation": "Alocação financeira não mede diretamente resultados ou acesso.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q050",
    "difficulty": "Entender",
    "prompt": "Qual limite tem dividir orçamento autorizado pela população?",
    "options": [
      "É o valor pago a cada morador",
      "É uma relação teórica, não repasse individual",
      "É a renda local média",
      "É o salário de todo servidor"
    ],
    "answerIndex": 1,
    "explanation": "A conta contextualiza escala; não significa pagamento a pessoas.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q051",
    "difficulty": "Entender",
    "prompt": "Por que o ano do orçamento importa?",
    "options": [
      "Todos os anos são iguais",
      "O ano define a cor",
      "Cada exercício tem planejamento próprio",
      "O ano substitui a moeda"
    ],
    "answerIndex": 2,
    "explanation": "A LOA se refere a um exercício financeiro específico.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q052",
    "difficulty": "Entender",
    "prompt": "Uma porcentagem de água equivale à de tratamento de esgoto?",
    "options": [
      "Sim, sempre",
      "Sim, no mesmo gráfico",
      "Sim, com a mesma fonte",
      "Não"
    ],
    "answerIndex": 3,
    "explanation": "Serviços e denominadores precisam ser lidos separadamente.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q053",
    "difficulty": "Entender",
    "prompt": "Cobertura de rede prova funcionamento contínuo em cada imóvel?",
    "options": [
      "Não",
      "Sim, em todos",
      "Sim, em qualquer período",
      "Sim, se acima da metade"
    ],
    "answerIndex": 0,
    "explanation": "Cobertura não demonstra sozinha continuidade ou qualidade do serviço.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q054",
    "difficulty": "Entender",
    "prompt": "O que falta para avaliar a regularidade do abastecimento?",
    "options": [
      "Só a população total",
      "Dados próprios de continuidade",
      "Só a área municipal",
      "Só o título do gráfico"
    ],
    "answerIndex": 1,
    "explanation": "Um indicador de cobertura não mede todas as dimensões do abastecimento.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q055",
    "difficulty": "Entender",
    "prompt": "Qual diferença existe entre coleta e tratamento de esgoto?",
    "options": [
      "São nomes idênticos",
      "Ambos medem renda",
      "São etapas distintas",
      "Ambos medem passageiros"
    ],
    "answerIndex": 2,
    "explanation": "Confira a definição de cada indicador sanitário antes de interpretar.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q056",
    "difficulty": "Entender",
    "prompt": "O que uma notícia de marco de atendimentos costuma representar?",
    "options": [
      "Sempre o total de hoje",
      "Sempre pessoas únicas",
      "Sempre vagas disponíveis",
      "Um acumulado no período informado"
    ],
    "answerIndex": 3,
    "explanation": "O marco precisa ser lido com intervalo e definição de atendimento.",
    "sourceId": "healgo-200k"
  },
  {
    "id": "q057",
    "difficulty": "Entender",
    "prompt": "Capacidade prevista do hospital indica leitos disponíveis neste momento?",
    "options": [
      "Não",
      "Sim, todos",
      "Sim, metade",
      "Sim, se há notícia"
    ],
    "answerIndex": 0,
    "explanation": "Disponibilidade operacional requer informação específica e recente.",
    "sourceId": "healgo"
  },
  {
    "id": "q058",
    "difficulty": "Entender",
    "prompt": "Investimento na construção equivale ao custo anual de funcionamento?",
    "options": [
      "Sim, necessariamente",
      "Não",
      "Sim, se municipal",
      "Sim, se estadual"
    ],
    "answerIndex": 1,
    "explanation": "Construção e operação são despesas de natureza e períodos distintos.",
    "sourceId": "healgo"
  },
  {
    "id": "q059",
    "difficulty": "Entender",
    "prompt": "Por que abrir a página oficial antes de ir ao serviço?",
    "options": [
      "Garantir que a fila está vazia",
      "Dispensar documentos sempre",
      "Conferir orientações e informações de atendimento",
      "Prever o tempo de espera"
    ],
    "answerIndex": 2,
    "explanation": "O catálogo não substitui as orientações atualizadas do órgão.",
    "sourceId": "municipal-caps-2026"
  },
  {
    "id": "q060",
    "difficulty": "Entender",
    "prompt": "O telefone exibido prova que o serviço atende qualquer demanda?",
    "options": [
      "Sim",
      "Sim, fora do horário",
      "Sim, sem identificação",
      "Não; leia a finalidade do canal"
    ],
    "answerIndex": 3,
    "explanation": "Cada canal tem responsabilidade e orientações próprias.",
    "sourceId": "municipal-conselho-tutelar-2026"
  },
  {
    "id": "q061",
    "difficulty": "Entender",
    "prompt": "Por que um link institucional não garante atendimento imediato?",
    "options": [
      "Ele informa um caminho, não a disponibilidade individual",
      "Porque toda fonte é inválida",
      "Porque o município não existe",
      "Porque só funciona em planilha"
    ],
    "answerIndex": 0,
    "explanation": "Encaminhamento e efetivação do atendimento são coisas diferentes.",
    "sourceId": "municipal-samu-2026"
  },
  {
    "id": "q062",
    "difficulty": "Entender",
    "prompt": "Qual a finalidade de confirmar o órgão de um contato?",
    "options": [
      "Eliminar a referência temporal",
      "Encaminhar ao responsável correto",
      "Aumentar a população",
      "Modificar a LOA"
    ],
    "answerIndex": 1,
    "explanation": "Responsabilidade institucional orienta o uso do canal.",
    "sourceId": "municipal-defesa-civil-2026"
  },
  {
    "id": "q063",
    "difficulty": "Entender",
    "prompt": "No transporte, o que significa ida e volta na conta?",
    "options": [
      "Uma passagem garantida gratuita",
      "Uma viagem por mês",
      "Dois deslocamentos considerados",
      "Um horário de ônibus"
    ],
    "answerIndex": 2,
    "explanation": "O número de trechos entra no cálculo do custo estimado.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q064",
    "difficulty": "Entender",
    "prompt": "Por que dias de deslocamento alteram o custo mensal simulado?",
    "options": [
      "A fonte deixa de existir",
      "A tarifa necessariamente aumenta",
      "O salário muda automaticamente",
      "A quantidade de viagens muda"
    ],
    "answerIndex": 3,
    "explanation": "A conta depende do número de viagens informado, com tarifa mantida como premissa.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q065",
    "difficulty": "Entender",
    "prompt": "O percentual do transporte sobre salário mínimo é renda disponível real?",
    "options": [
      "Não; é comparação com uma referência",
      "Sim, para toda família",
      "Sim, para todo estudante",
      "Sim, após qualquer despesa"
    ],
    "answerIndex": 0,
    "explanation": "A referência salarial não incorpora todas as rendas e despesas individuais.",
    "sourceId": "inss-salario-2026"
  },
  {
    "id": "q066",
    "difficulty": "Entender",
    "prompt": "Uma tabela de tarifas descreve horários de partida?",
    "options": [
      "Sempre",
      "Não necessariamente",
      "Somente em feriados",
      "Somente na capital"
    ],
    "answerIndex": 1,
    "explanation": "Tarifa e operação horária são informações diferentes.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q067",
    "difficulty": "Entender",
    "prompt": "Por que conferir o trajeto antes de usar um preço?",
    "options": [
      "Todos têm sempre a mesma tarifa",
      "Trajeto substitui a moeda",
      "Trechos podem ter tarifas diferentes",
      "Trajeto define a fonte salarial"
    ],
    "answerIndex": 2,
    "explanation": "O preço precisa corresponder à viagem considerada.",
    "sourceId": "antt-entorno-2026"
  },
  {
    "id": "q068",
    "difficulty": "Entender",
    "prompt": "Saldo de empregos formais é o mesmo que total de pessoas empregadas?",
    "options": [
      "Sim, sempre",
      "Sim, em qualquer ano",
      "Sim, quando positivo",
      "Não"
    ],
    "answerIndex": 3,
    "explanation": "Saldo e estoque são medidas diferentes do mercado de trabalho.",
    "sourceId": "caged-sebrae-2026"
  },
  {
    "id": "q069",
    "difficulty": "Entender",
    "prompt": "Empresas ativas e empregos formais contam a mesma coisa?",
    "options": [
      "Não",
      "Sim",
      "Sim, por definição",
      "Sim, se no mesmo ano"
    ],
    "answerIndex": 0,
    "explanation": "Uma medida conta estabelecimentos; a outra descreve vínculos ou movimentação laboral.",
    "sourceId": "caged-sebrae-2026"
  },
  {
    "id": "q070",
    "difficulty": "Entender",
    "prompt": "Uma taxa de segurança descreve o risco individual exato?",
    "options": [
      "Sim",
      "Não",
      "Sim, em todos os bairros",
      "Sim, em qualquer horário"
    ],
    "answerIndex": 1,
    "explanation": "Uma taxa agregada contextualiza registros, sem prever acontecimentos individuais.",
    "sourceId": "atlas-violencia-2026"
  },
  {
    "id": "q071",
    "difficulty": "Entender",
    "prompt": "Um indicador sem data pode receber o rótulo de atual automaticamente?",
    "options": [
      "Sim, pelo layout",
      "Sim, pelo ano do site",
      "Não",
      "Sim, pela cor verde"
    ],
    "answerIndex": 2,
    "explanation": "Atualidade depende da referência do dado, não da aparência da página.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q072",
    "difficulty": "Entender",
    "prompt": "O que difere publicação de consulta de uma fonte?",
    "options": [
      "São sempre o mesmo dia",
      "A consulta altera o valor",
      "A publicação garante tempo real",
      "São momentos distintos"
    ],
    "answerIndex": 3,
    "explanation": "Consultar hoje não transforma em recente o período medido.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q073",
    "difficulty": "Entender",
    "prompt": "Um dado derivado precisa informar o quê?",
    "options": [
      "Entradas e premissas do cálculo",
      "A preferência do leitor",
      "Um número sem unidade",
      "Só o nome do autor"
    ],
    "answerIndex": 0,
    "explanation": "Uma conta deve ser rastreável até os valores usados.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q074",
    "difficulty": "Entender",
    "prompt": "Arredondar um valor elimina sua incerteza?",
    "options": [
      "Sim",
      "Não",
      "Sim, em porcentagens",
      "Sim, em população"
    ],
    "answerIndex": 1,
    "explanation": "Arredondamento muda apresentação, não a natureza ou limites da medida.",
    "sourceId": "ibge-estimativas-2026"
  },
  {
    "id": "q075",
    "difficulty": "Entender",
    "prompt": "O que significa indicador histórico no painel?",
    "options": [
      "Dado necessariamente errado",
      "Previsão para amanhã",
      "Dado de um período anterior",
      "Consulta em tempo real"
    ],
    "answerIndex": 2,
    "explanation": "Um registro anterior continua útil quando sua referência é explícita.",
    "sourceId": "ibge-censo-2022"
  },
  {
    "id": "q076",
    "difficulty": "Entender",
    "prompt": "Uma fonte ampla do IBGE define uma data única para todos os indicadores?",
    "options": [
      "Sim, sempre",
      "Sim, no celular",
      "Sim, em CSV",
      "Não"
    ],
    "answerIndex": 3,
    "explanation": "Cada indicador do painel pode ter seu próprio ano-base.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q077",
    "difficulty": "Entender",
    "prompt": "O que significa informação secundária?",
    "options": [
      "Uma publicação que interpreta outra origem",
      "Uma fonte sempre falsa",
      "Um dado sem período por definição",
      "Uma execução orçamentária"
    ],
    "answerIndex": 0,
    "explanation": "É preciso conhecer tanto a publicação consultada quanto a origem da medida.",
    "sourceId": "qedu-ideb-2025"
  },
  {
    "id": "q078",
    "difficulty": "Entender",
    "prompt": "O que um plano educacional descreve?",
    "options": [
      "Todas as metas já realizadas",
      "Diretrizes ou metas no seu escopo",
      "Todas as notas atuais",
      "A frequência diária individual"
    ],
    "answerIndex": 1,
    "explanation": "Planejamento educacional precisa ser distinguido de resultado observado.",
    "sourceId": "pee-go-educacao-2025"
  },
  {
    "id": "q079",
    "difficulty": "Entender",
    "prompt": "Oferta prevista de educação profissional prova matrículas realizadas?",
    "options": [
      "Sim, sempre",
      "Sim, em qualquer rede",
      "Não",
      "Sim, por ser planejada"
    ],
    "answerIndex": 2,
    "explanation": "Oferta, capacidade e matrícula são medidas distintas.",
    "sourceId": "pee-go-ept-2025"
  },
  {
    "id": "q080",
    "difficulty": "Entender",
    "prompt": "Por que guardar referência e fonte ao compartilhar um dado?",
    "options": [
      "Para garantir concordância",
      "Para aumentar o valor",
      "Para dispensar contexto",
      "Para permitir interpretação e conferência"
    ],
    "answerIndex": 3,
    "explanation": "Um número isolado perde parte do seu significado e rastreabilidade.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q081",
    "difficulty": "Comparar",
    "prompt": "Para comparar população de dois anos, qual primeira conferência fazer?",
    "options": [
      "Território, período e método",
      "A cor dos cartões",
      "O número de links",
      "A ordem das fontes"
    ],
    "answerIndex": 0,
    "explanation": "Mudanças de base podem afetar a leitura da série.",
    "sourceId": "ibge-estimativas-2026"
  },
  {
    "id": "q082",
    "difficulty": "Comparar",
    "prompt": "Comparar Censo e estimativa exige qual ressalva?",
    "options": [
      "As unidades são sempre reais",
      "As naturezas estatísticas diferem",
      "O Censo mede ônibus",
      "A estimativa é pagamento"
    ],
    "answerIndex": 1,
    "explanation": "Uma mudança entre pontos pode envolver tanto tempo quanto método.",
    "sourceId": "ibge-censo-2022"
  },
  {
    "id": "q083",
    "difficulty": "Comparar",
    "prompt": "Dois valores municipais com mesmo número significam a mesma coisa?",
    "options": [
      "Sim, sempre",
      "Sim, se inteiros",
      "Só se definições e unidades forem compatíveis",
      "Sim, na mesma página"
    ],
    "answerIndex": 2,
    "explanation": "Igualdade numérica não garante equivalência conceitual.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q084",
    "difficulty": "Comparar",
    "prompt": "Uma cidade maior pode ter mais atendimentos sem maior taxa por morador?",
    "options": [
      "Não",
      "Só com orçamento zero",
      "Só sem fonte",
      "Sim"
    ],
    "answerIndex": 3,
    "explanation": "Totais e medidas relativas respondem a perguntas diferentes.",
    "sourceId": "healgo-200k"
  },
  {
    "id": "q085",
    "difficulty": "Comparar",
    "prompt": "Para comparar IDEB, quais recortes manter compatíveis?",
    "options": [
      "Etapa, rede e período",
      "Somente cor",
      "Somente título",
      "Somente ordem alfabética"
    ],
    "answerIndex": 0,
    "explanation": "A comparação depende dos grupos e períodos definidos na fonte.",
    "sourceId": "inep-2023"
  },
  {
    "id": "q086",
    "difficulty": "Comparar",
    "prompt": "Comparar anos iniciais com anos finais como uma única série é adequado?",
    "options": [
      "Sim, sem ressalva",
      "Não sem distinguir as etapas",
      "Sim, apenas por arredondar",
      "Sim, pelo nome da cidade"
    ],
    "answerIndex": 1,
    "explanation": "Etapas distintas não devem ser misturadas como se fossem o mesmo recorte.",
    "sourceId": "inep-2023"
  },
  {
    "id": "q087",
    "difficulty": "Comparar",
    "prompt": "O que verificar ao comparar uma nota do INEP com uma do QEdu?",
    "options": [
      "A largura da tela",
      "O número de imagens",
      "Origem, etapa e ano-base",
      "O tamanho do botão"
    ],
    "answerIndex": 2,
    "explanation": "Publicações diferentes podem remeter ao mesmo dado ou a recortes diferentes.",
    "sourceId": "qedu-ideb-2025"
  },
  {
    "id": "q088",
    "difficulty": "Comparar",
    "prompt": "Comparar LOA de dois exercícios responde diretamente sobre gasto realizado?",
    "options": [
      "Sim",
      "Sim, se valores cresceram",
      "Sim, se a moeda é igual",
      "Não"
    ],
    "answerIndex": 3,
    "explanation": "As duas LOAs descrevem planejamento, não necessariamente execução.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q089",
    "difficulty": "Comparar",
    "prompt": "Para confrontar orçamento previsto e despesa paga, o que preservar?",
    "options": [
      "A distinção entre as etapas",
      "Somar e chamar tudo de gasto",
      "Trocar os rótulos",
      "Apagar as datas"
    ],
    "answerIndex": 0,
    "explanation": "Planejamento e pagamento são medidas diferentes que precisam de identificação.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q090",
    "difficulty": "Comparar",
    "prompt": "Aumento nominal do orçamento prova aumento real de recursos?",
    "options": [
      "Sim",
      "Não, sem considerar preços e escopo",
      "Sim, por ser em reais",
      "Sim, se maior que zero"
    ],
    "answerIndex": 1,
    "explanation": "Comparar poder de compra exige contexto de preços e metodologia própria.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q091",
    "difficulty": "Comparar",
    "prompt": "Duas áreas com a mesma verba planejada têm necessariamente o mesmo serviço?",
    "options": [
      "Sim",
      "Sim, por lei de matemática",
      "Não",
      "Sim, se no mesmo ano"
    ],
    "answerIndex": 2,
    "explanation": "Custos, necessidades e resultados podem diferir entre políticas públicas.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q092",
    "difficulty": "Comparar",
    "prompt": "Qual base manter ao comparar participações de áreas na LOA?",
    "options": [
      "A população de outra cidade",
      "A nota escolar",
      "A quantidade de dias úteis",
      "O mesmo total orçamentário e exercício"
    ],
    "answerIndex": 3,
    "explanation": "Uma participação depende do total usado como denominador.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q093",
    "difficulty": "Comparar",
    "prompt": "Cobertura de água de anos diferentes pode ser comparada sem ler metodologia?",
    "options": [
      "Não",
      "Sim, sempre",
      "Sim, se ambos são percentuais",
      "Sim, se usam vírgula"
    ],
    "answerIndex": 0,
    "explanation": "Definição, território e universo podem mudar entre publicações.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q094",
    "difficulty": "Comparar",
    "prompt": "Comparar porcentagem de domicílios com porcentagem de pessoas exige o quê?",
    "options": [
      "Tratar ambas como idênticas",
      "Distinguir os denominadores",
      "Somá-las sempre",
      "Apagar as unidades"
    ],
    "answerIndex": 1,
    "explanation": "Domicílios e pessoas são universos diferentes.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q095",
    "difficulty": "Comparar",
    "prompt": "Se água tem cobertura maior que esgoto, o que a comparação sugere?",
    "options": [
      "Que todo imóvel está atendido",
      "Que não há interrupções",
      "Diferença entre dois serviços no recorte",
      "Que todo esgoto é tratado"
    ],
    "answerIndex": 2,
    "explanation": "A diferença descreve cobertura medida; não prova condições individuais.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q096",
    "difficulty": "Comparar",
    "prompt": "Uma cobertura de 60% passando a 70% cresce quantos pontos percentuais?",
    "options": [
      "70 pontos percentuais",
      "60 pontos percentuais",
      "130 pontos percentuais",
      "10 pontos percentuais"
    ],
    "answerIndex": 3,
    "explanation": "Subtrair percentuais produz diferença em pontos percentuais.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q097",
    "difficulty": "Comparar",
    "prompt": "Uma mudança de 60% para 70% equivale a aumento relativo de 10%?",
    "options": [
      "Não; são 10 pontos percentuais",
      "Sim",
      "Sim, por arredondamento",
      "Sim, se a fonte é oficial"
    ],
    "answerIndex": 0,
    "explanation": "Aumento relativo usa a base inicial; não é igual à subtração em pontos.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q098",
    "difficulty": "Comparar",
    "prompt": "Como comparar dois marcos acumulados de atendimento hospitalar?",
    "options": [
      "Ignorar os intervalos",
      "Conferir início e fim de cada acumulado",
      "Somar automaticamente",
      "Assumir pessoas únicas"
    ],
    "answerIndex": 1,
    "explanation": "Acumulados só fazem sentido com intervalo e definição conhecidos.",
    "sourceId": "healgo-200k"
  },
  {
    "id": "q099",
    "difficulty": "Comparar",
    "prompt": "Comparar leitos planejados e atendimentos realizados usa a mesma unidade?",
    "options": [
      "Sim",
      "Sim, por serem saúde",
      "Não",
      "Sim, pelo nome do hospital"
    ],
    "answerIndex": 2,
    "explanation": "Capacidade estrutural e produção de atendimento são medidas distintas.",
    "sourceId": "healgo"
  },
  {
    "id": "q100",
    "difficulty": "Comparar",
    "prompt": "Uma unidade com mais atendimentos é necessariamente de melhor qualidade?",
    "options": [
      "Sim",
      "Sim, por definição",
      "Sim, se maior no gráfico",
      "Não"
    ],
    "answerIndex": 3,
    "explanation": "Volume não resume qualidade, demanda, complexidade ou acesso.",
    "sourceId": "healgo-200k"
  },
  {
    "id": "q101",
    "difficulty": "Comparar",
    "prompt": "Comparar investimento de construção com custo de uma consulta é direto?",
    "options": [
      "Não, as medidas e períodos diferem",
      "Sim",
      "Sim, dividindo sem contexto",
      "Sim, se ambos em reais"
    ],
    "answerIndex": 0,
    "explanation": "Moeda igual não torna finalidade, escala e intervalo equivalentes.",
    "sourceId": "healgo"
  },
  {
    "id": "q102",
    "difficulty": "Comparar",
    "prompt": "Dois canais de saúde com nomes parecidos têm necessariamente a mesma função?",
    "options": [
      "Sim",
      "Não; confira a descrição institucional",
      "Sim, se municipais",
      "Sim, se no mesmo bairro"
    ],
    "answerIndex": 1,
    "explanation": "Escolher um canal exige compreender sua responsabilidade.",
    "sourceId": "municipal-caps-2026"
  },
  {
    "id": "q103",
    "difficulty": "Comparar",
    "prompt": "Para comparar custos de dois trajetos, qual premissa manter explícita?",
    "options": [
      "Só a cor do gráfico",
      "Só a população",
      "Tarifa, trechos e quantidade de viagens",
      "Só a nota escolar"
    ],
    "answerIndex": 2,
    "explanation": "A conta muda com preço e frequência de deslocamento.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q104",
    "difficulty": "Comparar",
    "prompt": "Por que comparar um dia de transporte com um mês de transporte é inadequado sem conversão?",
    "options": [
      "As tarifas nunca têm unidade",
      "O mês não tem dias",
      "O dia é orçamento",
      "Os períodos são diferentes"
    ],
    "answerIndex": 3,
    "explanation": "A comparação requer um intervalo comum e premissas identificadas.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q105",
    "difficulty": "Comparar",
    "prompt": "Na mesma tarifa, dobrar as viagens faz o custo calculado mudar como?",
    "options": [
      "Dobrar, mantidas as demais premissas",
      "Cair pela metade",
      "Ficar sempre igual",
      "Virar salário"
    ],
    "answerIndex": 0,
    "explanation": "A conta é tarifa multiplicada pela quantidade de viagens.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q106",
    "difficulty": "Comparar",
    "prompt": "Para comparar custo com duas referências salariais, o que declarar?",
    "options": [
      "Que todos ganham igual",
      "Qual base salarial foi usada em cada conta",
      "Que a tarifa mudou",
      "Que a população mudou"
    ],
    "answerIndex": 1,
    "explanation": "O percentual depende tanto do custo quanto da referência no denominador.",
    "sourceId": "inss-salario-2026"
  },
  {
    "id": "q107",
    "difficulty": "Comparar",
    "prompt": "Uma tarifa intermunicipal pode ser atribuída a qualquer ônibus local?",
    "options": [
      "Sim",
      "Sim, se há integração",
      "Não, confira o serviço e o trecho",
      "Sim, se ambos têm rodas"
    ],
    "answerIndex": 2,
    "explanation": "Categorias e trajetos precisam corresponder à tabela consultada.",
    "sourceId": "antt-entorno-2026"
  },
  {
    "id": "q108",
    "difficulty": "Comparar",
    "prompt": "Para comparar saldo de emprego de dois meses, o que confirmar?",
    "options": [
      "Só a quantidade de cores",
      "Só o título da página",
      "Só a área do hospital",
      "Recorte territorial e definição da série"
    ],
    "answerIndex": 3,
    "explanation": "Saldos devem se referir à mesma medida e base geográfica.",
    "sourceId": "caged-sebrae-2026"
  },
  {
    "id": "q109",
    "difficulty": "Comparar",
    "prompt": "Um estoque de empregos pode ser somado ao saldo como se fossem independentes?",
    "options": [
      "Não sem entender período e composição",
      "Sim, sempre",
      "Sim, se positivos",
      "Sim, no mesmo gráfico"
    ],
    "answerIndex": 0,
    "explanation": "Saldo é mudança; estoque é uma posição em uma referência.",
    "sourceId": "caged-sebrae-2026"
  },
  {
    "id": "q110",
    "difficulty": "Comparar",
    "prompt": "Comparar número de empresas com número de moradores responde sobre a mesma unidade?",
    "options": [
      "Sim",
      "Não",
      "Sim, em números inteiros",
      "Sim, se municipais"
    ],
    "answerIndex": 1,
    "explanation": "Estabelecimentos e pessoas são contagens de objetos diferentes.",
    "sourceId": "caged-sebrae-2026"
  },
  {
    "id": "q111",
    "difficulty": "Comparar",
    "prompt": "Uma taxa de violência de um ano pode ser chamada de situação de hoje?",
    "options": [
      "Sim",
      "Sim, se o site abriu hoje",
      "Não automaticamente",
      "Sim, se há gráfico"
    ],
    "answerIndex": 2,
    "explanation": "O período dos registros precisa permanecer explícito.",
    "sourceId": "atlas-violencia-2026"
  },
  {
    "id": "q112",
    "difficulty": "Comparar",
    "prompt": "Qual cuidado evita comparação injusta entre territórios de tamanhos diferentes?",
    "options": [
      "Usar apenas total bruto",
      "Ignorar população",
      "Escolher o maior número",
      "Considerar medidas relativas e seus denominadores"
    ],
    "answerIndex": 3,
    "explanation": "Taxas ajudam a contextualizar escala, mas também exigem definições compatíveis.",
    "sourceId": "atlas-violencia-2026"
  },
  {
    "id": "q113",
    "difficulty": "Comparar",
    "prompt": "Duas taxas com bases de 1.000 e 100.000 habitantes podem ser confrontadas diretamente?",
    "options": [
      "Não, precisam de escala compatível",
      "Sim",
      "Sim, se inteiras",
      "Sim, se do mesmo ano"
    ],
    "answerIndex": 0,
    "explanation": "A unidade da taxa inclui a base por habitantes.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q114",
    "difficulty": "Comparar",
    "prompt": "Comparar renda por pessoa com renda por domicílio requer o quê?",
    "options": [
      "Assumir igualdade",
      "Distinguir as unidades e universos",
      "Somar as médias",
      "Ignorar a metodologia"
    ],
    "answerIndex": 1,
    "explanation": "Pessoa e domicílio são denominadores diferentes.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q115",
    "difficulty": "Comparar",
    "prompt": "Duas estimativas com territórios diferentes formam uma série contínua automaticamente?",
    "options": [
      "Sim",
      "Sim, pelo mesmo nome",
      "Não",
      "Sim, pelo mesmo órgão"
    ],
    "answerIndex": 2,
    "explanation": "A base territorial integra a definição da medida.",
    "sourceId": "ibge-estimativas-2026"
  },
  {
    "id": "q116",
    "difficulty": "Comparar",
    "prompt": "O que uma lacuna na série histórica permite afirmar?",
    "options": [
      "Que o valor foi zero",
      "Que cresceu em linha reta",
      "Que caiu pela metade",
      "Que não há ponto publicado naquele intervalo no conjunto"
    ],
    "answerIndex": 3,
    "explanation": "Ausência de ponto não deve ser preenchida por suposição.",
    "sourceId": "ibge-censo-2022"
  },
  {
    "id": "q117",
    "difficulty": "Comparar",
    "prompt": "Uma linha entre dois pontos publicados comprova o valor em cada ano intermediário?",
    "options": [
      "Não",
      "Sim",
      "Sim, pelo desenho",
      "Sim, se azul"
    ],
    "answerIndex": 0,
    "explanation": "O gráfico não cria observações para anos sem registro.",
    "sourceId": "ibge-estimativas-2026"
  },
  {
    "id": "q118",
    "difficulty": "Comparar",
    "prompt": "Ao comparar duas fontes conflitantes, qual ação ajuda?",
    "options": [
      "Escolher o maior valor",
      "Verificar definição, data e origem",
      "Escolher a mais bonita",
      "Somar as duas"
    ],
    "answerIndex": 1,
    "explanation": "Diferenças podem refletir recortes distintos e exigem conferência.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q119",
    "difficulty": "Comparar",
    "prompt": "Comparar meta educacional com resultado observado pede qual cuidado?",
    "options": [
      "Chamar ambos de execução",
      "Apagar o período",
      "Separar planejamento de medição",
      "Usar só a cor"
    ],
    "answerIndex": 2,
    "explanation": "Uma meta expressa intenção; um resultado registra uma medida.",
    "sourceId": "pee-go-educacao-2025"
  },
  {
    "id": "q120",
    "difficulty": "Comparar",
    "prompt": "Qual comparação é mais responsável numa mensagem pública?",
    "options": [
      "Números isolados",
      "Datas apagadas",
      "Universos misturados",
      "Mesma medida, período e fonte identificados"
    ],
    "answerIndex": 3,
    "explanation": "Comparabilidade e contexto sustentam uma conclusão rastreável.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q121",
    "difficulty": "Conferir",
    "prompt": "Um cartão tem valor mas não fonte. Qual verificação falta?",
    "options": [
      "Origem rastreável da medida",
      "Uma cor mais forte",
      "Um ícone",
      "Um botão maior"
    ],
    "answerIndex": 0,
    "explanation": "Sem origem identificada fica difícil conferir método e recorte.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q122",
    "difficulty": "Conferir",
    "prompt": "Qual data verificar para saber quando uma estimativa se aplica?",
    "options": [
      "Dia de acesso ao site",
      "Data de referência",
      "Data do seu dispositivo",
      "Dia da captura da tela"
    ],
    "answerIndex": 1,
    "explanation": "A referência identifica o momento estatístico da estimativa.",
    "sourceId": "ibge-estimativas-2026"
  },
  {
    "id": "q123",
    "difficulty": "Conferir",
    "prompt": "Uma página atualizada hoje garante que seu dado é deste ano?",
    "options": [
      "Sim",
      "Sim, se oficial",
      "Não",
      "Sim, se tem HTTPS"
    ],
    "answerIndex": 2,
    "explanation": "Atualização da página e período do indicador são metadados distintos.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q124",
    "difficulty": "Conferir",
    "prompt": "Qual informação conferir no Panorama do Censo?",
    "options": [
      "Só o logotipo",
      "Só o tamanho da tela",
      "Só a cor do título",
      "Município e referência censitária"
    ],
    "answerIndex": 3,
    "explanation": "O recorte territorial e a referência determinam a leitura da contagem.",
    "sourceId": "ibge-censo-2022"
  },
  {
    "id": "q125",
    "difficulty": "Conferir",
    "prompt": "Qual conferência evita atribuir uma data fictícia a um ano-base?",
    "options": [
      "Registrar o ano sem inventar dia e mês",
      "Usar sempre 1º de janeiro",
      "Usar o dia de hoje",
      "Usar sempre 31 de dezembro"
    ],
    "answerIndex": 0,
    "explanation": "Precisão anual não equivale a uma data exata publicada.",
    "sourceId": "inep-ideb-2025"
  },
  {
    "id": "q126",
    "difficulty": "Conferir",
    "prompt": "Para rastrear um IDEB reproduzido em outra plataforma, onde começar?",
    "options": [
      "Na quantidade de seguidores",
      "Na referência de origem e no recorte informado",
      "Na cor do site",
      "No preço do ônibus"
    ],
    "answerIndex": 1,
    "explanation": "A plataforma intermediária deve permitir entender a série original.",
    "sourceId": "qedu-ideb-2025"
  },
  {
    "id": "q127",
    "difficulty": "Conferir",
    "prompt": "Qual detalhe conferir antes de citar o IDEB da cidade?",
    "options": [
      "Só o município",
      "Só o valor",
      "Etapa de ensino, rede e ano",
      "Só o título do cartão"
    ],
    "answerIndex": 2,
    "explanation": "O mesmo município tem diferentes recortes educacionais.",
    "sourceId": "inep-2023"
  },
  {
    "id": "q128",
    "difficulty": "Conferir",
    "prompt": "Uma nota metodológica contradiz sua primeira interpretação. O que fazer?",
    "options": [
      "Ignorar a nota",
      "Apagar a fonte",
      "Escolher outro número sem explicação",
      "Rever a conclusão segundo a definição"
    ],
    "answerIndex": 3,
    "explanation": "A definição publicada limita o que se pode concluir.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q129",
    "difficulty": "Conferir",
    "prompt": "O orçamento aparece como LOA. Qual termo verificar antes de chamá-lo de gasto?",
    "options": [
      "Se é autorizado ou executado",
      "A cor da tabela",
      "O tamanho da moeda",
      "A posição do cartão"
    ],
    "answerIndex": 0,
    "explanation": "LOA é planejamento autorizado; gasto requer evidência de execução.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q130",
    "difficulty": "Conferir",
    "prompt": "Para dizer que houve pagamento de uma despesa, qual evidência falta à LOA sozinha?",
    "options": [
      "Número de moradores",
      "Registro de pagamento do período",
      "Imagem do hospital",
      "Tabela de ônibus"
    ],
    "answerIndex": 1,
    "explanation": "A autorização não prova que uma despesa foi paga.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q131",
    "difficulty": "Conferir",
    "prompt": "Uma soma de áreas diverge do total informado. Qual primeiro passo?",
    "options": [
      "Alterar o total por suposição",
      "Excluir a fonte",
      "Conferir composição e recortes",
      "Dividir tudo pela população"
    ],
    "answerIndex": 2,
    "explanation": "Diferenças podem resultar de categorias ou escopos; devem ser investigadas.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q132",
    "difficulty": "Conferir",
    "prompt": "Um valor de orçamento tem escala em milhões. O que verificar no CSV?",
    "options": [
      "Se a cor foi preservada",
      "Se há emojis",
      "Se o arquivo tem foto",
      "Se a unidade e a escala foram preservadas"
    ],
    "answerIndex": 3,
    "explanation": "Escala incorreta pode multiplicar ou reduzir indevidamente a quantia.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q133",
    "difficulty": "Conferir",
    "prompt": "Para citar cobertura sanitária, qual definição procurar?",
    "options": [
      "O universo e o serviço medidos",
      "Só o município",
      "Só a cor do gráfico",
      "Só o percentual maior"
    ],
    "answerIndex": 0,
    "explanation": "Água, coleta e tratamento têm definições específicas.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q134",
    "difficulty": "Conferir",
    "prompt": "Uma porcentagem sanitária não tem denominador explícito. Qual limite registrar?",
    "options": [
      "Ela vale para qualquer universo",
      "Não é possível interpretar completamente a cobertura",
      "Ela mede todos os serviços",
      "Ela é atual automaticamente"
    ],
    "answerIndex": 1,
    "explanation": "Uma proporção exige identificar a base à qual se refere.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q135",
    "difficulty": "Conferir",
    "prompt": "A fonte fala em pessoas e a mensagem fala em domicílios. O que corrigir?",
    "options": [
      "A cor da mensagem",
      "O dia do acesso",
      "O universo citado",
      "O tamanho do título"
    ],
    "answerIndex": 2,
    "explanation": "Não se deve trocar a unidade ou a população de referência.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q136",
    "difficulty": "Conferir",
    "prompt": "Antes de usar um contato de saneamento, qual endereço conferir?",
    "options": [
      "O nome de um comentário",
      "Uma imagem encaminhada",
      "Um contato sem origem",
      "O domínio e a página institucional"
    ],
    "answerIndex": 3,
    "explanation": "A referência do prestador ajuda a confirmar o canal responsável.",
    "sourceId": "saneago-atendimento-2026"
  },
  {
    "id": "q137",
    "difficulty": "Conferir",
    "prompt": "Ao citar atendimentos acumulados do hospital, o que precisa acompanhar o total?",
    "options": [
      "Intervalo e definição de atendimento",
      "Só a capacidade planejada",
      "Só a área da cidade",
      "Só a LOA"
    ],
    "answerIndex": 0,
    "explanation": "Sem intervalo o acumulado pode parecer uma produção diária ou anual.",
    "sourceId": "healgo-200k"
  },
  {
    "id": "q138",
    "difficulty": "Conferir",
    "prompt": "Uma notícia menciona leitos previstos. Como registrar a natureza?",
    "options": [
      "Executada automaticamente",
      "Planejada",
      "Paga",
      "Em tempo real"
    ],
    "answerIndex": 1,
    "explanation": "A redação deve preservar a diferença entre previsão e operação.",
    "sourceId": "healgo"
  },
  {
    "id": "q139",
    "difficulty": "Conferir",
    "prompt": "Uma notícia sobre construção informa custo operacional atual?",
    "options": [
      "Sempre",
      "Só pelo valor ser alto",
      "Não, salvo evidência específica",
      "Só pelo prédio existir"
    ],
    "answerIndex": 2,
    "explanation": "A finalidade do investimento precisa ser mantida na citação.",
    "sourceId": "healgo"
  },
  {
    "id": "q140",
    "difficulty": "Conferir",
    "prompt": "Para confirmar a finalidade do CAPS, qual referência consultar?",
    "options": [
      "A tabela salarial",
      "O histórico de população",
      "O total da LOA",
      "A página institucional indicada"
    ],
    "answerIndex": 3,
    "explanation": "A instituição descreve seu serviço e suas orientações.",
    "sourceId": "municipal-caps-2026"
  },
  {
    "id": "q141",
    "difficulty": "Conferir",
    "prompt": "Um canal de saúde tem informações incompletas. O que fazer antes de orientar outra pessoa?",
    "options": [
      "Conferir a orientação do órgão responsável",
      "Inventar horário",
      "Garantir vaga",
      "Supor atendimento universal"
    ],
    "answerIndex": 0,
    "explanation": "O catálogo encaminha; disponibilidade e orientação precisam de confirmação oficial.",
    "sourceId": "municipal-samu-2026"
  },
  {
    "id": "q142",
    "difficulty": "Conferir",
    "prompt": "Um contato do Conselho Tutelar foi compartilhado sem origem. Qual passo ajuda?",
    "options": [
      "Repassar sem conferir",
      "Comparar com a referência institucional",
      "Adicionar prazo inventado",
      "Atribuir a outro órgão"
    ],
    "answerIndex": 1,
    "explanation": "A verificação deve voltar ao canal publicado pelo responsável.",
    "sourceId": "municipal-conselho-tutelar-2026"
  },
  {
    "id": "q143",
    "difficulty": "Conferir",
    "prompt": "Qual cuidado ao citar uma orientação da Defesa Civil?",
    "options": [
      "Transformá-la em previsão certa",
      "Remover o órgão",
      "Preservar fonte e contexto da orientação",
      "Garantir ausência de risco"
    ],
    "answerIndex": 2,
    "explanation": "Orientações precisam ser lidas no contexto da publicação oficial.",
    "sourceId": "municipal-defesa-civil-2026"
  },
  {
    "id": "q144",
    "difficulty": "Conferir",
    "prompt": "Antes de calcular custo de transporte, o que conferir na tabela?",
    "options": [
      "Número de escolas",
      "Total de leitos",
      "Área municipal",
      "Preço e trecho correspondente"
    ],
    "answerIndex": 3,
    "explanation": "O cálculo só é útil quando usa a tarifa adequada ao deslocamento.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q145",
    "difficulty": "Conferir",
    "prompt": "Uma tarifa foi consultada hoje, mas a referência é antiga. Como apresentá-la?",
    "options": [
      "Com sua referência e ressalva de vigência",
      "Como preço confirmado de hoje",
      "Como preço futuro garantido",
      "Sem qualquer data"
    ],
    "answerIndex": 0,
    "explanation": "Consulta recente não comprova que o preço permanece vigente.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q146",
    "difficulty": "Conferir",
    "prompt": "O simulador produz um custo muito alto. Qual checagem inicial fazer?",
    "options": [
      "Trocar a população",
      "Tarifa, dias e viagens informados",
      "Apagar a fonte",
      "Modificar a LOA"
    ],
    "answerIndex": 1,
    "explanation": "Erros nas entradas mudam o resultado derivado.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q147",
    "difficulty": "Conferir",
    "prompt": "Qual referência verificar ao calcular participação do transporte no salário mínimo?",
    "options": [
      "O saldo de empregos",
      "O IDEB",
      "Competência e valor salarial usados",
      "A área do município"
    ],
    "answerIndex": 2,
    "explanation": "A comparação deve declarar a base salarial do cálculo.",
    "sourceId": "inss-salario-2026"
  },
  {
    "id": "q148",
    "difficulty": "Conferir",
    "prompt": "Uma publicação da ANTT e uma tabela da operadora parecem divergir. Qual verificação fazer?",
    "options": [
      "Escolher a menor sem nota",
      "Somar as duas",
      "Ignorar as datas",
      "Escopo, trecho e referência de cada uma"
    ],
    "answerIndex": 3,
    "explanation": "Regras e tarifas precisam ser comparadas no mesmo serviço e período.",
    "sourceId": "antt-entorno-2026"
  },
  {
    "id": "q149",
    "difficulty": "Conferir",
    "prompt": "Um dado laboral foi chamado de desemprego, mas a fonte trata de saldo formal. O que fazer?",
    "options": [
      "Corrigir a descrição",
      "Manter porque é trabalho",
      "Somar com empresas",
      "Remover o período"
    ],
    "answerIndex": 0,
    "explanation": "Saldo de vínculos formais não é taxa de desemprego.",
    "sourceId": "caged-sebrae-2026"
  },
  {
    "id": "q150",
    "difficulty": "Conferir",
    "prompt": "Qual informação conferir num número de empresas ativas?",
    "options": [
      "Só o total",
      "Definição e data do cadastro",
      "Só a moeda",
      "Só o tamanho da cidade"
    ],
    "answerIndex": 1,
    "explanation": "O universo cadastral e a referência delimitam a contagem.",
    "sourceId": "caged-sebrae-2026"
  },
  {
    "id": "q151",
    "difficulty": "Conferir",
    "prompt": "Uma taxa de segurança aparece sem ano. Como tratar?",
    "options": [
      "Como atual automaticamente",
      "Como previsão para amanhã",
      "Como referência incompleta",
      "Como risco individual certo"
    ],
    "answerIndex": 2,
    "explanation": "O ano dos registros é necessário para contextualizar a taxa.",
    "sourceId": "atlas-violencia-2026"
  },
  {
    "id": "q152",
    "difficulty": "Conferir",
    "prompt": "Por que conferir notas de revisão de uma série?",
    "options": [
      "Para ignorar a fonte",
      "Para trocar a moeda",
      "Para eliminar o período",
      "A metodologia ou a base podem ter mudado"
    ],
    "answerIndex": 3,
    "explanation": "Revisões podem afetar comparabilidade e interpretação.",
    "sourceId": "ibge-estimativas-2026"
  },
  {
    "id": "q153",
    "difficulty": "Conferir",
    "prompt": "Uma fonte tem um link quebrado. Isso autoriza inventar seu valor?",
    "options": [
      "Não",
      "Sim",
      "Sim, se antigo",
      "Sim, se arredondado"
    ],
    "answerIndex": 0,
    "explanation": "Indisponibilidade deve ser informada, preservando o que foi documentado.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q154",
    "difficulty": "Conferir",
    "prompt": "O status de integridade da API prova atualização de todos os indicadores?",
    "options": [
      "Sim",
      "Não",
      "Sim, se está verde",
      "Sim, se retorna JSON"
    ],
    "answerIndex": 1,
    "explanation": "Integridade estrutural não equivale a atualidade de cada referência.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q155",
    "difficulty": "Conferir",
    "prompt": "Um indicador traz referência não informada. Qual afirmação evitar?",
    "options": [
      "Há limitação temporal",
      "A fonte precisa ser conferida",
      "É um retrato atual da cidade",
      "O período não foi identificado"
    ],
    "answerIndex": 2,
    "explanation": "Sem período identificado não se deve afirmar atualidade.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q156",
    "difficulty": "Conferir",
    "prompt": "Qual conferência fazer ao copiar uma citação do painel?",
    "options": [
      "Se tem mais emojis",
      "Se omite ressalvas",
      "Se remove o método",
      "Se valor, unidade, período e fonte acompanham a mensagem"
    ],
    "answerIndex": 3,
    "explanation": "A citação deve preservar informações necessárias à interpretação.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q157",
    "difficulty": "Conferir",
    "prompt": "Um plano estadual foi apresentado como resultado municipal. O que conferir?",
    "options": [
      "Escopo territorial e natureza do documento",
      "A cor da capa",
      "O nome do arquivo apenas",
      "A quantidade de páginas"
    ],
    "answerIndex": 0,
    "explanation": "Plano e resultado, estado e município, são recortes distintos.",
    "sourceId": "pee-go-educacao-2025"
  },
  {
    "id": "q158",
    "difficulty": "Conferir",
    "prompt": "Uma oferta educacional anunciada garante matrícula de toda pessoa?",
    "options": [
      "Sim",
      "Não",
      "Sim, se houver meta",
      "Sim, se o anúncio for oficial"
    ],
    "answerIndex": 1,
    "explanation": "Oferta anunciada não substitui critérios, vagas e registros de matrícula.",
    "sourceId": "pee-go-ept-2025"
  },
  {
    "id": "q159",
    "difficulty": "Conferir",
    "prompt": "Uma lei citada tem número, mas a mensagem omite seu objeto. Qual cuidado ajuda?",
    "options": [
      "Atribuir qualquer benefício",
      "Ignorar o texto",
      "Ler objeto e alcance na fonte",
      "Inventar uma regra"
    ],
    "answerIndex": 2,
    "explanation": "O conteúdo e o escopo da lei devem ser conferidos na referência.",
    "sourceId": "lei-1900-2026"
  },
  {
    "id": "q160",
    "difficulty": "Conferir",
    "prompt": "O que torna uma conclusão sobre dados verificável?",
    "options": [
      "Só repetir o número",
      "Só citar o nome do site",
      "Só usar tom de certeza",
      "Mostrar medidas, referências e limites usados"
    ],
    "answerIndex": 3,
    "explanation": "Outra pessoa precisa conseguir reconstruir a leitura a partir da origem.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q161",
    "difficulty": "Aplicar",
    "prompt": "Você quer entender o tamanho da cidade. Qual caminho usar primeiro?",
    "options": [
      "Ficha de população com período e fonte",
      "Somar tarifas",
      "Contar atendimentos como moradores",
      "Usar somente a LOA"
    ],
    "answerIndex": 0,
    "explanation": "A população municipal responde à pergunta demográfica quando sua natureza está clara.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q162",
    "difficulty": "Aplicar",
    "prompt": "Você vai compartilhar a estimativa populacional. Qual mensagem é responsável?",
    "options": [
      "Dizer contagem de hoje",
      "Informar valor, referência e que é estimativa",
      "Omitir o ano",
      "Chamar de Censo"
    ],
    "answerIndex": 1,
    "explanation": "A divulgação deve preservar natureza e referência da medida.",
    "sourceId": "ibge-estimativas-2026"
  },
  {
    "id": "q163",
    "difficulty": "Aplicar",
    "prompt": "Você quer explicar a mudança desde o Censo. Qual abordagem usar?",
    "options": [
      "Inventar valores intermediários",
      "Tratar toda mudança como erro",
      "Apresentar os pontos e distinguir métodos",
      "Dizer crescimento diário constante"
    ],
    "answerIndex": 2,
    "explanation": "A série permite contextualizar pontos publicados, com ressalvas metodológicas.",
    "sourceId": "ibge-censo-2022"
  },
  {
    "id": "q164",
    "difficulty": "Aplicar",
    "prompt": "Você precisa comparar cidades em densidade. Qual caminho é adequado?",
    "options": [
      "Usar somente tarifa",
      "Somar leitos e moradores",
      "Dividir LOA por IDEB",
      "Usar população e área de bases compatíveis"
    ],
    "answerIndex": 3,
    "explanation": "A densidade exige território e população coerentes entre si.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q165",
    "difficulty": "Aplicar",
    "prompt": "Você prepara uma conversa sobre educação. Qual informação levar junto do IDEB?",
    "options": [
      "Etapa, rede, ano e fonte",
      "Só o maior valor",
      "Só o logotipo",
      "Só a população"
    ],
    "answerIndex": 0,
    "explanation": "Recortes tornam a comparação educacional compreensível e verificável.",
    "sourceId": "inep-2023"
  },
  {
    "id": "q166",
    "difficulty": "Aplicar",
    "prompt": "Você vê melhora no índice escolar e quer explicar sua causa. O que fazer?",
    "options": [
      "Afirmar que foi uma única ação",
      "Buscar evidências adicionais antes de atribuir causa",
      "Deduzir apenas pela cor",
      "Concluir que todos melhoraram igualmente"
    ],
    "answerIndex": 1,
    "explanation": "Uma mudança no indicador não prova sozinha a causa nem cada trajetória individual.",
    "sourceId": "inep-ideb-2025"
  },
  {
    "id": "q167",
    "difficulty": "Aplicar",
    "prompt": "Você encontra o mesmo IDEB em duas plataformas. Como evitar contar como duas evidências independentes?",
    "options": [
      "Somar as notas",
      "Escolher a maior",
      "Verificar se ambas usam a mesma origem",
      "Eliminar o ano"
    ],
    "answerIndex": 2,
    "explanation": "Reprodução de uma mesma série não gera uma nova medição independente.",
    "sourceId": "qedu-ideb-2025"
  },
  {
    "id": "q168",
    "difficulty": "Aplicar",
    "prompt": "Você quer saber quanto foi gasto neste ano. A LOA resolve sozinha?",
    "options": [
      "Sim, o total autorizado é gasto",
      "Sim, toda previsão foi paga",
      "Sim, basta dividir por meses",
      "Não; procurar dados de execução e pagamento"
    ],
    "answerIndex": 3,
    "explanation": "Gasto realizado requer evidência diferente da autorização orçamentária.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q169",
    "difficulty": "Aplicar",
    "prompt": "Você publica um gráfico da distribuição da LOA. Qual título usar?",
    "options": [
      "Distribuição do orçamento autorizado no exercício",
      "Gastos pagos hoje",
      "Renda entregue a moradores",
      "Qualidade de todos os serviços"
    ],
    "answerIndex": 0,
    "explanation": "O título deve descrever planejamento e preservar o período.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q170",
    "difficulty": "Aplicar",
    "prompt": "Você dividiu a LOA pelos habitantes. Como explicar a conta?",
    "options": [
      "Valor recebido por cada pessoa",
      "Relação teórica por morador, sem repasse individual",
      "Salário municipal",
      "Benefício garantido"
    ],
    "answerIndex": 1,
    "explanation": "A divisão contextualiza escala e precisa declarar suas bases.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q171",
    "difficulty": "Aplicar",
    "prompt": "Você quer acompanhar uma despesa pública. Qual próximo passo a partir da LOA?",
    "options": [
      "Supor que tudo foi pago",
      "Inventar o saldo",
      "Procurar execução identificada por período e etapa",
      "Usar a tarifa como prova"
    ],
    "answerIndex": 2,
    "explanation": "O acompanhamento exige registros de execução, sem confundir as etapas.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q172",
    "difficulty": "Aplicar",
    "prompt": "Você vai comparar alocação de saúde e educação. Qual cuidado manter?",
    "options": [
      "Concluir qualidade só pelo valor",
      "Misturar anos sem nota",
      "Apagar o total",
      "Usar o mesmo exercício e explicar que é planejamento"
    ],
    "answerIndex": 3,
    "explanation": "A comparação financeira precisa de bases iguais e não mede qualidade sozinha.",
    "sourceId": "loa-2026"
  },
  {
    "id": "q173",
    "difficulty": "Aplicar",
    "prompt": "Sua mensagem chamou cobertura de água de abastecimento sem falhas. Como corrigir?",
    "options": [
      "Informar que cobertura não mede continuidade",
      "Manter sem ressalva",
      "Trocar por qualidade hospitalar",
      "Retirar a fonte"
    ],
    "answerIndex": 0,
    "explanation": "O indicador de acesso não demonstra sozinho regularidade de fornecimento.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q174",
    "difficulty": "Aplicar",
    "prompt": "Você quer estudar falta de água num bairro. O indicador municipal basta?",
    "options": [
      "Sim, descreve cada imóvel",
      "Não; buscar informação específica do local e serviço",
      "Sim, prova toda ocorrência",
      "Sim, substitui atendimento"
    ],
    "answerIndex": 1,
    "explanation": "Agregados municipais não substituem registros e informações locais.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q175",
    "difficulty": "Aplicar",
    "prompt": "Você precisa encaminhar uma demanda de saneamento. Qual recurso utilizar?",
    "options": [
      "A nota do IDEB",
      "Um total de moradores",
      "Canal institucional de atendimento com orientações",
      "Uma previsão da LOA"
    ],
    "answerIndex": 2,
    "explanation": "O catálogo liga a necessidade prática ao prestador responsável.",
    "sourceId": "saneago-atendimento-2026"
  },
  {
    "id": "q176",
    "difficulty": "Aplicar",
    "prompt": "Você compara água e esgoto numa apresentação. Qual rótulo preservar?",
    "options": [
      "Só a porcentagem",
      "Só o total maior",
      "Só a cor",
      "Serviço, universo e período de cada indicador"
    ],
    "answerIndex": 3,
    "explanation": "A comparação exige saber o que cada cobertura representa.",
    "sourceId": "sinisa-2024"
  },
  {
    "id": "q177",
    "difficulty": "Aplicar",
    "prompt": "Você quer falar sobre o hospital sem garantir vagas. Qual redação é adequada?",
    "options": [
      "Descrever os dados publicados e indicar o canal oficial",
      "Prometer atendimento imediato",
      "Dizer que todo leito está livre",
      "Inventar horário"
    ],
    "answerIndex": 0,
    "explanation": "Informações publicadas e disponibilidade individual não são equivalentes.",
    "sourceId": "healgo"
  },
  {
    "id": "q178",
    "difficulty": "Aplicar",
    "prompt": "Você leu um marco acumulado do hospital. Como divulgá-lo?",
    "options": [
      "Chamar de pessoas únicas sem prova",
      "Citar o intervalo e que se trata de atendimentos",
      "Chamar de atendimentos de hoje",
      "Omitir o período"
    ],
    "answerIndex": 1,
    "explanation": "A interpretação precisa preservar a definição do acumulado.",
    "sourceId": "healgo-200k"
  },
  {
    "id": "q179",
    "difficulty": "Aplicar",
    "prompt": "Você quer avaliar atendimento de saúde. Qual conjunto de informações ajuda além da capacidade planejada?",
    "options": [
      "Só valor da construção",
      "Só população total",
      "Dados de operação, acesso e contexto",
      "Só o título do hospital"
    ],
    "answerIndex": 2,
    "explanation": "Capacidade prevista não resume o funcionamento do serviço.",
    "sourceId": "healgo"
  },
  {
    "id": "q180",
    "difficulty": "Aplicar",
    "prompt": "Você busca um serviço de saúde mental. Qual ação o catálogo permite?",
    "options": [
      "Garantir diagnóstico",
      "Garantir vaga hoje",
      "Substituir avaliação profissional",
      "Encontrar e conferir o canal institucional do CAPS"
    ],
    "answerIndex": 3,
    "explanation": "O catálogo orienta o acesso à informação oficial do serviço.",
    "sourceId": "municipal-caps-2026"
  },
  {
    "id": "q181",
    "difficulty": "Aplicar",
    "prompt": "Você precisa verificar como usar o SAMU. Qual ação é adequada?",
    "options": [
      "Consultar as orientações oficiais do canal",
      "Inventar critérios",
      "Usar só o orçamento",
      "Comparar notas escolares"
    ],
    "answerIndex": 0,
    "explanation": "Orientações de atendimento devem ser conferidas com o responsável.",
    "sourceId": "municipal-samu-2026"
  },
  {
    "id": "q182",
    "difficulty": "Aplicar",
    "prompt": "Você orienta alguém a procurar o Conselho Tutelar. O que compartilhar?",
    "options": [
      "Uma promessa de prazo",
      "Contato institucional e descrição da finalidade",
      "Uma senha",
      "Uma tarifa"
    ],
    "answerIndex": 1,
    "explanation": "O encaminhamento deve manter a origem e a função do serviço.",
    "sourceId": "municipal-conselho-tutelar-2026"
  },
  {
    "id": "q183",
    "difficulty": "Aplicar",
    "prompt": "Você encontra informação de risco local. Qual ação ajuda a buscar orientação?",
    "options": [
      "Deduzir pela população",
      "Usar o IDEB",
      "Conferir o canal da Defesa Civil",
      "Garantir que não há risco"
    ],
    "answerIndex": 2,
    "explanation": "O órgão responsável publica orientações; o painel não prevê eventos individuais.",
    "sourceId": "municipal-defesa-civil-2026"
  },
  {
    "id": "q184",
    "difficulty": "Aplicar",
    "prompt": "Você quer estimar deslocamento de trabalho no mês. O que informar ao simulador?",
    "options": [
      "Só população",
      "Só área territorial",
      "Só orçamento",
      "Tarifa, quantidade de trechos e dias"
    ],
    "answerIndex": 3,
    "explanation": "O custo estimado depende dessas premissas de viagem.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q185",
    "difficulty": "Aplicar",
    "prompt": "Você alterou de ida para ida e volta. Qual interpretação esperar?",
    "options": [
      "Mais trechos entram na conta",
      "A tarifa oficial mudou",
      "O salário aumentou",
      "O orçamento foi executado"
    ],
    "answerIndex": 0,
    "explanation": "A alteração é da quantidade simulada de viagens, não da tarifa publicada.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q186",
    "difficulty": "Aplicar",
    "prompt": "Você vai compartilhar um custo simulado. O que incluir?",
    "options": [
      "Uma garantia de preço futuro",
      "Premissas e referência da tarifa",
      "Uma afirmação de renda individual",
      "Só o total sem contexto"
    ],
    "answerIndex": 1,
    "explanation": "Um cálculo derivado deve poder ser reconstruído.",
    "sourceId": "utb-tarifas"
  },
  {
    "id": "q187",
    "difficulty": "Aplicar",
    "prompt": "Você quer comparar o custo com seu rendimento. O que evitar?",
    "options": [
      "Explicar a base usada",
      "Informar as premissas",
      "Tratar o salário mínimo de referência como sua renda automaticamente",
      "Conferir a competência"
    ],
    "answerIndex": 2,
    "explanation": "A base do simulador é uma referência declarada, não um cadastro de renda pessoal.",
    "sourceId": "inss-salario-2026"
  },
  {
    "id": "q188",
    "difficulty": "Aplicar",
    "prompt": "Você consulta uma tarifa do Entorno para outro trajeto. Qual próximo passo?",
    "options": [
      "Aplicar a todos os ônibus",
      "Dobrar sem motivo",
      "Ignorar a origem",
      "Confirmar se a tabela cobre esse serviço e trecho"
    ],
    "answerIndex": 3,
    "explanation": "A utilidade do preço depende da correspondência com a viagem.",
    "sourceId": "antt-entorno-2026"
  },
  {
    "id": "q189",
    "difficulty": "Aplicar",
    "prompt": "Você escreve sobre criação de empregos formais. Qual cuidado tomar?",
    "options": [
      "Identificar se o dado é saldo e seu período",
      "Chamar de todos os ocupados",
      "Chamar de desemprego total",
      "Somar com população"
    ],
    "answerIndex": 0,
    "explanation": "A medida do mercado formal deve manter sua definição.",
    "sourceId": "caged-sebrae-2026"
  },
  {
    "id": "q190",
    "difficulty": "Aplicar",
    "prompt": "Você quer explicar a economia local com empresas ativas. Qual ressalva incluir?",
    "options": [
      "Cada empresa tem o mesmo número de empregados",
      "O cadastro não descreve sozinho toda a economia",
      "Todas as famílias têm empresa",
      "Toda atividade informal está incluída"
    ],
    "answerIndex": 1,
    "explanation": "Um indicador cadastral é uma parte do contexto econômico.",
    "sourceId": "caged-sebrae-2026"
  },
  {
    "id": "q191",
    "difficulty": "Aplicar",
    "prompt": "Você divulga uma taxa de segurança. Qual forma evita previsão individual?",
    "options": [
      "Garantir risco de cada pessoa",
      "Afirmar a situação de todo bairro",
      "Apresentar período, definição e limites do agregado",
      "Omitir a referência"
    ],
    "answerIndex": 2,
    "explanation": "Taxas agregadas não são previsão individual de ocorrência.",
    "sourceId": "atlas-violencia-2026"
  },
  {
    "id": "q192",
    "difficulty": "Aplicar",
    "prompt": "Você encontra dois números divergentes de população. Qual investigação iniciar?",
    "options": [
      "Escolher o mais recente visualmente",
      "Somar ambos",
      "Apagar o menor",
      "Conferir se são Censo, estimativa e anos diferentes"
    ],
    "answerIndex": 3,
    "explanation": "Natureza e referência ajudam a compreender divergências aparentes.",
    "sourceId": "ibge-estimativas-2026"
  },
  {
    "id": "q193",
    "difficulty": "Aplicar",
    "prompt": "Você vai enviar um CSV a outra pessoa. O que preservar?",
    "options": [
      "Unidades, referências e fontes",
      "Só a primeira coluna",
      "Só os valores maiores",
      "Só a aparência"
    ],
    "answerIndex": 0,
    "explanation": "Metadados permitem reutilização responsável dos dados exportados.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q194",
    "difficulty": "Aplicar",
    "prompt": "Você pretende atualizar um valor sem nova fonte. Qual decisão tomar?",
    "options": [
      "Atualizar por intuição",
      "Preservar o valor documentado e registrar a limitação",
      "Usar a data de hoje",
      "Inventar um percentual"
    ],
    "answerIndex": 1,
    "explanation": "Atualização exige evidência, não apenas mudança de calendário.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q195",
    "difficulty": "Aplicar",
    "prompt": "Você recebe um número sem contexto numa mensagem. Qual conjunto de perguntas fazer?",
    "options": [
      "Qual cor e tamanho?",
      "Quantos emojis tem?",
      "O que mede, de quando é e qual a fonte?",
      "Quem compartilhou mais rápido?"
    ],
    "answerIndex": 2,
    "explanation": "Essas perguntas recuperam significado, referência e origem.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q196",
    "difficulty": "Aplicar",
    "prompt": "Você tem uma meta educacional e quer acompanhar seu cumprimento. O que buscar?",
    "options": [
      "Tratar a meta como realizada",
      "Somar a meta com população",
      "Ignorar a etapa",
      "Resultados medidos no mesmo escopo e período"
    ],
    "answerIndex": 3,
    "explanation": "Acompanhamento depende de evidências de resultado compatíveis com o planejamento.",
    "sourceId": "pee-go-educacao-2025"
  },
  {
    "id": "q197",
    "difficulty": "Aplicar",
    "prompt": "Você vê anúncio de educação profissional. Como usá-lo com responsabilidade?",
    "options": [
      "Conferir escopo e condições na fonte antes de orientar",
      "Prometer matrícula",
      "Garantir vagas ilimitadas",
      "Chamar de matrícula realizada"
    ],
    "answerIndex": 0,
    "explanation": "O anúncio de oferta precisa ser distinguido de acesso efetivado.",
    "sourceId": "pee-go-ept-2025"
  },
  {
    "id": "q198",
    "difficulty": "Aplicar",
    "prompt": "Você cita uma lei municipal num guia de serviços. Qual passo realizar?",
    "options": [
      "Atribuir direitos não descritos",
      "Ler a norma e limitar a orientação ao seu objeto",
      "Inventar prazos",
      "Usar apenas o número"
    ],
    "answerIndex": 1,
    "explanation": "A norma deve ser consultada antes de formular orientações sobre seu alcance.",
    "sourceId": "lei-1900-2026"
  },
  {
    "id": "q199",
    "difficulty": "Aplicar",
    "prompt": "Você concluiu que dois indicadores se moveram juntos. Isso comprova causa?",
    "options": [
      "Sim, sempre",
      "Sim, no mesmo gráfico",
      "Não; são necessárias outras evidências",
      "Sim, pelo mesmo município"
    ],
    "answerIndex": 2,
    "explanation": "Associação temporal não prova sozinha relação causal.",
    "sourceId": "ibge-cidades-2026"
  },
  {
    "id": "q200",
    "difficulty": "Aplicar",
    "prompt": "Você prepara uma conclusão para o leitor comum. Qual formato é mais útil?",
    "options": [
      "Listar números sem contexto",
      "Omitir ressalvas",
      "Exigir memorização",
      "Explicar medida, período, significado, limites e fonte"
    ],
    "answerIndex": 3,
    "explanation": "Uma explicação acessível conecta a medida ao que ela permite compreender.",
    "sourceId": "ibge-cidades-2026"
  }
];
