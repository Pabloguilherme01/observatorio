# Arquitetura de confiabilidade

SPA React/Vite publicada em GitHub Pages. Código validado, artefato aprovado e resposta pública observável são três verificações diferentes.

O fallback public/404.html preserva rotas virtuais, mas exclui API e arquivos estáticos. Âncoras retiradas são tratadas na interface: redirecionamento ao início, aviso acessível e limpeza dos parâmetros antigos. Não existe montagem ou requisição aos módulos retirados.

O endpoint api/v2/health.json fornece integridade municipal e publication.commitSha. O deploy reutiliza o artefato Browser aprovado, exige CI, Browser compatibility e CodeQL do mesmo SHA e confirma a paridade publicamente. Um build aprovado não prova sozinho que o site foi publicado.

Os blocos diferidos têm isolamento de erro e recuperação. Busca, modos de leitura e navegação preservam foco e histórico. Conectividade, timers e requisições possuem cancelamento ou cleanup.

O Service Worker v46 limpa caches anteriores ao ativar conectado. Workbox remove recursos antigos do precache. A API v1 não é gerada; a API v2 não contém campos retirados. O health permanece fora do cache para evitar afirmar um estado de publicação antigo.

Integridade não é atualidade: a referência de cada indicador acompanha o dado; sem data conhecida o período é declarado desconhecido. Tema e contraste mantêm suas chaves; o modo de leitura migra de v45 para v46. Quiz e trilha anteriores são reiniciados porque o conteúdo mudou.
