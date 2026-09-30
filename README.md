# Observatório de Dados Cívicos e Eleitorais — Águas Lindas de Goiás 2026

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

O site adapta conteúdo, densidade e apoio à leitura em quatro modos, persistidos no navegador:

- **Resumo** — leitura rápida dos pontos principais, com referência e origem preservadas.
- **Explicado** — acrescenta contexto para entender natureza, período, definições e significado dos números.
- **Guiado** — organiza a leitura em uma trilha pedagógica com perguntas-guia, glossário de status, próxima etapa sugerida e progresso por etapas visitadas. Usa os mesmos dados do Explicado e não recomenda escolhas políticas ou eleitorais.
- **Detalhado** — amplia a leitura com fonte, data, método, cálculos, recortes e limitações. O **Mapa de Evidências** aparece neste modo.

O mapa de evidências é uma ferramenta de auditoria: fica oculto nos modos Resumo, Explicado e Guiado (que já recebem proveniência nos próprios indicadores) e aparece apenas no modo Detalhado.

## Quiz do Observatório

200 perguntas distribuídas em 5 fases de dificuldade — Fácil, Médio, Difícil, Avançado e Expert — com 40 perguntas por fase. Cada fase é desbloqueada ao concluir a anterior. Cada resposta traz explicação e link para a fonte do dado.

## Desenvolvimento

```bash
npm ci
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

Os workflows **Quality** e **CI** executam em cada pull request e em pushes na `main`. O Quality concentra validações estáticas, acessibilidade, mobile, contratos de dados e build; o CI complementa com testes de integração, fontes, navegadores, indisponibilidade do TSE e verificação do artefato PWA. O deploy do GitHub Pages publica o diretório `dist`.

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

**V44.10.1 — Observatório de Dados Cívicos e Eleitorais.**

- Quatro modos de leitura (Resumo, Explicado, Guiado, Detalhado) com preferência persistida e links compartilháveis.
- Quiz com 200 perguntas em 5 fases de dificuldade (40 por fase), com desbloqueio progressivo, explicação e fonte por questão.
- Aprendizado Guiado com trilha de 6 etapas, perguntas-guia, glossário de status e progresso local reiniciável.
- Mapa de evidências reservado ao modo Detalhado, em mini cards de auditoria.
- Navegação mobile com barra inferior, `aria-current`, áreas de toque >=44px e safe-area.
- Carregamento diferido por proximidade da viewport, reduzindo o JavaScript inicial.
- Compartilhamento por dado individual (Web Share API com fallback de cópia), kit para Instagram e exportação JSON/CSV.
- PWA com cache local e `theme-color` acompanhando o tema claro/escuro.
- Atualizações eleitorais são capturadas em branch automática, validadas por CI antes da PR e preservam o último snapshot válido quando a fonte externa está indisponível.

### Camadas atuais

- Cadeia de evidências com distinção explícita entre fonte oficial e captura local
- Dashboard municipal e eleitoral
- Eleitorado e perfil demográfico
- Calculadora de mobilidade e custo relativo à renda
- Saneamento e saúde com cálculos derivados explicitados
- Candidaturas e Eleitoral 360° com proveniência de snapshots
- Linha do tempo eleitoral baseada em fontes oficiais
- Orçamento, exportação e mapa de evidências (modo Detalhado)
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
