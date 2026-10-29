import { test, expect } from 'playwright/test';

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
  expect(state['observatorio-v45-quiz-best-scores']).toBe('[40,40,40,40,40]');
  expect(state['observatorio-v45-quiz-high-scores']).toBe('[{"score":40}]');
  expect(state['observatorio-v45-guided-learning-visited']).toBe('["valor","referencia","contexto","utilidade","fonte","quiz"]');
  expect(state['observatorio-v46-quiz-best-scores']).toBeUndefined();
  expect(state['observatorio-v46-quiz-high-scores']).toBeUndefined();
  expect(state['observatorio-v46-language-mode']).toBe('guided');
  await page.goto('./#quiz');
  await expect(page.getByRole('button', { name: /Fase 2, Entender, bloqueada/ })).toBeDisabled();
  await expect(page.locator('.quiz-phase-card').first()).toContainText('Melhor marca: 0/40');
  await page.goto('./#aprendizado-guiado');
  await page.locator('#aprendizado-guiado').getByRole('button',{name:'Ir ao resumo'}).click();
  await page.reload();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('observatorio-v46-guided-learning-visited')))).toEqual(['valor']);
  expect(await page.evaluate(()=>localStorage.getItem('observatorio-theme'))).toBe('light');
  expect(await page.evaluate(()=>localStorage.getItem('observatorio-v45-quiz-best-scores'))).toBe('[40,40,40,40,40]');
});

test('migração concluída mantém progresso e preferência já existentes na v46', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('existing-v46-seeded')) return;
    localStorage.setItem('observatorio-v45-quiz-best-scores', '[40,40,40,40,40]');
    localStorage.setItem('observatorio-v45-guided-learning-visited', '["valor","referencia"]');
    localStorage.setItem('observatorio-v45-language-mode', 'simple');
    localStorage.setItem('observatorio-v46-quiz-best-scores', '[30,0,0,0,0]');
    localStorage.setItem('observatorio-v46-guided-learning-visited', '["valor"]');
    localStorage.setItem('observatorio-v46-language-mode', 'guided');
    localStorage.setItem('observatorio-v46-migrated', 'true');
    sessionStorage.setItem('existing-v46-seeded', 'true');
  });
  await page.goto('./#aprendizado-guiado');
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'guided');
  await expect(page.getByRole('progressbar', { name: 'Progresso da rota de investigação' })).toHaveAttribute('aria-valuenow', '1');
  await page.goto('./#quiz');
  await expect(page.locator('.quiz-phase-card').first()).toContainText('Melhor marca: 30/40');
  await expect(page.getByRole('button', { name: /Fase 2, Entender, disponível/ })).toBeEnabled();
  await page.reload();
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v46-quiz-best-scores'))).toBe('[30,0,0,0,0]');
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v45-quiz-best-scores'))).toBe('[40,40,40,40,40]');
});

test('leituras e áreas antigas são filtradas ao serem apresentadas na v46', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('observatorio-v45-saved-indicators', JSON.stringify([
      { id: 'municipal', title: 'Indicador municipal salvo', url: '/observatorio/#dashboard' },
      { id: 'eleitorado', title: 'Indicador eleitoral antigo', url: '/observatorio/#eleitorado' },
      { id: 'external', title: 'Link externo antigo', url: 'https://example.org/' },
    ]));
    localStorage.setItem('observatorio-v45-recent-sections', '["dashboard","eleitorado","area-inexistente"]');
  });
  await page.goto('./');
  await page.getByRole('button', { name: 'Buscar no observatório' }).first().click();
  const saved = page.locator('section[aria-labelledby="search-saved-title"]');
  await expect(saved).toContainText('Indicador municipal salvo');
  await expect(saved).not.toContainText('Indicador eleitoral antigo');
  await expect(saved).not.toContainText('Link externo antigo');
  await expect(saved.locator('a')).toHaveCount(1);
  const recent = page.locator('section[aria-labelledby="search-recent-title"]');
  await expect(recent.locator('.search-result-group-list button')).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v45-saved-indicators'))).toContain('eleitorado');
});

test('falha temporária não troca a preferência anterior pelo valor padrão', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('transient-failure-seeded')) return;
    localStorage.setItem('observatorio-v45-language-mode', 'guided');
    localStorage.setItem('observatorio-v45-quiz-best-scores', '[40,0,0,0,0]');
    sessionStorage.setItem('transient-failure-seeded', 'true');
    const original = Storage.prototype.setItem;
    let failed = false;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'observatorio-v46-language-mode' && !failed) {
        failed = true;
        throw new DOMException('Falha temporária simulada', 'QuotaExceededError');
      }
      return original.call(this, key, value);
    };
  });
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'guided');
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v46-migrated'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v46-language-mode'))).toBeNull();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'guided');
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v46-language-mode'))).toBe('guided');
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v46-migrated'))).toBe('true');
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v45-quiz-best-scores'))).toBe('[40,0,0,0,0]');
});

test('escolha feita durante uma migração pendente não é sobrescrita na nova tentativa', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('pending-migration-seeded')) {
      localStorage.setItem('observatorio-v45-saved-indicators', '[]');
      localStorage.setItem('observatorio-v45-language-mode', 'guided');
      sessionStorage.setItem('pending-migration-seeded', 'true');
    }
    if (!sessionStorage.getItem('allow-migration-retry')) {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        if (key === 'observatorio-v46-saved-indicators') throw new DOMException('Falha simulada', 'QuotaExceededError');
        return original.call(this, key, value);
      };
    }
  });
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'guided');
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v46-migrated'))).toBeNull();
  await page.getByRole('button', { name: /Modo de leitura atual: Guiado/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'technical');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('observatorio-v46-language-mode'))).toBe('technical');
  await page.evaluate(() => sessionStorage.setItem('allow-migration-retry', 'true'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'technical');
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v46-migrated'))).toBe('true');
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v46-language-mode'))).toBe('technical');
});

test('aplicativo abre quando o armazenamento do navegador está bloqueado', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = function() { throw new DOMException('Bloqueado', 'SecurityError'); };
    Storage.prototype.setItem = function() { throw new DOMException('Bloqueado', 'SecurityError'); };
  });
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Buscar no observatório' }).first()).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'summary');
});

test('progresso v46 e chaves preservadas sobrevivem à recarga offline', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'O teste de service worker offline já é coberto em Chromium; migração online roda nos demais motores.');
  test.setTimeout(60000);
  await page.addInitScript(() => {
    if (sessionStorage.getItem('offline-migration-seeded')) return;
    localStorage.setItem('observatorio-v45-language-mode', 'guided');
    localStorage.setItem('observatorio-v45-quiz-best-scores', '[40,0,0,0,0]');
    sessionStorage.setItem('offline-migration-seeded', 'true');
  });
  await page.goto('./#aprendizado-guiado');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await page.locator('#aprendizado-guiado').getByRole('button', { name: 'Ir ao resumo' }).click();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Buscar no observatório' }).first()).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v46-guided-learning-visited'))).toBe('["valor"]');
  expect(await page.evaluate(() => localStorage.getItem('observatorio-v45-quiz-best-scores'))).toBe('[40,0,0,0,0]');
  await context.setOffline(false);
});

