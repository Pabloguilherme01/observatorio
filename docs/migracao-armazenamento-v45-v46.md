# Migração do armazenamento v45 para v46

## Comportamento

- O progresso v45 do quiz e da trilha permanece nas chaves antigas quando ainda existe ao executar a migração corrigida. Ele não é aplicado ao conteúdo reescrito da v46.
- O modo de leitura é preservado. Tema e contraste usam chaves próprias, sem número de versão. Indicadores salvos e seções recentes também são copiados quando ainda não há dados v46; seus leitores filtram itens inválidos ou retirados.
- Dados já presentes na v46 prevalecem. O marcador `observatorio-v46-migrated` impede uma segunda migração. Se uma gravação falhar antes do marcador, a migração poderá ser tentada novamente na próxima abertura.
- As informações ficam no armazenamento local da mesma origem e do mesmo navegador. Elas não são sincronizadas ou copiadas automaticamente para outro aparelho.

## Limites de recuperação

Uma versão anterior da v46 removia as chaves v45 de quiz e trilha ao migrar. A correção só preserva chaves ainda presentes: ela não recria dados removidos e o aplicativo não oferece uma restauração automática para o progresso antigo. Uma cópia feita anteriormente pode ser guardada como registro, mas não deve ser aplicada ao quiz ou à trilha v46 sem uma conversão compatível.

Antes de atualizar um navegador que ainda tenha progresso v45, preserve uma cópia usando o inspetor de armazenamento do próprio navegador, sem recarregar a página antiga no site que ainda serve a migração destrutiva. Não limpe os dados do navegador. Trate a cópia como dado pessoal.

## Validação em ambiente de teste

Use apenas um perfil ou contexto isolado com dados fictícios. Semeie as chaves v45 de melhores pontuações, histórico do quiz, trilha e modo de leitura; confira que as três chaves de aprendizado continuam idênticas, que quiz e trilha v46 começam vazios e que o modo, o tema e o contraste permanecem. Registre progresso v46 e recarregue para verificar que ele persiste.

Repita com marcador e progresso v46 preexistentes, armazenamento indisponível e uma gravação interrompida. Uma preferência escolhida enquanto a migração estiver pendente deve prevalecer na próxima tentativa. Execute os testes de migração no Chromium, Firefox e WebKit; o teste automatizado offline usa Chromium.

Depois de publicar, confirme o SHA em `/api/v2/health.json` e repita a conferência em aparelhos reais, inclusive PWA instalado e recarga offline, sem usar dados pessoais de produção nos testes.
