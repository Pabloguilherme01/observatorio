import {test,expect} from 'playwright/test';
import {loadTypescript} from '../scripts/lib/load-typescript.mjs';
const {QUESTION_BANK,QUIZ_LEVELS}=await loadTypescript('src/data/quiz/questionBank.ts');

test('API v2 municipal resolve fontes e não oferece endpoints v1',async({request})=>{
  const response=await request.get('./api/v2/observatorio.json');expect(response.ok()).toBe(true);
  const payload=await response.json();expect(payload.schemaVersion).toBe(2);expect(payload.apiVersion).toBe('2.0');
  expect(JSON.stringify(payload)).not.toMatch(/eleitor|candidatur|tse\.jus|"(?:electoral|polls|candidates)"/i);
  const health=await (await request.get('./api/v2/health.json')).json();
  expect(health.appVersion).toBe('46.0.0');expect(health.integrity.valid).toBe(true);expect(health.integrity.unresolvedSources).toEqual([]);
  expect(health.publication.contract).toBe('municipal-publication-v2');
  expect(health.references.some(reference=>reference.precision==='unknown')).toBe(true);
  expect(health.references.every(reference=>reference.freshness==='not-assessed')).toBe(true);
  for(const file of ['observatorio','sources','health','openapi'])expect((await request.get(`./api/v1/${file}.json`)).status()).toBe(404);
});

test('destinos retirados voltam ao início com aviso e sem parâmetros antigos',async({page})=>{
  for(const hash of ['eleitorado','eleitoral360','candidaturas','politica','pesquisas','resultados','linha-do-tempo','mudancas-snapshot']){
    await page.goto(`./?cargo=senador&turno=2&candidato=1&eleicao=2026&resultado=x&dado=electorate&leitura=simple#${hash}`);
    await expect(page).toHaveURL(/\?leitura=simple#descubra$/);
    await expect(page.getByRole('status').filter({hasText:'Esta área foi retirada.'})).toBeVisible();
    await expect(page.locator('#descubra')).toBeVisible();
    await expect(page.locator('#'+hash)).toHaveCount(0);
  }
});

test('migração reinicia aprendizado e preserva tema contraste e leitura',async({page})=>{
  await page.addInitScript(()=>{
    if(sessionStorage.getItem('v46-test-seeded'))return;
    localStorage.setItem('observatorio-theme','light');localStorage.setItem('observatorio-contrast','high');
    localStorage.setItem('observatorio-v45-language-mode','guided');
    localStorage.setItem('observatorio-v45-quiz-best-scores','[40,40,40,40,40]');
    localStorage.setItem('observatorio-v45-quiz-high-scores','[{"score":40}]');
    localStorage.setItem('observatorio-v45-guided-learning-visited','["valor","referencia","contexto","utilidade","fonte","quiz"]');
    sessionStorage.setItem('v46-test-seeded','true');
  });
  await page.goto('./#aprendizado-guiado');
  await expect(page.locator('html')).toHaveClass(/light/);
  await expect(page.locator('html')).toHaveAttribute('data-contrast','high');
  await expect(page.locator('html')).toHaveAttribute('data-language-mode','guided');
  await expect(page.getByRole('progressbar',{name:'Progresso da rota de investigação'})).toHaveAttribute('aria-valuenow','0');
  await expect(page.getByRole('progressbar',{name:'Progresso da rota de investigação'})).toHaveAttribute('aria-valuemax','7');
  const state=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));
  expect(Object.keys(state).filter(key=>key.startsWith('observatorio-v45-')&&/quiz|guided-learning/.test(key))).toEqual([]);
  expect(state['observatorio-v46-language-mode']).toBe('guided');
  await page.locator('#aprendizado-guiado').getByRole('button',{name:'Ir ao resumo'}).click();
  await page.reload();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('observatorio-v46-guided-learning-visited')))).toEqual(['valor']);
  expect(await page.evaluate(()=>localStorage.getItem('observatorio-theme'))).toBe('light');
});

