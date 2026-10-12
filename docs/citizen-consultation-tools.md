# Ferramentas de consulta do cidadão

## Serviços salvos

O filtro “Apenas meus serviços salvos” combina a seleção local com o texto da busca e o assunto escolhido. Ao abrir uma nova necessidade pelos atalhos ou pela busca inicial, o filtro local é desligado para consultar todo o catálogo. A seleção permanece guardada. O filtro local não faz parte do link público da busca; nesse modo o botão de copiar a busca fica oculto, e a lista pode ser compartilhada na área “Meus serviços”.

Uma consulta vazia oferece retorno aos serviços principais e buscas frequentes. Esses atalhos limpam os filtros anteriores para evitar resultados ocultos.

“Compartilhar meus serviços” prepara uma lista com nomes, descrições e endereços oficiais reconhecidos pelo catálogo. Em navegadores compatíveis, abre o compartilhamento do sistema. Nos demais, copia a lista. Cancelar não gera erro; bloqueios oferecem texto selecionável para cópia manual. “Baixar meus serviços” gera um arquivo TXT com o mesmo conteúdo. Nenhuma ação inclui documentos, protocolos ou parâmetros da consulta, e nenhum destinatário é escolhido pelo Observatório.

## Seleções de indicadores

O catálogo mantém assunto, natureza e filtro de referência temporal na URL enquanto a área de dados está aberta. Os parâmetros são `indicadores`, `natureza` e `sem-periodo=1`. Naturezas desconhecidas usam o catálogo completo; outros valores de `sem-periodo` não ativam o filtro. O texto de pesquisa aceita até 160 caracteres.

“Copiar link da seleção” gera um endereço limpo com esses filtros, o modo de leitura e a âncora `#dados`. Abrir o endereço ou recarregar restaura a seleção. A navegação por histórico restaura o estado correspondente. A ação “Limpar filtros” também remove seus parâmetros. O CSV inclui todos os resultados filtrados com unidade, natureza, período, fonte, URL e notas, preservando o contrato existente.

O conjunto municipal, API v2, valores publicados, fontes, progresso de aprendizado e preferências são preservados. As funcionalidades não dependem de contas, banco de dados ou novas requisições a serviços externos.
