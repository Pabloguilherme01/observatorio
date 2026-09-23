# Auditoria de acessibilidade

## Controles implementados
- Skip link para `#main-content`.
- Foco visível com `:focus-visible`.
- Navegação por teclado nos controles principais.
- Dialogs do shell com gerenciamento de foco.
- Preferência `prefers-reduced-motion` e modo reduzido persistido.
- Gráficos SVG com `role="img"`, `title` e `desc` onde aplicável.
- Tema claro/escuro com contraste ajustado.

## Próxima validação manual
Executar NVDA/VoiceOver em produção para validar ordem de foco, leitura de rótulos, anúncios dinâmicos e interação em mobile. Esta documentação não substitui teste assistivo real.
