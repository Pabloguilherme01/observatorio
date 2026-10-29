# Observatório Público de Águas Lindas de Goiás

Versão 46.0.0. Ferramenta para entender a cidade, encontrar serviços e acompanhar o dinheiro público, com linguagem acessível, período, unidade e fonte em cada indicador.

A entrada oferece seis necessidades: cidade, serviços, orçamento, transporte, saúde e saneamento, consultar dados. O resumo reúne quatro referências municipais. O histórico distingue Censo e estimativas; o orçamento autorizado não é apresentado como despesa paga.

## Aprenda a usar os dados

Quatro modos de leitura: Resumo, Explicado, Guiado e Detalhado. A trilha tem sete passos: identificar indicador, conferir período, entender significado, comparar medidas compatíveis, encontrar serviço, conferir fonte e praticar.

O quiz tem 200 perguntas municipais, cinco fases de 40: Começar, Entender, Comparar, Conferir e Aplicar. Cada pergunta tem quatro alternativas, uma resposta correta, explicação e fonte registrada. A versão 46 inicia o aprendizado sem reaproveitar o progresso anterior. A migração corrigida conserva as chaves de aprendizado v45 ainda existentes no navegador, mas não recupera dados já apagados por uma migração anterior. Veja os limites e a validação em [migração do armazenamento](docs/migracao-armazenamento-v45-v46.md).

## Desenvolvimento e validação

Vite, React, TypeScript strict, Tailwind, Recharts, Lucide e PWA/Workbox. Node 24.

```sh
npm ci
npm run dev
npm run build
npm run quality:check
npm run validate:observatorio
npm run audit:quiz
npm run test:audit-guards
npm run test:pwa
npm run test:browser
```

API estática gerada no build: dataset, fontes, saúde e OpenAPI em /observatorio/api/v2/. Consulte [migração da API](docs/api-v2-migracao.md), [metodologia](docs/metodologia.md), [confiabilidade](docs/arquitetura-confiabilidade.md) e [checklist](docs/release-checklist.md).

O site usa GitHub Pages no subcaminho /observatorio/. A publicação depende de CI, sete perfis de navegador e CodeQL para o mesmo commit.
