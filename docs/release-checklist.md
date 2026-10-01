# Release checklist

## Gate técnico

- Pull request para `main` obrigatória.
- Checks obrigatórios: `CI · quality gate`, seis jobs `Browser · ...`, `Quality · independent audit` e `CodeQL · javascript-typescript`.
- Branch deve estar atualizada antes do merge.
- Push direto em `main` deve ser bloqueado.
- Administradores devem seguir as mesmas regras quando a operação do repositório permitir.
- Preferir squash merge para manter o histórico de mudanças fácil de auditar.

## Publicação

- O deploy deve ocorrer somente a partir de um CI de push bem-sucedido na `main`.
- O deploy deve publicar exatamente o SHA validado pelo CI.
- O healthcheck pós-publicação deve confirmar paridade do SHA, estado do snapshot TSE, OpenAPI e assets PWA.

## Automação eleitoral

- Capturas TSE devem gerar branch automática, passar pelo CI e seguir para PR revisada.
- Falha administrativa na criação da PR deve gerar uma única issue operacional com link de comparação.
- Nenhum snapshot eleitoral deve ser mesclado diretamente na `main` pela automação.

## Evidência

- Antes de uma release, registrar o resultado real das Actions para o SHA publicado.
- O comando local `npm run release:check` deve terminar sem `FAIL`.
- Assinatura/verificação de commits deve ser mantida de forma consistente quando a conta e a política do repositório suportarem isso.

## Mitigação técnica quando a proteção administrativa não estiver disponível

O CI também executa `npm run check:main-provenance` em pushes para `main`. O guard consulta as PRs associadas ao SHA e só permite que o pipeline prossiga quando o commit estiver associado a uma PR já mesclada para `main`.

Isso não substitui a proteção nativa da branch. Porém, evita que um push direto em `main` seja considerado um release válido pelo pipeline e, portanto, impede que esse caminho alcance o deploy de Pages.

A proteção nativa de branch/ruleset continua recomendada para bloquear o push na origem, antes mesmo da execução do CI.
