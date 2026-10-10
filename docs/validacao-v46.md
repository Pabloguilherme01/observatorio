# Validação — Observatório municipal 46.0.0

Implementação na PR [#356](https://github.com/Pabloguilherme01/observatorio/pull/356), em 10/10/2026. Esta etapa não inclui merge ou publicação em produção.

## Escopo verificado

- 67 indicadores e 24 fontes municipais, com vínculos resolvidos. Valores existentes preservados; a LOA foi classificada como planejamento, sem atribuir pagamento.
- Retirada de módulos, tipos, fontes, arquivos gerados, dados públicos, sincronizadores, fixtures e workflows do domínio removido.
- API v2 com dataset, fontes, saúde e OpenAPI; campos retirados ausentes e v1 responde 404 no preview, sem arquivos no build.
- Busca, comparação e CSV municipais. A exportação conserva datas exatas conhecidas e acrescenta período e precisão, incluindo anos-base e referência desconhecida.
- Quiz com 200 IDs e enunciados únicos, 40 por fase, quatro alternativas distintas, resposta válida, explicação e fonte registrada.
- Trilha de sete passos. Preferências de tema, contraste e leitura preservadas; progresso antigo de aprendizado reiniciado e novo progresso persistido.
- Âncoras antigas redirecionadas ao início com aviso acessível. Parâmetros exclusivos limpos e favoritos retirados filtrados.
- SW limpa caches antigos e URLs obsoletas do precache. Dataset v2 funciona offline; v1 não reaparece no cache. Health fora do precache.

## Evidência local

Build e TypeScript passaram em Node 24. As 17 auditorias e contratos ativos passaram, além de PWA, limites de bundle/performance e auditoria de dependências com zero vulnerabilidades. Os guards foram testados com IDs duplicados, respostas inválidas, fontes inexistentes e reintrodução de campo retirado.

A suíte desktop executou 171 casos. As expectativas antigas foram atualizadas e as falhas reexecutadas; problemas de contraste no modo Guiado foram corrigidos. As verificações finais passaram: 26 casos de metadados, API, aprendizado e acessibilidade; 15 de exportação, CSV, API, compartilhamento e trilha; teste adicional de migração real do precache. Duas exclusões condicionais da suíte desktop foram preservadas.

Chrome com emulação Android: 27 casos aprovados e duas exclusões condicionais. Foram testados serviços, busca, simulador, orçamento, comparação, exportação e compartilhamento; teclado, foco e layouts entre 320 e 1920 px. Axe no modo Guiado passou nos temas claro e escuro, sem violações graves. A consulta HTTP das 24 fontes encontrou 20 respostas disponíveis e quatro 403; nenhum 404/410. Resposta HTTP não certifica o conteúdo numérico de uma fonte.

## Capturas e limites

Capturas registradas nos arquivos observatorio-v46-entrada-desktop.png (1366 px), entrada-mobile.png (390 px), trilha-mobile.png (390 px), dados-desktop.png (1920 px) e orcamento-mobile.png (320 px), disponíveis nos entregáveis da tarefa.

O registro de publicação e o período de cada indicador são separados. Referência ausente continua explícita; published não certifica atualidade. Quatro fontes recusaram a consulta automatizada com 403. A API v1 é uma remoção incompatível, documentada em [migração](api-v2-migracao.md). Um dispositivo offline só recebe a limpeza da nova versão após carregar conectado.

CI, Browser compatibility e CodeQL validam o commit da PR no GitHub. A evidência remota e seus links estão na aba [Checks da PR](https://github.com/Pabloguilherme01/observatorio/pull/356/checks); aprovação desses gates não implica publicação em produção.
