# Observatório: fase municipal e serviços públicos

## Propósito da versão

Ajudar moradores de Águas Lindas de Goiás a entender os dados da cidade, encontrar canais oficiais de atendimento e acompanhar o uso dos recursos públicos. A abertura apresenta necessidades concretas: cidade, serviços, orçamento, transporte, saúde e saneamento, e consulta aos dados.

## Alterações implementadas

- Abertura com propósito municipal e orientação para consultar assunto, período e fonte e continuar no órgão responsável.
- Resumo único com população, acesso à água, orçamento planejado por habitante e atendimento público de esgoto. Os valores vêm dos indicadores estruturados; ausência de registro não vira zero.
- Água e esgoto substituem dois indicadores eleitorais no painel inicial. Ano-base 2024 aparece como período anual, sem inventar uma data de captura.
- Navegação inferior: Início, Cidade, Serviços, Dados e Mais.
- Resultados, perfil eleitoral, candidaturas, pesquisas e linha do tempo estão no acervo carregado por navegação explícita. O quiz também é opcional. Links diretos e busca continuam abrindo esses destinos.
- Removidos o destaque eleitoral da abertura, os blocos repetidos do resumo e cinco arquivos da antiga camada `summary-polish` — mais de duas mil linhas de estilos. Preservadas as regras necessárias de foco, contraste e salto por teclado em estilos mantidos.
- Título, descrição, instalação PWA, marca e imagem social apresentam um observatório público municipal. A data de publicação do conjunto é distinguida dos períodos dos indicadores.
- Mantidas as melhorias anteriores: catálogo pesquisável, CSV da seleção, comparador com referências e limites, consulta de resultados e formulário de correção com contexto e evidência.

## Verificação

- Build de produção e TypeScript concluídos.
- 25 auditorias e contratos de dados aprovados, além dos guards que verificam se as auditorias rejeitam regressões.
- Orçamentos de bundle e performance estática aprovados. O JavaScript inicial ainda está acima de 80% do limite de rede; permanece uma oportunidade de redução.
- Suíte Chrome desktop: 175 casos executados, 155 aprovados inicialmente, 18 falhas corrigidas e os 18 casos reexecutados com sucesso; 2 casos ignorados pela própria suíte. Cobertura final desses casos: 173 aprovados.
- Verificações de acessibilidade na entrada, quiz, acervo eleitoral, serviços, transporte, exportação, catálogo, comparador e formulário de correção.
- Regressões de teste corrigidas: espera pela montagem real antes de atalhos, resultado histórico aberto no destino correto e seletores restritos à seção correspondente.
- Teste de rede comprova que acervo eleitoral e quiz não são carregados ao simplesmente percorrer a página inicial.
- Chrome com emulação Android: navegação, busca, foco, gráficos e novos fluxos municipais verificados.

## Dados e limites

Esta etapa não atualiza valores por suposição. A publicação do conjunto em 05/10/2026 não torna atuais as séries de 2024. Acesso ao esgoto não significa percentual tratado; orçamento planejado não significa gasto executado. A divergência entre os recortes de eleitorado continua disponível na leitura detalhada.

Próximas prioridades: conferir documentação dos períodos e universos na origem, atualizar indicadores com fontes comprovadas e medir o uso real dos destinos municipais antes de expandir funcionalidades. As evidências e pendências da auditoria anterior continuam válidas.

As alterações estão na proposta de reformulação do GitHub, PR #356. Esta entrega não confirma publicação no site de produção.
