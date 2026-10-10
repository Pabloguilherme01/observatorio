# Auditoria e reformulação do Observatório

Data: 9 de outubro de 2026. Repositório: [Pabloguilherme01/observatorio](https://github.com/Pabloguilherme01/observatorio). Base examinada: `25138dcd5efed3a69e5a0ba8c296fc26a96b6244`. Proposta: branch `reformulacao/observatorio-publico`.

## Diagnóstico

O projeto reúne dados municipais, serviços, transporte, orçamento e eleições, mas a entrada dava peso excessivo ao contexto eleitoral e repetia explicações antes das ações úteis. A finalidade recomendada é **ajudar moradores de Águas Lindas de Goiás a entender a cidade, encontrar serviços e acompanhar recursos públicos, com números cuja origem e período possam ser conferidos**.

A auditoria combinou leitura do código, inspeção do site publicado e da versão local, testes automatizados, revisão dos contratos de dados e consulta a fontes oficiais. Não houve entrevistas ou teste com moradores: os achados de usabilidade são avaliação técnica, não pesquisa de campo. Um link acessível não comprova o valor atribuído à fonte.

## Público e tarefas

| Público | Necessidade | Entrada proposta |
|---|---|---|
| Morador | Entender população, saneamento, saúde e educação | Entender a cidade |
| Pessoa procurando atendimento | Chegar ao canal público correto | Encontrar um serviço |
| Trabalhador e estudante | Simular gastos de deslocamento | Calcular meu transporte |
| Cidadão acompanhando a gestão | Distinguir orçamento previsto de execução | Acompanhar o dinheiro público |
| Eleitor | Consultar resultado, cargo e nome | Consultar as eleições |
| Jornalista, pesquisador e conselho | Localizar indicadores e conferir fontes | Pesquisar e conferir dados |

## Achados e tratamento

| Prioridade | Achado | Tratamento |
|---|---|---|
| Alta | Entrada eleitoral e múltiplos blocos repetiam caminhos | Nova apresentação municipal e seis ações diretas; retirada de textos e cartões duplicados |
| Alta | Comparador afirmava alinhamento temporal, mas cartões diziam referência não informada | Função única de referência para cartões e comparação; ano-base mostrado como período |
| Alta | Resultados exibiam somente cinco nomes sem acesso aos demais | Busca por nome ou partido, filtro por cargo e expansão da lista do arquivo |
| Alta | Declaração atribuía a conferência ao TSE | Texto identifica o Observatório como responsável pela verificação com a chave pública do TSE |
| Alta | Auditoria de proveniência contava zero registros em CRLF; teste eleitoral filtrava a mensagem, não o resultado; regex de versão não interpretava semver | Correções e testes que inserem regressões simuladas e exigem falha |
| Alta | Teste de sincronização dependia de ambiente Unix; caminho do sincronizador não era portátil | Caminho por `fileURLToPath` e simulação isolada de indisponibilidade, preservando o snapshot |
| Média | Marca comprimida e palavra “Mais” quebrada no cabeçalho intermediário | Cabeçalho reorganizado e modos de leitura em linha própria |
| Média | Indicadores espalhados em seções dificultavam pesquisa e reaproveitamento | Catálogo dos 69 indicadores, busca sem acentos, filtros, contexto e CSV da seleção |
| Média | Observadores de desempenho eram instalados antes da navegação e perdidos | Instalação por `addInitScript`; exigência de medidas de pintura reais e limite de CLS |
| Média | Estilos acumulados aumentam custo de manutenção | Correções focadas nas novas interfaces; consolidar os estilos antigos em etapa própria |

## O que foi removido

Foram removidas as explicações e ações repetidas do antigo hub inicial e os três cartões introdutórios redundantes do guia de utilidade pública. Os atalhos funcionais, fontes, métodos, dados, simulador, gráficos e recursos de acessibilidade foram preservados. Não foi feita limpeza indiscriminada de arquivos: ausência de uso deve ser comprovada antes de excluir uma fonte, histórico ou mecanismo de recuperação.

## Dados e confiabilidade

- O cadastro contém 67 fontes e 69 indicadores. A verificação de disponibilidade encontrou 64 URLs únicas: 57 acessíveis, cinco respostas HTTP 403 e dois tempos limite; nenhum 404/410 nesta rodada. Bloqueio não implica inexistência.
- Cinquenta indicadores não têm data diária própria no campo estruturado. Alguns têm ano-base nas notas: isso representa granularidade anual, não necessariamente informação ausente. O catálogo distingue essas situações sem inventar 1º de janeiro.
- Os registros de eleitorado de 125.062 e 125.501 continuam divergentes: diferença de 439. É necessário documentar universo e data de cada extração antes de decidir se são incompatíveis.
- A série populacional de 2010 remete a uma fonte identificada como Censo 2022; a estimativa de 2025 remete a um identificador de estimativas 2026. Falta vincular documentos específicos do período. Não alterei valores sem comprovação.
- O recorte de sete candidaturas é uma seleção de acompanhamento, não o universo completo. A consulta de resultados usa os registros do arquivo recebido e mantém a advertência sobre totais nominais e agregados oficiais.
- O snapshot eleitoral é mais recente que a data geral do conjunto. “Conjunto publicado em” não deve ser interpretado como atualização de todas as fontes.
- Orçamento previsto, receita realizada e despesa empenhada têm naturezas distintas. A comparação não deve sugerir equivalência apenas por unidade, data e fonte coincidirem.

Consultas oficiais adicionais confirmaram a existência do [registro do TSE sobre o resultado de Goiás no primeiro turno](https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/daniel-vilela-mdb-e-eleito-governador-de-goias-no-1o-turno) e da [Lei municipal 1.847/2026](https://legislacao.aguaslindasdegoias.go.gov.br/leis/1654). Isso não constitui conferência individual de todos os números do repositório.

## Visual, acessibilidade e manutenção

A proposta mantém a identidade existente, mas reduz a disputa entre navegação, contraste e modos de leitura. Os cartões de entrada oferecem ações concretas. Catálogo e resultados têm rótulos de formulário, contagem de registros, estados vazios e controles de expansão.

A análise de estilos encontrou 47 arquivos CSS e 288 seletores repetidos entre arquivos. Não recomendo acrescentar outra camada visual a cada alteração: a próxima consolidação deve organizar tokens, componentes e variantes com testes de contraste, foco e larguras críticas. A estrutura atual ainda é uma página extensa; páginas próprias por tema devem preservar links antigos e contexto de leitura.

## Segurança, privacidade e operação

A instalação exata do `package-lock.json` foi auditada sem vulnerabilidades conhecidas reportadas pelo npm nesta rodada. Isso não substitui revisão de segurança completa. Os workflows usam permissões explícitas e ações fixadas por hash; a publicação exige artefato validado do mesmo commit. Não foram alterados segredos ou permissões.

Preferências, leituras salvas, áreas recentes e pontuações do quiz são persistidas no dispositivo. Sentry é opcional, depende de DSN e tem coleta restritiva configurada. Convém documentar o que se guarda, como limpar preferências e o comportamento da telemetria na implantação efetiva. O funcionamento offline e o cache de resultados não devem ocultar a data do último registro.

## Melhorias seguintes, por ordem

1. **Proveniência por indicador:** registrar período estruturado, universo, tabela/página, data de extração e cópia ou hash do documento; resolver eleitorado e séries populacionais com evidência.
2. **Serviços testados com moradores:** observar tarefas de saúde, documentação, transporte e ouvidoria; medir conclusão, tempo e compreensão. Confirmar telefones, horários e canais antes de publicar novos contatos.
3. **Orçamento compreensível:** histórico por função e comparação planejado/executado somente com séries oficiais compatíveis; explicação dos estágios da despesa.
4. **Páginas temáticas e estilos consolidados:** reduzir a página inicial sem perder busca, navegação por teclado e links compartilhados.
5. **Operação:** responsáveis por revisão, prazos por fonte, changelog público de dados e distinção entre indisponibilidade de fonte e divergência de conteúdo.
6. **Governança GitHub:** concluir a proteção de `main` registrada na issue #205; revisar PRs de dependências separadamente. A proposta não altera permissões nem mescla atualizações alheias.

## Validação e limites

Build de produção e TypeScript aprovados; PWA gerada e seu contrato validado. As 25 auditorias e regressões do conjunto executado passaram, assim como o novo teste de robustez das auditorias e os limites estáticos de bundle e desempenho.

A primeira rodada de Chrome teve 159 aprovações, duas exclusões condicionais e sete falhas. Após corrigir expectativas antigas e um teste novo que ignorava a busca nas notas, as sete falhas foram repetidas junto a outros casos relevantes: **14 testes passaram**. As falhas restantes da primeira rodada eram gravação de trace, tempo limite e navegação durante a reconstrução local. Não foram ignoradas: passaram na repetição com a build pronta. Os oito testes da nova interface foram cobertos entre a rodada inicial e a repetição, incluindo CSV, referências, expansão eleitoral, acessibilidade e larguras de 390 e 1.366 px.

Na execução local corrigida: LCP 540 ms, FCP 140 ms, CLS 0,038 e resposta da busca em 71 ms. São medidas de laboratório em uma máquina, sem simulação de conexão móvel. JS inicial comprimido: 117,9 KiB; CSS inicial comprimido: 52,5 KiB. Os limites atuais passam, mas o JavaScript já supera 80% do orçamento definido no projeto.

As verificações estáticas não substituem testes no navegador. Firefox e Safari precisam de validação própria antes de afirmar compatibilidade integral. As imagens `observatorio-1366.png` e `observatorio-390.png` registram a proposta local.

A proposta deve ser revisada antes da publicação. O relatório registra tanto o que foi implementado quanto as pendências que dependem de evidência externa ou pesquisa com usuários.
