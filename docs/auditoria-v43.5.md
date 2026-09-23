# Auditoria V43.5 — mobile, linguagem e distribuição

Data: 23/09/2026

## Alterações

A interface passou a ter dois modos explícitos.

**Simples**
- textos curtos;
- menos contexto repetido;
- foco no número, significado e ação;
- menos detalhes técnicos na primeira leitura.

**Técnico**
- mantém fonte, data, metodologia e contexto;
- preserva a camada documental para auditoria;
- não altera o valor apresentado, apenas a profundidade da explicação.

O seletor fica no cabeçalho e no menu mobile.

## Compartilhamento

O fluxo social permite escolher o dado, escolher Story/Post, gerar o material, usar o compartilhamento nativo, enviar a mesma informação diretamente ao WhatsApp ou copiar a legenda.

Os links gerados pelo módulo de Instagram carregam a âncora da informação e parâmetros de campanha.

Não foi criada publicação automática no Instagram. Isso exigiria autenticação da Meta. O projeto não simula uma integração que não existe.

## Auditoria crítica

A V43.5 reduz a densidade da camada simples, mas ainda existem componentes antigos com textos longos independentemente do modo. Portanto, a separação simples/técnico está implementada na arquitetura e nos principais fluxos, mas não cobre 100% das frases do projeto.

Essa é a principal dívida de UX restante.

## Mobile

Foram revisados alvos de toque, seletor de linguagem, cartões horizontais, compartilhamento e integração com o WhatsApp.

## Limitações

Não foram inventados links para uma conta específica do Instagram, pois nenhuma conta oficial do Observatório foi identificada no código.

Não são declarados números de Lighthouse ou Core Web Vitals sem execução real do navegador.

## Próxima rodada

Revisar cada seção e criar, quando necessário, um par explícito de resumo simples + detalhes técnicos, começando por eleições, orçamento, saneamento e evidências.
