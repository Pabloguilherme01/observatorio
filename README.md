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

## Modos de leitura

O site adapta o conteúdo e o visual a três modos, persistidos no navegador:

- **Resumo** — modo inicial. Foco em beleza, números essenciais e utilidade. A maior parte das camadas técnicas fica oculta.
- **Simples** — linguagem clara e direta, com os mesmos números centrais. Mapa de evidências oculto.
- **Técnico** — detalhes, metodologia e rastreabilidade completas. O **Mapa de Evidências** aparece aqui, em mini cards de auditoria com natureza da fonte, data e link original.

O mapa de evidências é uma ferramenta de auditoria: fica oculto nos modos Resumo e Simples (que já recebem proveniência nos próprios indicadores) e aparece apenas no modo Técnico.

## Quiz do Observatório

200 perguntas distribuídas em 5 fases de dificuldade — Fácil, Médio, Difícil, Avançado e Expert — com 40 perguntas por fase. Cada fase é desbloqueada ao concluir a anterior. Cada resposta traz explicação e link para a fonte do dado.

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

O CI executa em cada pull request **e a cada push na main**: auditoria estática, contratos de dados, typecheck, build e verificação pós-publicação do site. O deploy do GitHub Pages publica o diretório `dist`.

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

**V44.9.3 — Observatório de Dados Cívicos e Eleitorais.**

- Três modos de leitura (Resumo, Simples, Técnico) com preferência persistida.
- Quiz com 200 perguntas em 5 fases de dificuldade (40 por fase), com desbloqueio progressivo, explicação e fonte por questão.
- Mapa de evidências reservado ao modo Técnico, em mini cards de auditoria.
- Navegação mobile com barra inferior, `aria-current`, áreas de toque >=44px e safe-area.
- Carregamento diferido por proximidade da viewport, reduzindo o JavaScript inicial.
- Compartilhamento por dado individual (Web Share API com fallback de cópia), kit para Instagram e exportação JSON/CSV.
- PWA com cache local e `theme-color` acompanhando o tema claro/escuro.

### Camadas atuais

- Cadeia de evidências com distinção explícita entre fonte oficial e captura local
- Dashboard municipal e eleitoral
- Eleitorado e perfil demográfico
- Calculadora de mobilidade e custo relativo à renda
- Saneamento e saúde com cálculos derivados explicitados
- Candidaturas e Eleitoral 360° com proveniência de snapshots
- Linha do tempo eleitoral baseada em fontes oficiais
- Orçamento, exportação e mapa de evidências (modo Técnico)
- Central de qualidade, fontes e inspeção de dados
- Demografia dinâmica com série temporal e metodologia reutilizável
- Leitura orçamentária per capita com denominadores preservados
- Cenários hipotéticos de tarifa sem confundir hipótese com dado oficial
- PWA com cache local para recursos da aplicação

### Estado da sincronização eleitoral

A edição atual contém uma primeira captura de candidatos em escopo `watchlist`, com 905 linhas de origem e 7 correspondências no snapshot versionado. O estado do snapshot atual é `changed`. O metadado preserva a URL de recurso oficial do TSE e também registra o método de transporte usado na captura histórica, por isso a interface não trata esse snapshot como uma consulta ao vivo. O workflow `.github/workflows/sync-tse-2026.yml` executa captura e validação automatizadas. O recorte atual é uma watchlist estadual com evidência documental de vínculo local, não uma lista municipal completa.

A divulgação de resultados usa os arquivos oficiais JSON/JWS do TSE. O pipeline consulta a configuração `ele-c.json`, resolve o município `93343`, baixa os pares JSON/JWS por cargo, verifica a assinatura Ed25519 com a chave pública oficial fixada pelo TSE e só então publica o snapshot local.

### Limitações editoriais

- Dados de anos-base diferentes não são tratados como uma série homogênea sem indicação explícita.
- Cálculos derivados são identificados como derivados.
- Denúncias, processos e situações cadastrais são apresentados de forma descritiva, sem inferência de culpa ou mérito.
- O observatório não produz ranking, recomendação eleitoral ou previsão de resultado.

## Licença

MIT — veja [LICENSE](LICENSE).
