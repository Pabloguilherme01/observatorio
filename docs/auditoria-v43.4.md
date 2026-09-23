# Auditoria V43.4 — UX mobile, jornalismo de dados e compliance eleitoral

Data: 2026-09-23

## Alterações aplicadas

- Removida a margem de erro teórica de 4,9 pp da interface e do dataset.
- O observatório não calcula margem de erro própria. O campo só deve aparecer quando a margem oficial estiver materializada no snapshot da fonte registrada.
- Reescrita a leitura da série de saneamento para identificar explicitamente o indicador como atendimento por rede pública.
- Separados visualmente e semanticamente atendimento, coleta, tratamento e esgotamento adequado.
- Adicionada nota metodológica curta no bloco HEAL explicando que 164, 85 e 298 são referências de naturezas diferentes e que a causa da diferença não é inferida sem fonte específica.
- Contextualizada a diferença de 439 eleitores como reconciliação entre recortes, sem sugerir irregularidade.
- Aumentados alvos de toque dos controles do simulador HEAL e reorganizado o resultado para uma coluna no mobile.
- Preservados deep links para saúde e simuladores após o code splitting V43.3.

## Auditoria estrutural

- Versão V43.4 alinhada entre código e package.
- Code splitting com IntersectionObserver preservado.
- Navegação por hash e evento `observatorio:navigate` preservados.
- Deep links `#saude`, `#healgo`, `#heal-beds`, `#insights`, `#rotas`, `#perfil-etario` e `#quiz` incluídos no grupo diferido.
- Alvos mobile permanecem com pelo menos 44–48 px nas áreas auditadas.
- Zoom e safe-area preservados.
- Countdown continua calculado em runtime pelo hook `useCountdown`, não por número fixo de dias.
- A interface de pesquisa não exibe mais a margem teórica.

## Limitações dos testes

Esta rodada não executa um navegador Android físico nem mede Lighthouse/Core Web Vitals no GitHub Pages. Portanto, não são declarados números de LCP, INP, CLS ou tamanho real de bundle como se fossem medições de campo.

## Testes finais esperados no CI

1. typecheck/build
2. auditoria estática
3. auditoria de acessibilidade
4. auditoria mobile
5. validações TSE existentes
6. deploy Pages e verificação de artefatos

## Próxima medição mobile

Após publicação, validar em Chrome Android em rede 4G:
- carregamento inicial e LCP;
- abertura do menu e busca;
- salto para `#saude`, `#orcamento`, `#politica`, `#eleitoral360` e `#fontes`;
- abertura do simulador HEAL e interação do slider;
- orientação retrato em 320–390 px;
- zoom de 200%;
- prefers-reduced-motion;
- instalação e atualização da PWA.
