# Observatório de Dados Cívicos e Eleitorais — Águas Lindas de Goiás 2026

Aplicação web pública de dados municipais e eleitorais de Águas Lindas de Goiás, construída com Vite + React + TypeScript.

## Edição V45 · pós-eleição

A edição V45 marca a transição de um painel de acompanhamento pré-eleitoral para um arquivo público pós-eleição.

A interface passa a priorizar:

- resultados oficiais versionados e verificáveis;
- preservação do snapshot depois do encerramento da apuração;
- separação clara entre resultado observado, eleitorado, indicador histórico, estimativa e cálculo derivado;
- cadeia de fontes e metadados de captura;
- fiscalização cívica, orçamento, serviços públicos e contexto municipal;
- exportação e leitura offline dos dados já publicados.

A contagem regressiva foi removida da interface pública. O calendário eleitoral permanece disponível como referência oficial do TSE.

## Resultados oficiais

O fluxo de resultados usa os arquivos oficiais JSON/JWS do TSE e valida a assinatura antes de publicar um snapshot local.

Depois da janela de apuração, o resultado deixa de ser tratado como "ao vivo" e passa a ser apresentado como arquivo histórico. Nenhum resultado é estimado ou preenchido manualmente.

O pipeline continua seguindo:

captura oficial TSE → validação → branch automática → CI → pull request revisada → main → Pages

## Dados

O observatório preserva:

- data de referência;
- data de captura;
- natureza do indicador;
- fonte e URL;
- método e limitações;
- cálculos derivados separados de valores observados.

## Verificação

```bash
npm ci
npm run typecheck
npm run validate:results
npm run audit:static
npm run audit:a11y
npm run audit:mobile
npm run audit:release
npm run build
```

## Deploy

URL pública:

https://pabloguilherme01.github.io/observatorio/

O build permanece compatível com GitHub Pages e a interface não consulta o TSE em tempo de execução.

## Governança

Snapshots eleitorais nunca são mesclados automaticamente na `main`. A proteção nativa de branch/ruleset continua recomendada, enquanto os guards de proveniência do pipeline funcionam como segunda barreira.
