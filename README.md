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
npm run typecheck
npm run validate:observatorio
npm run validate:tse
npm run build
```

O CI executa typecheck e build a cada push/PR. O deploy do GitHub Pages publica o diretório `dist`.

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

V31.0 — Observatório de Dados Cívicos e Eleitorais.

### Foco V31
- Mobile-first com navegação rápida, áreas de toque >=44px e safe-area para barras fixas.
- Compartilhamento nativo de resumo e cenários de mobilidade.
- Estados TSE explicitamente diferenciados entre capturado, desatualizado, falha e aguardando captura.
- Visualização histórica de saneamento com escala 0–100% e tabela compacta no celular.
- Feed de resultados com contrato contextualizado: eleição, turno, UF, município, cargo, arquivo-fonte e estado de captura.
- Validação dedicada do feed de resultados antes de CI e publicação.

### Camadas atuais
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
A automação de candidatos do TSE está preparada para ler o arquivo de Goiás e produzir um snapshot de watchlist com SHA-256, diff e histórico. Enquanto a primeira captura validada não existir, a interface mantém o estado `not_synced` e não interpreta isso como ausência de candidaturas.

### Limitações editoriais
- Dados de anos-base diferentes não são tratados como uma série homogênea sem indicação explícita.
- Cálculos derivados são identificados como derivados.
- Denúncias, processos e situações cadastrais são apresentados de forma descritiva, sem inferência de culpa ou mérito.
- O observatório não produz ranking, recomendação eleitoral ou previsão de resultado.
