# Auditoria técnica V38

Data da revisão: 23/09/2026

## Escopo

Revisão estrutural do aplicativo React/Vite, camada de dados, proveniência, navegação, acessibilidade básica, PWA, CI/CD e consistência de edição.

## Alterações aplicadas

- Versão centralizada atualizada para V38 e sincronizada com `package.json`.
- Hero reorganizado para expor população, eleitorado, orçamento e data da última atualização local logo na entrada.
- Acesso direto à camada de evidências incluído no hero.
- Cartões de descoberta receberam estado de grupo para hover consistente e rótulos acessíveis.
- Seções `Eleitoral 360°` e `Dados` deixaram de ser ocultadas pelo modo Visão geral, evitando navegação para conteúdo inexistente no DOM visível.
- Novo comando `npm run audit:static` adicionado ao CI.

## Controles automatizados

O script `scripts/audit-static.mjs` verifica:

- sincronização entre `package.json`, `APP_VERSION`, `EDITION` e namespace de armazenamento;
- consistência entre `updatedAt` do dataset e `dateModified` do documento;
- base, `start_url` e `scope` do GitHub Pages/PWA;
- robots.txt e sitemap;
- presença das camadas de qualidade e evidências;
- âncoras principais da navegação;
- escopo `watchlist` e estados válidos do snapshot de candidaturas;
- ausência de referências legadas V35/V36 nos arquivos críticos.

## Pontos preservados

A camada eleitoral continua separando captura oficial, recorte editorial e estado `not_synced`. O conjunto local não transforma a watchlist de candidaturas em universo completo e mantém a proveniência identificada.

## Validação

Antes da V38, as execuções CI/Quality da V37 no commit `3360debc3c664de859773e7fda5fd02ffe546c44` concluíram com sucesso em 23/09/2026. Após as alterações V38, novas execuções de CI, Quality e deploy foram disparadas automaticamente e devem ser consideradas a validação final desta edição.

## Limitações da auditoria

A revisão foi feita sobre o repositório e seus workflows. O ambiente desta sessão não conseguiu baixar o site publicado diretamente nem executar um navegador local contra um checkout completo, então não há afirmação de teste visual cross-browser nesta auditoria.
