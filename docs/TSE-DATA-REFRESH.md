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

Quando os endpoints oficiais recusarem o acesso do executor (HTTP 403), baixe o recurso **Candidatos** diretamente do [catálogo oficial](https://dadosabertos.tse.jus.br/dataset/candidatos-2026) em um ambiente com acesso. Confira a integridade do ZIP e execute `TSE_SOURCE_ZIP=/caminho/consulta_cand_2026.zip npm run sync:tse`; em seguida, faça as mesmas validações e revisão do diff acima. O sincronizador lê o CSV de GO em Latin-1, separado por ponto e vírgula, e registra o SHA-256 do ZIP oficial no snapshot. Não publique o arquivo ZIP completo no repositório.

## Garantias

- Nenhuma URL de proxy de terceiros é necessária pelo sincronizador.
- O deploy do GitHub Pages não chama `sync:tse`.
- O deploy do GitHub Pages não depende de acesso de rede ao TSE.
- A disponibilidade do TSE afeta somente a operação de atualização de dados, não a publicação do site.
- O Quality continua validando a integridade do snapshot já versionado.

## GitHub Actions

`.github/workflows/sync-tse-2026.yml` é o workflow de atualização de candidatos. Ele roda manualmente e a cada 4 horas, mas mantém a atualização eleitoral separada da publicação do site. Indisponibilidade, WAF ou bloqueio de rede do TSE não deve transformar a atualização de dados em indisponibilidade de produção.

Quando há mudança no snapshot, o workflow:

1. captura e valida os dados oficiais;
2. cria uma branch automática;
3. executa o CI completo nessa branch;
4. abre uma pull request para `main`;
5. deixa revisão e merge fora da automação de captura.

O fluxo de produção é:

`PR revisada -> CI em main -> GitHub Pages`

O fluxo de atualização eleitoral é independente:

`captura direta TSE -> validação -> branch -> CI -> PR -> merge revisado`

## Proveniência

Snapshots históricos podem preservar metadados de transporte usados na captura original. Isso é apenas histórico de proveniência; não representa uma dependência de runtime, build ou deploy.

## Verificação rápida

```bash
npm run audit:tse-architecture
REQUIRE_TSE_SYNC=true npm run validate:tse
npm run build
```
