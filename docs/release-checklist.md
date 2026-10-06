# Release checklist

## Gate técnico

- Pull request para `main` obrigatória.
- Checks obrigatórios: `CI · quality gate`, sete jobs `Browser · ...` (Chrome desktop, Chrome a11y, Firefox desktop, Safari desktop, Chrome Android, Safari iPhone e Safari iPhone SE) e `CodeQL · javascript-typescript`. Os contratos de qualidade que antes ficavam separados estão consolidados no CI principal.
- Branch deve estar atualizada antes do merge.
- Push direto em `main` deve ser bloqueado.
- Administradores devem seguir as mesmas regras quando a operação do repositório permitir.
- Preferir squash merge para manter o histórico de mudanças fácil de auditar.

## Publicação

- O deploy deve ser iniciado por um `CI` de push concluído e só prossegue quando `CI`, `Browser compatibility` e `CodeQL` estiverem verdes para o mesmo SHA da `main`.
- O deploy deve publicar exatamente o SHA validado pelos três gates de publicação.
- Antes da publicação, `main` deve continuar apontando para esse mesmo SHA; se a branch avançar, o deploy antigo deve abortar.
- O healthcheck pós-publicação deve confirmar paridade do SHA, estado do snapshot TSE, OpenAPI e assets PWA.

## Automação eleitoral

- Capturas TSE devem gerar branch automática, passar pelo CI e seguir para PR revisada.
- Falha administrativa na criação da PR deve gerar uma única issue operacional com link de comparação.
- Nenhum snapshot eleitoral deve ser mesclado diretamente na `main` pela automação.

## Evidência

- Antes de uma release, registrar o resultado real das Actions para o SHA publicado.
- O comando local `npm run audit:release` deve terminar sem `FAIL`; a validação do bundle, performance e PWA deve ser feita a partir do build produzido pelo Browser.
- Assinatura/verificação de commits deve ser mantida de forma consistente quando a conta e a política do repositório suportarem isso.

## Mitigação técnica quando a proteção administrativa não estiver disponível

O CI também executa `npm run check:main-provenance` em pushes para `main`. O guard consulta as PRs associadas ao SHA e só permite que o pipeline prossiga quando o commit estiver associado a uma PR já mesclada para `main`.

Isso não substitui a proteção nativa da branch. Porém, evita que um push direto em `main` seja considerado um release válido pelo pipeline e, portanto, impede que esse caminho alcance o deploy de Pages.

A proteção nativa de branch/ruleset continua recomendada para bloquear o push na origem, antes mesmo da execução do CI.

## Operação idempotente das sincronizações

- Os workflows TSE verificam se já existe uma PR aberta para a branch de automação antes de chamar `gh pr create`.
- Reexecuções do mesmo ciclo não devem criar PRs duplicadas.
- Se a criação de PR continuar bloqueada por permissão do GitHub, a issue operacional permanece como fallback único e não autoriza merge automático.

## Manutenção contínua

- `audit:workflows` valida a estrutura dos workflows, matriz de navegadores, permissões relevantes, proveniência e cadeia de deploy.
- `audit:styles` mede a dívida de CSS e registra seletores compartilhados entre arquivos para evitar novas camadas redundantes.
- O workflow Browser protege o build único compartilhado com `audit:bundle`, `audit:performance` e `test:pwa`; a suíte Chrome mede LCP, FCP, CLS, tarefas longas e latência de interação em laboratório.
- O entrypoint compartilhado `src/assets/styles/index.css` centraliza as camadas globais; estilos específicos de componentes continuam locais.
- O hook `useDialogFocus` centraliza foco, Escape, Tab e bloqueio de rolagem dos diálogos.
- O workflow de limpeza remove branches de automação antigas e, com regras de segurança, branches de trabalho antigas já associadas a PR mesclada na branch padrão, sem PR aberta; a exclusão de um branch mesclado só é permitida quando sua ponta ainda coincide exatamente com o commit da mesclagem, há idade mínima e existe limite por execução.
