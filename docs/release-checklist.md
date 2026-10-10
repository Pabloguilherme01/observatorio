# Release checklist — versão 46

- PR para main obrigatória; esta etapa termina com código e PR validados, sem merge nem publicação.
- Build, TypeScript, auditorias municipais, quiz, fontes, segurança, acessibilidade, bundle e PWA aprovados.
- CI · quality gate, sete perfis Browser e CodeQL para o mesmo SHA.
- Nenhum módulo, arquivo público, requisição, automação ou campo de dataset do escopo retirado.
- 200 questões únicas, 40 por fase, quatro alternativas, resposta válida, explicação e fonte existente.
- Migração preserva tema, contraste e leitura; reinicia aprendizado anterior sem apagar o novo progresso.
- Links antigos voltam ao início com aviso e parâmetros limpos; endpoints v1 ausentes.
- SW conectado remove caches antigos; dataset municipal funciona offline sem afirmar atualização em tempo real.
- Serviços, busca, orçamento, simulador, comparação, CSV e compartilhamento funcionam no desktop e celular.
- Teclado, foco, contraste e largura de 320 a 1920 px verificados; capturas e relatório registrados.
- Valores preservados com seus períodos; planejamento nunca rotulado como gasto pago.

Quando uma publicação for autorizada, usar somente o artefato Browser aprovado para o SHA validado por CI, Browser e CodeQL. Revalidar main antes de publicar e conferir publication.commitSha, API v2, assets e PWA pela rede pública. Proteção nativa de branch complementa o guard de proveniência; nenhum push direto deve ser considerado release válido.
