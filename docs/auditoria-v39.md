# Auditoria V39 — Observatório Eleitoral Águas Lindas de Goiás 2026

Data da auditoria: 23/09/2026

## Escopo

Auditoria do código publicado no branch `main`, com foco em arquitetura, experiência de uso, acessibilidade, proveniência, dados abertos, contexto comparativo, acionabilidade cívica, SEO/social e consistência editorial.

A validação visual da página pública não foi concluída nesta sessão porque a URL do GitHub Pages não pôde ser carregada de forma confiável pelo ambiente de análise. Portanto, esta auditoria não declara verificação pixel a pixel nem confirmação do estado visual final do deploy.

## Mudanças V39

- Modo de linguagem simples/técnica com preferência persistida.
- Explicações diretas para indicadores centrais.
- Comparação descritiva com municípios do Entorno do DF, sem ranking, preservando anos-base e definições.
- Hub de ação cívica com links para SIC, Câmara, Transparência, TCMGO e MPGO.
- Compartilhamento direto no WhatsApp.
- Open Graph e Twitter Card com imagem de compartilhamento.
- Exportação do dataset normalizado em JSON, além do CSV existente.
- Rótulos de saneamento explicitando acesso ao serviço, coleta, tratamento e denominadores diferentes.
- Auditoria estática ampliada para as novas camadas.
- Versão de aplicação atualizada para V39.

## Achados técnicos

### Pontos consolidados

- React + TypeScript + Vite com componentes modulares.
- PWA com base, escopo e start URL compatíveis com GitHub Pages.
- Separação entre dados, fonte, cálculo derivado e interface.
- Gráficos SVG com suporte textual e pontos navegáveis.
- Estados explícitos para snapshots TSE.
- Cadeia de evidências e exportação de dados.
- Navegação por atalhos, redução de movimento e foco visível.
- Verificações estáticas executadas no CI.

### Pontos que permanecem para próxima rodada

- Confirmar build/typecheck e deploy por execução efetiva do GitHub Actions após a sequência V39.
- Validar a renderização publicada em dispositivos móveis reais.
- Preferir imagem raster (PNG/WebP) adicional para previews sociais caso algum mensageiro não renderize SVG como imagem Open Graph.
- Avaliar pré-renderização/SSR/SSG do conteúdo estrutural se indexação sem JavaScript se tornar prioridade.
- Evoluir a captura automática de fontes para que a atualização deixe de depender de alterações manuais no dataset editorial.

## Achados de UX

O maior risco não é ausência de visualizações. O projeto já possui gráficos, calculadoras, timeline, camadas de evidência e navegação contextual. O risco é densidade e ordem de leitura.

A V39 reduz esse problema com:
1. explicação simples por padrão;
2. alternância para detalhes técnicos;
3. comparação contextual sem ranking;
4. ação cívica após a leitura;
5. exportação direta para uso externo.

Ainda é recomendável manter indicadores estáveis e metodologia antes de conteúdos eleitorais de alta saliência.

## Achados metodológicos

- O eleitorado local de 125.062 e o consolidado de 125.501 permanecem como universos/documentações distintas; a diferença de 439 deve continuar visível junto ao indicador, não apenas na camada de evidências.
- Saneamento usa indicadores com denominadores diferentes. A interface V39 passou a explicitar acesso ao serviço, coleta, tratamento do gerado e tratamento do coletado.
- O indicador de “esgotamento sanitário adequado” do IBGE é uma definição e ano-base diferentes dos indicadores SINISA exibidos no painel.
- A pesquisa registrada deve continuar com data, registro, amostra, natureza espontânea/estimulada e contexto judicial separados da interpretação editorial.

## Achados de legalidade e neutralidade

O observatório adota uma política de não ranking e de separação entre fonte oficial e recorte editorial. Isso melhora a transparência, mas não cria imunidade jurídica automática.

A comunicação deve continuar descritiva, evitar recomendação ou previsão eleitoral e distinguir fato documentado, cálculo derivado, contexto judicial e opinião de terceiros.

## Correção editorial importante

As Eleições 2026 são Eleições Gerais. O TSE define primeiro turno em 4 de outubro de 2026 e eventual segundo turno em 25 de outubro de 2026 para Presidente/Governador. O observatório usa o município de Águas Lindas como recorte territorial e cidadão, mas o pleito não é uma eleição municipal.

## Acessibilidade e teste visual

A V39 agora possui uma auditoria automática dedicada no CI para verificar:
- idioma `pt-BR`;
- preview social;
- foco visível;
- redução de movimento;
- alvos de toque confortáveis no mobile;
- ajuste para telas de até 380 px;
- semântica de abas e alternativas textuais dos gráficos;
- persistência segura da preferência de linguagem;
- contraste dos principais tokens da interface em tema escuro.

A auditoria usa cálculo de luminância/contraste para os tokens críticos. O projeto foi ajustado para elevar os tons de texto secundário do tema escuro que anteriormente ficavam abaixo do limiar de 4,5:1 para texto normal. As regras relevantes da WCAG tratam 4,5:1 como mínimo para texto normal e 3:1 para texto grande; a WCAG 2.2 também traz requisito de tamanho mínimo de alvo de ponteiro de 24×24 CSS px, além de requisitos de foco visível. citeturn822941search4turn822941search2

O código já possui `:focus-visible`, redução de movimento e controles móveis de 44 px em vários pontos. A auditoria automática reduz o risco de regressão, mas não substitui teste manual com Lighthouse, leitor de tela, teclado, zoom e dispositivos reais.


Código e estrutura: revisados no branch `main`.

CI/deploy: a configuração de CI está presente, mas a execução efetiva posterior às mudanças V39 não foi confirmada pelo conector nesta sessão.

Página pública: não validada visualmente nesta sessão.

Classificação geral: V39 representa uma evolução funcional e editorial, com melhora principalmente em compreensão, contextualização, acionabilidade e exportação. Os próximos ganhos dependem mais de atualização/reprodutibilidade dos dados e validação de produção do que de adicionar mais componentes visuais.
