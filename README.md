# Observatório Eleitoral — Águas Lindas de Goiás 2026

Aplicação web de dados públicos e contexto municipal, construída com Vite + React + TypeScript + Tailwind CSS + Lucide React.

## Stack

- Vite
- React 19
- TypeScript strict
- Tailwind CSS v4
- Lucide React
- vite-plugin-pwa + Workbox
- GitHub Pages via GitHub Actions

## Estrutura

- `src/components`: UI modular
- `src/data`: dados e proveniência
- `src/lib`: cálculos puros
- `src/services`: fronteira para integrações futuras
- `src/components/system`: recuperação de erros de runtime

## Desenvolvimento

```bash
npm install
npm run dev
```

## Verificação

```bash
npm run audit:static
npm run audit:a11y
npm run audit:mobile
npm run typecheck
npm run validate:observatorio
npm run validate:tse
npm run validate:results
npm run test:jws
npm run sync:results
npm run build
```

O CI executa auditoria estática, contratos de dados, typecheck e build a cada push/PR. O deploy do GitHub Pages publica o diretório `dist`.

## Princípios de dados

- Diferenciar fonte oficial, secundária, derivada e legado.
- Preservar ano-base e data de atualização.
- Não transformar cálculos derivados em dados observados.
- Manter links para as fontes originais.
- Separar snapshots eleitorais de consolidações de universos diferentes.
- Não produzir ranking ou recomendação eleitoral.

## Deploy

URL pública esperada:

https://pabloguilherme01.github.io/observatorio/

O build usa assets relativos para permanecer compatível com o caminho de projeto do GitHub Pages.

## Status

V41.0 — Observatório de Dados Cívicos e Eleitorais.

### Foco V41
- Camada pública de confiança com método, atualização e canal de correção por evidência.
- CTAs para serviços eleitorais oficiais: e-Título, Pardal e página de Eleições 2026/DivulgaCandContas.
- Hierarquia mobile mais enxuta no hero, preservando os três indicadores centrais e reduzindo ruído secundário.
- Quiz ampliado para cinco perguntas usando dados já presentes no dataset.
- Auditorias estática e mobile reforçadas para as novas camadas.

### Foco V40
- Hub de descoberta no primeiro terço da página, com trilhas por assunto, leitura de 5 minutos e radar de atualização.
- Compartilhamento individual por dado via Web Share API, fallback de cópia e WhatsApp.
- Trilhos horizontais mobile-first com scroll-snap para navegação por toque.
- Auditoria estática específica para mobile e integração dessa checagem ao CI.
- Kit de distribuição para Instagram com Story 1080×1920, Post 1080×1350, legenda, UTM e Web Share com arquivo.

### Foco V39
- Camada de linguagem simples/técnica com preferência persistida no navegador.
- Contexto comparativo descritivo com municípios do Entorno do DF e anos-base preservados.
- Hub “Como usar” com SIC, Câmara, Transparência municipal, TCMGO e MPGO.
- Compartilhamento direto no WhatsApp e preview social com imagem Open Graph.
- Exportação do dataset normalizado em JSON além do CSV.
- Auditoria estática ampliada para validar as novas camadas e o cartão social.

### Foco V38
- Hierarquia inicial reforçada no hero com indicadores de referência, acesso direto às evidências e identificação explícita da última atualização local.
- Atalhos de descoberta mantidos navegáveis na Visão geral, sem apontar para seções ocultas.
- Auditoria estática versionada no CI para detectar regressões de edição, URL base, PWA, navegação, proveniência e estados de snapshot.

### Foco V37
- Mobile-first com navegação rápida, áreas de toque >=44px e safe-area para barras fixas.
- Compartilhamento nativo de resumo e cenários de mobilidade.
- Estados TSE explicitamente diferenciados entre capturado, desatualizado, falha e aguardando captura.
- Visualização histórica de saneamento com escala 0–100% e tabela compacta no celular.
- Feed de resultados com contrato contextualizado: eleição, turno, UF, município, cargo, arquivo-fonte e estado de captura.
- Validação dedicada do feed de resultados antes de CI e publicação.
- Contrato de produção com pleito, ambiente, escopo municipal e compatibilidade entre código de eleição, UF e cargo.
- Estado de frescor do feed para impedir que um arquivo antigo permaneça rotulado como ao vivo.
- Verificador isolado do simulado oficial do TSE para 22–24/09/2026, sem misturar dados simulados à produção.
- Visão geral como modo padrão para não esconder fontes e camadas documentais do primeiro acesso.
- Histórico de eleitorado com fonte individual por ano e reconciliação editorial separada do consolidado.
- Eleitoral 360° sem mistura de campos de snapshots diferentes.
- Compartilhamento do inspetor sem âncoras falsas.
- Verificador JWS EdDSA/Ed25519 alinhado ao manual oficial do TSE 2026, com `kid` e chave pública oficial fixados.
- Feed de resultados V3 agregado por cargo, com uma prova JWS por arquivo e validação exata do host, município e cargo.
- Pipeline automático de resultados preparado para JSON + JWS, comparação dos payloads e snapshot em `public/data/tse-results.json`.
- Scheduler do primeiro e eventual segundo turno respeitando a janela local de Brasília e sem publicar dados antes dos arquivos oficiais existirem.
- Código municipal de Águas Lindas validado pela configuração TSE como `93343`.
- Estados de captura e cobertura reforçados na camada de pesquisa documental.
- Registros políticos estáticos separados da proveniência oficial do TSE enquanto a sincronização local permanece `not_synced`.
- Camada Evidências com cadeia explícita de fonte, captura local, hash, workflow e limitações.
- Três modos de leitura: Visão geral, Investigação e Evidências; Visão geral é o modo padrão.

### Camadas atuais
- Cadeia de evidências com distinção explícita entre fonte oficial e captura local
- Dashboard municipal e eleitoral
- Eleitorado e perfil demográfico
- Calculadora de mobilidade e custo relativo à renda
- Saneamento e saúde com cálculos derivados explicitados
- Candidaturas e Eleitoral 360° com proveniência de snapshots
- Linha do tempo eleitoral baseada em fontes oficiais
- Orçamento, exportação e mapa de evidências
- Central de qualidade, fontes e inspeção de dados
- Demografia dinâmica com série temporal e metodologia reutilizável
- Leitura orçamentária per capita com denominadores preservados
- Cenários hipotéticos de tarifa sem confundir hipótese com dado oficial
- PWA com cache local para recursos da aplicação

### Estado da sincronização eleitoral
A automação de candidatos do TSE está preparada para ler o arquivo de Goiás e produzir um snapshot de watchlist com SHA-256, diff e histórico. Enquanto a primeira captura validada não existir, a interface mantém o estado `not_synced` e não interpreta isso como ausência de candidaturas. O workflow `.github/workflows/sync-tse-candidates.yml` pode ser acionado manualmente e roda diariamente para baixar o pacote oficial, validar o contrato e publicar somente mudanças verificadas.

A divulgação de resultados usa os arquivos oficiais JSON/JWS do TSE. O pipeline consulta a configuração `ele-c.json`, resolve o município `93343`, baixa os pares JSON/JWS por cargo, verifica a assinatura Ed25519 com a chave pública oficial fixada pelo TSE e só então publica o snapshot local.

### Limitações editoriais
- Dados de anos-base diferentes não são tratados como uma série homogênea sem indicação explícita.
- Cálculos derivados são identificados como derivados.
- Denúncias, processos e situações cadastrais são apresentados de forma descritiva, sem inferência de culpa ou mérito.
- O observatório não produz ranking, recomendação eleitoral ou previsão de resultado.
