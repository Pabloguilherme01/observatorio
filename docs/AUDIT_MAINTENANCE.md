# Política de manutenção das auditorias

O Observatório possui uma suíte ampla de verificações. Essa cobertura só é útil se cada auditoria continuar protegendo um risco real do produto, e não apenas a existência de outro script.

## Hierarquia

### 1. Gates comportamentais

Têm prioridade máxima e devem testar comportamento observável:

- build e typecheck;
- navegador e acessibilidade;
- PWA/offline;
- contratos de dados municipais;
- integridade de fontes;
- segurança;
- publicação do SHA validado.

### 2. Gates de contrato

Podem inspecionar arquivos/configuração quando protegem uma regra concreta, por exemplo:

- Actions pinadas;
- workflow obrigatório;
- versão sincronizada;
- ausência de domínios e campos retirados no conjunto ativo;
- proveniência da `main`.

### 3. Meta-auditorias

Uma meta-auditoria só deve existir quando impedir uma regressão que não possa ser coberta melhor por teste comportamental ou por configuração nativa do GitHub.

## Regra para novo script de auditoria

Antes de adicionar `scripts/audit-*.mjs`, registre na PR:

1. risco real protegido;
2. evidência de falha antes da correção, quando aplicável;
3. por que um teste existente não cobre o caso;
4. qual comportamento ou contrato externo falhará se a regra regredir;
5. custo de manutenção do novo check.

Se o script só validar que outro script, texto ou nome existe, prefira remover a redundância ou incorporar a regra ao gate que realmente executa o comportamento.

## Consolidação

Quando duas auditorias passam a validar o mesmo contrato, consolidar a regra no check de nível mais baixo que ainda represente o comportamento real.

Não remover cobertura de segurança, fontes, acessibilidade, dados municipais ou proveniência apenas para reduzir quantidade de scripts.

## Dados municipais

Mudanças nos indicadores, serviços, orçamento e aprendizado devem:

- manter descrição factual e linguagem neutra;
- preservar fonte, data, recorte e limitações;
- não apresentar planejamento como execução ou ausência de data como atualidade;
- distinguir dado oficial, captura local, dado derivado e hipótese;
- validar origem, recorte e integridade antes de incorporar novos valores.

## Workflows destrutivos

Workflows que recebem `contents: write` e podem excluir ou alterar referências devem executar exclusivamente a partir da branch padrão protegida. O contrato deve cobrir também branches protegidas além de `main`, execução manual em ref não confiável e limites explícitos de operação.

A rotina de cleanup deve repetir essa proteção no próprio script: execução destrutiva exige GitHub Actions e `GITHUB_REF` da branch padrão. O workflow não pode ser a única barreira.

## Critério de saúde

A suíte está saudável quando um teste falha por uma regressão do produto/contrato — não porque uma frase, nome de arquivo ou estrutura interna sem impacto real mudou.
