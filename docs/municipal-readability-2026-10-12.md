# Legibilidade e períodos municipais — 12/10/2026

A auditoria da publicação V46 encontrou contraste insuficiente na ação principal, quebra de algarismos no total da LOA em 320 px, divergência entre cobertura temporal e API, e ausência do período da tarifa junto à simulação.

## Alterações

- A ação principal usa cores com contraste verificável contra um fundo opaco.
- O total da LOA mantém o valor exato e uma linha em telas de 320 a 1920 px, com tamanho responsivo.
- O resumo reconhece datas e anos-base pelo mesmo normalizador usado pelo catálogo e pela API: 55 de 67 indicadores (82,1%). Os 12 sem período continuam explicitamente sem referência.
- As tarifas mostram a ausência de período junto ao preço e na comparação de rotas. O aviso acompanha o compartilhamento. A data de publicação de uma fonte não é usada como vigência da tarifa.
- Os cartões de serviços têm títulos de 15 px e descrições de 14 px, inclusive no celular.

Nenhum valor ou período do dataset foi alterado. A LOA continua identificada como planejamento, sem equivalência com despesa paga. Quiz, trilha e preferências mantêm a migração da V46.

## Validação local

- Build com TypeScript: aprovado.
- 17 auditorias gerais e municipais: aprovadas.
- 22 cenários municipais no Chrome desktop e Android: aprovados.
- Tipografia dos serviços e acessibilidade nos dois temas, incluídas nos cenários municipais.
- Fluxo de teclado: verifica o retorno do foco à busca antes de seguir para os modos de leitura.
- Contraste da ação principal verificado nos temas claro e escuro e nas opções padrão e alto contraste.
- Orçamento verificado em 320, 390, 768 e 1920 px: algarismos completos em uma linha, sem extrapolar o cartão ou a janela.
- Resumo temporal comparado com a API, incluindo o filtro de indicadores sem período.
- Troca de rota e compartilhamento com aviso da referência temporal.
- Bundle e Service Worker de produção: aprovados.

## Limite conhecido

Uma navegação local previamente armazenada apresentou conteúdo antigo; uma nova URL apresentou o build municipal atual. Essa observação não determina a causa. A atualização de instalações antigas deve continuar sendo investigada com reprodução específica, sem remover cache ou preferências do usuário por suposição.
