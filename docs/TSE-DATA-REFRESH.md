# Atualização dos dados TSE 2026

## Arquitetura

A publicação do Observatório usa somente dados versionados no repositório. O site não consulta o TSE em tempo de execução e o workflow de Pages não executa a sincronização eleitoral.

A atualização de candidatos é uma operação de dados separada:

1. executar `npm install`;
2. executar `npm run sync:tse` em um ambiente com acesso direto aos endpoints oficiais do TSE;
3. executar `REQUIRE_TSE_SYNC=true npm run validate:tse`;
4. executar `npm run audit:tse-architecture`;
5. revisar o diff gerado em `src/data/generated/tse2026-diff.json`;
6. versionar o snapshot e a pasta `src/data/generated/history`.

## Garantias

- Nenhuma URL de proxy de terceiros é necessária pelo sincronizador.
- O deploy do GitHub Pages não chama `sync:tse`.
- O deploy do GitHub Pages não depende de acesso de rede ao TSE.
- A disponibilidade do TSE afeta somente a operação de atualização de dados, não a publicação do site.
- O Quality continua validando a integridade do snapshot já versionado.

## GitHub Actions

`.github/workflows/sync-tse-candidates.yml` é manual por design. O objetivo é evitar transformar indisponibilidade, WAF ou bloqueio de rede do TSE em indisponibilidade de produção.

O fluxo de produção é:

`Quality -> Build -> GitHub Pages`

O fluxo de atualização eleitoral é independente:

`captura direta TSE -> validação -> commit do snapshot`

## Proveniência

Snapshots históricos podem preservar metadados de transporte usados na captura original. Isso é apenas histórico de proveniência; não representa uma dependência de runtime, build ou deploy.

## Verificação rápida

```bash
npm run audit:tse-architecture
REQUIRE_TSE_SYNC=true npm run validate:tse
npm run build
```
