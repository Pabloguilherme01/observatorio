# API municipal v2 — migração incompatível

Base: /observatorio/api/v2/. Quatro documentos JSON estáticos, regenerados no build:

- observatorio.json: schemaVersion 2, apiVersion 2.0, datasetUpdatedAt, buildGeneratedAt e data.
- sources.json: origem, instituição, URL, natureza, datas conhecidas e notas; campos ausentes são null.
- health.json: integridade municipal, versão, metadados de publicação e referência individual de cada indicador.
- openapi.json: descrição das rotas públicas.

A v1 foi removida: não há redirecionamento nem arquivos em api/v1. Clientes devem trocar o endereço e validar o contrato 2. O dataset não contém electoral, polls ou candidates. Consumidores que dependiam desses campos precisam remover essa dependência. Dados retirados permanecem apenas no histórico do Git.

O health retorna ok somente com estrutura municipal válida, IDs únicos, valores finitos, referências de fontes resolvidas e metadados de publicação válidos. Isso não certifica disponibilidade dos órgãos externos nem atualização diária. Cada referência tem precision date, year ou unknown; freshness é not-assessed. Referência desconhecida nunca significa informação atual.

datasetUpdatedAt é o corte editorial; buildGeneratedAt é o instante de geração do arquivo; publication.commitSha identifica o código publicado. Essas datas não substituem a referência estatística de cada indicador.

O health usa rede e não é precacheado. Dataset e fontes podem funcionar offline; um arquivo em cache mantém o período declarado. O Service Worker da versão 46 elimina caches de versões anteriores na próxima ativação conectada e o Workbox retira URLs antigas do precache. A retirada não pode atualizar um dispositivo que continua sem conexão.

Natureza dos indicadores: published identifica um valor publicado no conjunto, sem certificar atualidade; historical, snapshot, planned e derived mantêm suas definições. A LOA é planned. Clientes da v1 que interpretavam current precisam migrar para published e conferir a referência individual.
