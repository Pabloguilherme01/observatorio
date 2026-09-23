# Auditoria V43.3 — Observatório de Águas Lindas de Goiás 2026

Data: 23/09/2026

## Objetivo

Reduzir o custo inicial de carregamento no celular sem remover conteúdo, navegação ou rastreabilidade.

## Melhorias aplicadas

### Carregamento inicial

O `App` foi reorganizado para manter no primeiro carregamento apenas a experiência inicial, descoberta, confiança, resumo e dashboard.

O conteúdo abaixo da dobra foi dividido em cinco grupos carregáveis sob demanda:

- contexto e indicadores;
- política e fluxo eleitoral;
- orçamento;
- dados públicos e Instagram;
- qualidade, evidências, exportação e fontes.

Cada grupo é acionado por `IntersectionObserver` com margem antecipada de 900 px. Isso permite que o próximo bloco seja preparado antes de o usuário chegar nele, sem importar todos os componentes pesados imediatamente.

### Navegação

A otimização poderia criar um problema: uma seção ainda não carregada não existiria no DOM quando o usuário tocasse em um item do menu.

Isso foi tratado explicitamente.

Cada grupo declara suas âncoras. Ao receber `observatorio:navigate`, o grupo correspondente é carregado. Depois da montagem, o código volta à âncora solicitada. Hash direto também ativa o grupo correspondente.

Assim, lazy loading não quebra:
- menu mobile;
- atalhos;
- busca;
- links com hash;
- abertura direta de uma seção por URL.

### Acessibilidade

A preferência `prefers-reduced-motion` continua sendo respeitada durante o scroll automático.

O fallback de carregamento é visualmente discreto e marcado como decorativo para tecnologias assistivas.

### Proteção contra regressões

As auditorias foram atualizadas para verificar:
- versão V43.3;
- existência dos grupos diferidos;
- IntersectionObserver;
- navegação profunda para grupos diferidos;
- preservação das camadas de dados, evidências e contexto;
- navegação mobile e reduced motion.

## Auditoria estrutural pós-alteração

Foram verificadas diretamente na árvore da `main`:
- versão V43.3;
- package.json alinhado;
- cinco grupos diferidos presentes;
- âncoras dos grupos;
- preservação de DataInspector;
- preservação do Footer;
- navegação e busca existentes;
- auditorias atualizadas.

## Limitação

A infraestrutura desta sessão não disponibiliza um navegador real nem execução do Lighthouse contra a publicação. Também não foi possível medir Core Web Vitals em aparelho físico.

Portanto, a redução de JavaScript inicial foi implementada arquiteturalmente, mas não deve ser descrita como uma porcentagem medida de redução até que o build seja executado e o bundle seja comparado.

## Próxima medição recomendada

Depois da publicação, medir no Android em 4G:
1. tempo até conteúdo principal;
2. LCP;
3. INP;
4. CLS;
5. tamanho do JavaScript inicial;
6. tempo de carregamento do primeiro grupo diferido;
7. navegação direta para `#fontes`, `#orcamento`, `#politica` e `#eleitoral360`.
