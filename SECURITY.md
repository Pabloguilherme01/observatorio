# Política de segurança

O Observatório é um projeto público e estático. A cadeia de entrega inclui GitHub Actions, dependências npm, ingestão de dados oficiais e publicação em GitHub Pages.

Para relatar uma vulnerabilidade de forma responsável, use o recurso privado de Security Advisories / Private vulnerability reporting do GitHub, quando disponível no repositório. Não publique detalhes exploráveis, credenciais ou segredos em issues, pull requests ou discussões públicas.

As mudanças de segurança devem preservar a rastreabilidade dos dados públicos, o princípio de privilégio mínimo nos workflows e a separação entre captura de dados e publicação na main.

Mudanças de segurança devem incluir validação reproduzível no CI e evitar introduzir dependências ou Actions desnecessárias.
Além do `npm audit`, o repositório executa CodeQL para JavaScript/TypeScript em pushes e pull requests da `main`, com consultas `security-extended` e execução agendada semanal. Os resultados são enviados ao code scanning do GitHub e não substituem revisão humana, validação de dados nem os gates funcionais do CI.

