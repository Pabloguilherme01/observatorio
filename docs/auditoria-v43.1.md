# Auditoria V43.1 — Observatório Eleitoral de Águas Lindas de Goiás 2026

Data: 23/09/2026

## Escopo

Revisão da branch `main` com foco em experiência mobile, acessibilidade, navegação, proveniência, coerência editorial, contratos de dados, CI e publicação no GitHub Pages.

A página pública foi verificada quanto à disponibilidade por tentativa direta de carregamento, mas a ferramenta web disponível nesta sessão não conseguiu abrir a URL do GitHub Pages. A automação de navegador `agent-browser` também não está instalada no ambiente. Portanto, esta auditoria não declara uma inspeção visual pixel a pixel em aparelho físico.

## Melhorias aplicadas

### Mobile
- O Modo Eleição passou a ter um controle visível no hero em telas de até 767 px.
- O controle informa o estado ativo/inativo com `aria-pressed` e permite ativar/desativar o modo.
- A mudança reaproveita o mesmo evento usado pelo shell da aplicação, mantendo a preferência persistida no navegador.
- A navegação inferior, busca, safe-area, foco visível, redução de movimento e alvos de toque existentes foram preservados.

### Auditoria automatizada
- `audit:mobile` agora impede regressão do controle mobile do Modo Eleição.
- `audit:a11y` agora verifica também estado e ação acessíveis do Modo Eleição.

### Coerência de versão e documentação
- Versão da aplicação atualizada de 43.0.0 para 43.1.0.
- README atualizado para V43.1.
- O texto sobre sincronização eleitoral foi corrigido para refletir o estado real do snapshot versionado: `first_capture`, escopo `watchlist`.
- Registrada uma auditoria V43.1 separada, sem sobrescrever o histórico V39.

## Achados relevantes

1. A `main` atual tem CI e Quality aprovados no commit `eda7cea5`. Um deploy do GitHub Pages para esse commit também terminou com sucesso. O workflow de publicação executa as auditorias estática, usabilidade, acessibilidade, mobile, arquitetura TSE, contratos, typecheck e build antes do deploy.

2. O snapshot de candidaturas versionado está em estado `first_capture`, com 594 linhas de origem e 10 correspondências locais no escopo `watchlist`. O arquivo preserva a URL do recurso do TSE e registra `captureTransport: historical_third_party_reader`. Isso deve continuar visível como informação de proveniência e não ser apresentado como consulta ao vivo.

3. Existe um PR V44 aberto com mudanças muito grandes e estado de merge sujo. Os workflows recentes de recaptura desse branch falharam na etapa de promoção dos snapshots. Por isso, esta rodada não incorpora esse branch inteiro na `main`. As melhorias consideradas seguras foram reaplicadas de forma pequena e isolada.

4. A maior lacuna de experiência encontrada no código era a disponibilidade do Modo Eleição apenas pelo quick-dock, que fica oculto no mobile. O controle agora está exposto no próprio hero mobile.

## O que ainda falta

A validação de produção ainda deve incluir inspeção visual real em larguras de 320, 360, 390 e 430 px, teste de teclado/leitor de tela, Lighthouse e verificação manual do PWA em um aparelho físico.

Também permanece recomendável transformar a imagem social SVG em uma alternativa PNG/WebP para compatibilidade com serviços que não renderizam SVG em cartões sociais.

Na camada de dados eleitorais, a próxima captura direta do TSE deve substituir ou complementar a captura histórica mantendo hash, data, recurso oficial e método de transporte no snapshot.

## Critério de saída V43.1

A versão é considerada consistente no código quando:
- package.json e `src/config/version.ts` usam 43.1.0;
- as auditorias mobile e acessibilidade verificam o novo controle;
- typecheck e build passam;
- o workflow de Quality permanece verde;
- o deploy de Pages permanece condicionado às auditorias.

## Fonte de calendário eleitoral

O TSE define 4 de outubro de 2026 para o primeiro turno e 25 de outubro de 2026 para eventual segundo turno, com votação das 8h às 17h no horário de Brasília. Essa referência oficial deve continuar sendo tratada como fonte primária no projeto.
