# Auditoria V43.2 — Observatório de Águas Lindas de Goiás 2026

Data: 23/09/2026

## Escopo

Rodada de melhoria do código da branch `audit/v43.2-mobile`, concentrada em mobile, acessibilidade, PWA, busca e desempenho de interação.

## Melhorias aplicadas

### Mobile e acessibilidade
- A barra inferior mobile passou a usar `aria-current="location"`, adequado para navegação dentro da mesma página.
- O deslocamento feito por atalhos, barra mobile e central de comandos respeita `prefers-reduced-motion` e a preferência manual de redução de animações.
- O fechamento da busca devolve o foco ao controle que abriu a janela.
- A navegação por setas na busca não ultrapassa o último resultado disponível.

### Tema e PWA
- O `theme-color` acompanha automaticamente o tema claro/escuro.
- A primeira pintura atualiza o `theme-color` junto com o tema, reduzindo discrepância entre interface e barra do navegador.
- Foram adicionados metadados de nome para instalação mobile.
- O preview social recebeu `og:image:url` e `og:image:secure_url` além do `og:image` existente.

### Descoberta e dados
- A busca por “Candidaturas” agora leva à seção de candidaturas.
- A resposta rápida para “esgoto” passa a usar a seção real `#saude`.
- A busca ganhou respostas diretas para PIB per capita 2023, referência do Ideb 2025 e leitos declarados do HEAL, usando o dataset local e sua fonte registrada.
- O bloco de candidaturas deixa de renderizar um link sem destino quando a fonte não possui URL.

### Desempenho
- O progresso de leitura passou a atualizar via `requestAnimationFrame`, reduzindo atualizações de estado disparadas diretamente por cada evento de scroll.

## Auditorias reforçadas

`audit:mobile` agora verifica a versão V43.2, metadados de instalação, semântica `aria-current="location"` e respeito à redução de movimento.

`audit:a11y` agora verifica os metadados de instalação e a sincronização do `theme-color` com o tema.

## O que ainda não foi medido nesta sessão

A auditoria de código não substitui uma medição real de navegador. Não foi possível fazer inspeção visual pixel a pixel em 320, 360, 390 e 430 px, teste físico de PWA, teste manual com leitor de tela ou Lighthouse neste ambiente.

O CI do repositório continua sendo a etapa apropriada para typecheck, build e auditorias estáticas após o merge.

## Pontos restantes

Ainda existe espaço para uma etapa futura de otimização de carregamento de componentes abaixo da dobra, teste real de Core Web Vitals, fallback PNG/WebP para a imagem social e validação visual em aparelhos reais.
