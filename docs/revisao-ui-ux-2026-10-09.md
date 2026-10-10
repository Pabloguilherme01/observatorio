# Revisão das recomendações de UI e UX

O texto fornecido é uma avaliação por inferência. Foi confrontado com o código e com as verificações já feitas do Observatório; hipóteses não foram tratadas como defeitos comprovados.

| Recomendação | Situação e aplicação |
|---|---|
| Gráfico reativo no comparador | Implementada escala de 0 a 100% para pares de percentuais nesse intervalo. Trocar seletores atualiza imediatamente barras, valores e períodos. Unidades distintas e valores fora desse intervalo mantêm a leitura numérica, com explicação. Não se calcula diferença ou ranking entre universos incompatíveis. |
| Revelar detalhes progressivamente | O catálogo já usa detalhes expansíveis e paginação; os resultados eleitorais já expandem por cargo. A descrição de correções passa a abrir sob demanda dentro do inspetor existente. |
| Carregamento de dados | Já há skeleton no `Suspense` das seções e estados de espera/indisponibilidade dos resultados. A presença desses estados foi verificada no código; não é necessário recriar o mecanismo. |
| Contexto de fonte sem abandonar o site | O inspetor já mostra instituição, referência, método e contexto e mantém ligação com a fonte. Preview de documentos externos depende de documento específico, disponibilidade e compatibilidade; não será substituído por uma prévia inventada. |
| Acessibilidade | Novos controles têm rótulos, valores textuais e navegação por teclado. As barras não dependem de cores para identificar A e B. O foco do inspetor passa a incluir textarea, select e summary e a excluir controles ocultos. Axe e testes funcionais são usados; não se declara certificação WCAG nem execução de Lighthouse/WAVE. |
| Série temporal | O projeto já tem gráficos históricos. Novas séries de saúde/orçamento exigem dados oficiais comparáveis; não foram gerados pontos ou tendências ausentes. |
| Microcópia e relato de erro | “Encontrou um erro?” abre descrição e evidência opcionais no inspetor. Indicador, valor, fonte, referência e link de contexto são pré-preenchidos. “Revisar sugestão no GitHub” prepara a issue, sem publicá-la automaticamente. |

A hospedagem em GitHub Pages não garante leveza: a aplicação usa React e bibliotecas de gráficos, e o orçamento atual de JavaScript continua relevante. As métricas anteriores são de laboratório e não comprovam desempenho em redes móveis reais.

A versão anterior do PR #356 passou em CI, CodeQL e compatibilidade de navegadores no GitHub.

A complementação também corrigiu um defeito comprovado no inspetor: faltava posicionamento do diálogo sobre a página. Ele agora tem fundo, rolagem própria, foco retido e restauração do foco e da rolagem ao fechar. Foram corrigidas cores de título, valor e metadados no tema claro.

Validação desta complementação: build TypeScript/Vite/PWA, contratos estático, acessibilidade e mobile, orçamento de estilos e bundle e teste do service worker aprovados. Sete regressões existentes do comparador, inspetor e novos fluxos passaram; os cinco novos testes passaram após as correções, incluindo teclado, 390/1.366 px, temas claro/escuro e Axe sem violações graves nas áreas testadas. Isso não substitui auditoria manual completa WCAG.

Alterações incorporadas ao [PR #356](https://github.com/Pabloguilherme01/observatorio/pull/356), em rascunho. Não houve publicação do site nem envio de uma issue de correção. As imagens `comparador-visual.png` e `correcao-mobile.png` registram a versão local.
