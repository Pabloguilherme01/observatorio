# Arquitetura de confiabilidade do Observatório

## Objetivo

O observatório é publicado como uma SPA React/Vite em GitHub Pages. A confiabilidade depende de três camadas que devem ser verificadas separadamente:

1. o código e os testes de pré-publicação;
2. o artefato efetivamente publicado;
3. a resposta pública observável pelo utilizador.

Uma execução bem-sucedida de CI/CD não é tratada como prova suficiente de disponibilidade pública.

## Fallback SPA no GitHub Pages

O GitHub Pages não funciona como servidor de aplicação com roteamento configurável. Quando uma URL virtual da SPA é acessada diretamente, o servidor pode procurar um arquivo físico inexistente e responder 404.

O projeto usa um fallback de página única em duas etapas:

- `public/404.html` captura a rota desconhecida;
- a rota é preservada dentro de uma query string marcada por `?/`;
- `index.html` reconhece essa assinatura antes da inicialização do React;
- o caminho original é decodificado e restaurado com `history.replaceState`;
- a aplicação pode então inicializar normalmente, sem depender de uma página HTML física para cada rota.

Esse mecanismo é especialmente útil para links profundos, favoritos, compartilhamentos e futuras evoluções do roteamento. Nesta implementação, o fallback é deliberadamente isolado do sistema de navegação por hash já usado pela interface.

## Paridade da publicação

O endpoint público `/api/v1/health.json` agora expõe:

- versão da aplicação;
- timestamp do build;
- estado de frescor do snapshot;
- SHA do commit publicado;
- SHA curto para leitura humana;
- ambiente de build;
- contrato `publication-parity-v1`.

O workflow de deploy compara o SHA retornado publicamente com `GITHUB_SHA`. Assim, um build autenticado como concluído não é considerado suficiente: a publicação precisa declarar o mesmo commit e responder pela rede pública.

Isso reduz o risco de confundir estado interno de CI/CD com disponibilidade real e cria uma evidência independente para incidentes de publicação ou dessincronização de conta.

## Garantia de qualidade

As métricas de confiabilidade devem ser interpretadas como uma cadeia, e não como números isolados:

- **EDD**: quanto dos defeitos conhecidos foi detectado antes da publicação;
- **MTTD**: quanto tempo a equipe leva para perceber uma falha;
- **MTTR**: quanto tempo é necessário para recuperar o serviço;
- **MTBF**: quanto tempo o sistema permanece estável entre falhas.

O projeto não fabrica valores de EDD, MTTD, MTTR ou MTBF quando não existe um histórico de incidentes suficiente para calculá-los. Em vez disso, os testes automatizados e a verificação pública são usados como controles que reduzem a probabilidade e a duração de falhas.

Na prática:

**testes de regressão → maior EDD → menos defeitos em produção → menor pressão sobre MTTR → menor indisponibilidade pública.**

O healthcheck público complementa essa cadeia porque permite detectar divergência entre o artefato aprovado e o artefato realmente servido.

## Dados públicos e contexto institucional

A disponibilidade do observatório é tratada como parte da qualidade da informação, e não apenas como uma preocupação estética.

Uma interrupção pode retirar temporariamente a camada que organiza descoberta, contexto, comparação, séries históricas, fontes e documentação, mesmo quando a fonte original continua online. Em áreas como saúde ocupacional e transparência fiscal, essa camada de contextualização pode ser relevante para acompanhamento contínuo, auditoria e controle social.

O projeto mantém a distinção entre:

- dado original;
- interpretação editorial;
- cálculo derivado;
- estado da infraestrutura.

Essa separação impede que uma falha técnica seja confundida com ausência do dado de origem e, inversamente, que a disponibilidade do dado de origem seja usada como justificativa para ignorar uma falha do observatório.

## Operação

Em incidentes reais, a investigação deve comparar, no mínimo:

- resposta HTTP pública;
- healthcheck público;
- commit esperado;
- commit declarado pelo artefato publicado;
- resultado do CI/CD;
- assets efetivamente servidos;
- comportamento do fallback de SPA.

Essa cadeia torna o diagnóstico reproduzível e reduz dependência de sinais internos que podem estar desatualizados ou dessincronizados.