test('quiz municipal percorre 40 respostas e mantém fonte pontuação e desbloqueio',async({page})=>{
  test.setTimeout(120000);
  await page.goto('./#quiz');
  for(const level of QUIZ_LEVELS)await expect(page.locator('.quiz-phase-name').filter({hasText:level})).toHaveCount(1);
  for(let i=0;i<40;i++){
    const question=QUESTION_BANK[i];
    await expect(page.locator('.quiz-prompt')).toHaveText(question.prompt);
    await page.getByRole('group',{name:'Alternativas'}).getByRole('button',{name:question.options[question.answerIndex],exact:true}).click();
    await expect(page.locator('.quiz-feedback')).toContainText(question.explanation);
    await expect(page.locator('.quiz-source')).toHaveAttribute('href',/^https:\/\//);
    await page.locator('.quiz-next').click();
  }
  await expect(page.locator('.quiz-result-score')).toHaveText('40 de 40 acertos');
  await expect(page.getByRole('button',{name:/Fase 2, Entender, disponível/})).toBeEnabled();
  await page.reload();await expect(page.locator('.quiz-phase-card').first()).toContainText('Melhor marca: 40/40');
});

test('navegação e busca não carregam dados ou telas retiradas',async({page})=>{
  const requests=[];page.on('request',request=>requests.push(request.url()));
  await page.goto('./');
  await expect(page.locator('#resumo .city-summary-card')).toHaveCount(4);
  await page.getByRole('button',{name:'Buscar no observatório'}).first().click();
  const input=page.getByRole('dialog').getByRole('combobox');
  for(const query of ['eleitorado','candidaturas','pesquisa eleitoral']){
    await input.fill(query);await expect(page.locator('.search-results')).not.toContainText(/Perfil eleitoral|Candidaturas|DivulgaCand/i);
    await expect(page.locator('.search-results a[href*="eleitor"]')).toHaveCount(0);
  }
  await page.keyboard.press('Escape');
  await page.goto('./#exportacao');await expect(page.locator('#exportacao')).toBeVisible();
  expect(requests.filter(url=>/tse\.jus|tse-results|DeferredArchive|api\/v1\//i.test(url))).toEqual([]);
});

test('SW elimina caches anteriores preserva os atuais e permite consulta offline municipal',async({page,context})=>{
  test.setTimeout(60000);
  await page.addInitScript(()=>{
    const original=navigator.serviceWorker.register.bind(navigator.serviceWorker);
    navigator.serviceWorker.register=async(...args)=>{
      const precache=await caches.open('observatorio-aguas-lindas-precache-v2-'+new URL('./',location.href).href);
      await precache.put('/observatorio/data/tse-results.json?__WB_REVISION__=old',new Response('{"old":true}'));
      await precache.put('/observatorio/api/v1/observatorio.json?__WB_REVISION__=old',new Response('{"old":true}'));
      for(const name of ['observatorio-results-v45','observatorio-api-v45','observatorio-static-v46','other-site-cache']){
        const cache=await caches.open(name);await cache.put('/observatorio/retired-test.json',new Response('{"old":true}'));
      }
      return original(...args);
    };
  });
  await page.goto('./');
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  const names=await page.evaluate(()=>caches.keys());
  expect(names).not.toContain('observatorio-results-v45');expect(names).not.toContain('observatorio-api-v45');
  expect(names).toContain('observatorio-static-v46');expect(names).toContain('other-site-cache');
  const urls=await page.evaluate(async()=>{const keys=await caches.keys();return(await Promise.all(keys.filter(name=>name!=='other-site-cache').map(async name=>(await(await caches.open(name)).keys()).map(request=>request.url)))).flat();});
  expect(urls.filter(url=>/tse-results|api\/v1\/|DeferredArchive/.test(url))).toEqual([]);
  const data=await page.evaluate(async()=>await(await fetch('./api/v2/observatorio.json')).json());expect(data.apiVersion).toBe('2.0');
  await context.setOffline(true);
  const offline=await page.evaluate(async()=>await(await fetch('./api/v2/observatorio.json')).json());
  expect(offline.data.meta.municipality).toBe('Águas Lindas de Goiás');
  expect(await page.evaluate(async()=>{try{return(await fetch('./api/v1/observatorio.json')).ok;}catch{return false;}})).toBe(false);
  await context.setOffline(false);
});
