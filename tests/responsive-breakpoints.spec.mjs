import { test, expect } from 'playwright/test';

test.describe('responsividade entre breakpoints', () => {
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 412, height: 915 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    test(`não cria overflow em ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('./');
      await expect(page.locator('#main-content')).toBeVisible();

      const layout = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        clipped: [...document.querySelectorAll('main h1, main h2, main h3, main p, main a, main button')]
          .filter(element => {
            const style = getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden') return false;
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.right > window.innerWidth + 1;
          }).length,
      }));

      expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport + 1);
      expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewport + 1);
      expect(layout.clipped).toBe(0);

      for (const mode of ['summary', 'simple', 'guided', 'technical']) {
        await page.evaluate(nextMode => {
          document.documentElement.dataset.languageMode = nextMode;
        }, mode);
        const modeLayout = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
          mainWidth: document.getElementById('main-content')?.scrollWidth ?? 0,
        }));
        expect(modeLayout.documentWidth).toBeLessThanOrEqual(modeLayout.viewport + 1);
        expect(modeLayout.mainWidth).toBeLessThanOrEqual(modeLayout.viewport + 1);
      }
    });
  }
});


test.describe('header mobile e modos de leitura', () => {
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 375, height: 812 },
    { width: 430, height: 932 },
  ]) {
    test(`troca modos no topo sem cortar controles em ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('./');
      await expect(page.locator('#main-content')).toBeVisible();

      const headerFit = await page.evaluate(() => {
        const header = document.querySelector('.site-header-inner');
        const controls = [...document.querySelectorAll('.site-header-actions button')]
          .map(element => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0,
            };
          })
          .filter(control => control.visible);
        const rect = header?.getBoundingClientRect();
        return {
          headerLeft: rect ? Math.round(rect.left) : -1,
          headerRight: rect ? Math.round(rect.right) : -1,
          viewport: window.innerWidth,
          controls,
        };
      });

      expect(headerFit.headerLeft).toBeGreaterThanOrEqual(-1);
      expect(headerFit.headerRight).toBeLessThanOrEqual(headerFit.viewport + 1);
      expect(headerFit.controls.length).toBeGreaterThanOrEqual(3);
      for (const control of headerFit.controls) {
        expect(control.left).toBeGreaterThanOrEqual(-1);
        expect(control.right).toBeLessThanOrEqual(headerFit.viewport + 1);
        expect(control.width).toBeGreaterThanOrEqual(40);
        expect(control.height).toBeGreaterThanOrEqual(40);
      }

      const shortcut = page.locator('.site-mode-shortcut');
      await expect(shortcut).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'summary');

      await shortcut.click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'simple');
      await shortcut.click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'guided');
      await shortcut.click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'technical');
      await shortcut.click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'summary');

      const toolsButton = page.locator('.site-tools-button');
      await toolsButton.click();
      await expect(page.locator('#mobile-tools')).toBeVisible();

      const modeButtons = page.locator('#mobile-tools .language-toggle-options button');
      await expect(modeButtons).toHaveCount(4);

      await modeButtons.nth(1).click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'simple');
      await modeButtons.nth(2).click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'guided');
      await modeButtons.nth(3).click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'technical');
      await modeButtons.nth(0).click();
      await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'summary');

      const panelMetrics = await page.evaluate(() => {
        const panel = document.querySelector('#mobile-tools');
        const rect = panel?.getBoundingClientRect();
        return rect ? {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          bottom: Math.round(rect.bottom),
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          scrollHeight: panel.scrollHeight,
          clientHeight: panel.clientHeight,
        } : null;
      });

      expect(panelMetrics).not.toBeNull();
      expect(panelMetrics.left).toBeGreaterThanOrEqual(-1);
      expect(panelMetrics.right).toBeLessThanOrEqual(panelMetrics.viewportWidth + 1);
      expect(panelMetrics.clientHeight).toBeLessThanOrEqual(panelMetrics.viewportHeight);
      expect(panelMetrics.scrollHeight).toBeGreaterThanOrEqual(panelMetrics.clientHeight);
    });
  }
});


test.describe('aprendizado guiado no mobile', () => {
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 375, height: 812 },
    { width: 430, height: 932 },
  ]) {
    test(`trilha permanece legível e tocável em ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('./?leitura=guided#aprendizado-guiado');

      const root = page.locator('html');
      const guide = page.locator('#aprendizado-guiado');
      await expect(root).toHaveAttribute('data-language-mode', 'guided');
      await expect(guide).toBeVisible();
      await expect(guide.locator('.guided-learning-step')).toHaveCount(6);

      const layout = await guide.evaluate(section => {
        const rect = section.getBoundingClientRect();
        const steps = [...section.querySelectorAll('.guided-learning-step')].map(step => {
          const stepRect = step.getBoundingClientRect();
          return { left: stepRect.left, right: stepRect.right, height: stepRect.height };
        });
        const summary = section.querySelector('.guided-learning-glossary > summary')?.getBoundingClientRect();
        const controls = [...section.querySelectorAll('.guided-learning-footer button')].map(button => {
          const buttonRect = button.getBoundingClientRect();
          return { left: buttonRect.left, right: buttonRect.right, height: buttonRect.height };
        });
        return {
          left: rect.left,
          right: rect.right,
          viewport: window.innerWidth,
          steps,
          summaryHeight: summary?.height ?? 0,
          controls,
          documentWidth: document.documentElement.scrollWidth,
        };
      });

      expect(layout.left).toBeGreaterThanOrEqual(-1);
      expect(layout.right).toBeLessThanOrEqual(layout.viewport + 1);
      expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport + 1);
      expect(layout.summaryHeight).toBeGreaterThanOrEqual(44);
      for (const step of layout.steps) {
        expect(step.left).toBeGreaterThanOrEqual(-1);
        expect(step.right).toBeLessThanOrEqual(layout.viewport + 1);
        expect(step.height).toBeGreaterThanOrEqual(88);
      }
      for (const control of layout.controls) {
        expect(control.left).toBeGreaterThanOrEqual(-1);
        expect(control.right).toBeLessThanOrEqual(layout.viewport + 1);
        expect(control.height).toBeGreaterThanOrEqual(44);
      }

      await guide.getByText('Entenda os rótulos dos dados').click();
      await expect(guide.locator('.guided-learning-glossary')).toHaveAttribute('open', '');
      const glossaryWidth = await guide.locator('.guided-learning-glossary').evaluate(node => ({
        client: node.clientWidth,
        scroll: node.scrollWidth,
      }));
      expect(glossaryWidth.scroll).toBeLessThanOrEqual(glossaryWidth.client + 1);

      await page.locator('.site-tools-button').click();
      const modeButtons = page.locator('#mobile-tools .language-toggle-options button');
      await expect(modeButtons).toHaveCount(4);
      for (const button of await modeButtons.all()) {
        const box = await button.boundingBox();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(60);
      }
    });
  }
});


test('aprendizado guiado retoma progresso persistido e diferencia conclusão de avaliação', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('./?leitura=guided#aprendizado-guiado');

  const guide = page.locator('#aprendizado-guiado');
  await expect(guide.getByRole('button', { name: /Começar · Identifique o que o número mede/i })).toBeVisible();
  await guide.locator('.guided-learning-step').first().click();

  const storageKey = await page.evaluate(() => Object.keys(localStorage).find(key => key.endsWith('-guided-learning-visited')) ?? null);
  expect(storageKey).not.toBeNull();

  await page.goto('./?leitura=guided#aprendizado-guiado');

  await expect(guide.getByText(/Retome de onde parou: 1 de 6 etapas já foram visitadas/i)).toBeVisible();
  await expect(guide.getByRole('button', { name: /Retomar · Confira período e natureza/i })).toBeVisible();

  await page.evaluate(key => {
    if (!key) throw new Error('storage key do aprendizado guiado não encontrado');
    localStorage.setItem(key, JSON.stringify(['valor', 'referencia', 'contexto', 'utilidade', 'fonte', 'quiz']));
  }, storageKey);
  await page.reload();

  await expect(guide.getByText('Trilha percorrida')).toBeVisible();
  await expect(guide.getByText('As 6 etapas foram visitadas')).toBeVisible();
  await expect(guide.getByText(/não uma nota nem uma avaliação de conhecimento/i)).toBeVisible();
  await expect(guide.getByRole('button', { name: /Revisar trilha · etapa 1/i })).toBeVisible();

  await guide.getByRole('button', { name: /Reiniciar trilha/i }).click();
  await expect(guide.getByRole('button', { name: /Começar · Identifique o que o número mede/i })).toBeVisible();
});


test.describe('cards guiados e utilidade pública no mobile', () => {
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 375, height: 812 },
    { width: 430, height: 932 },
  ]) {
    test(`cards secundários permanecem legíveis em ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('./?leitura=guided#dashboard');

      const practiceCards = page.locator('#dashboard .dashboard-secondary-card');
      await expect(practiceCards.first()).toBeVisible();
      const practiceLayout = await practiceCards.evaluateAll(cards => cards.slice(0, 8).map(card => {
        const rect = card.getBoundingClientRect();
        const action = card.querySelector('.dashboard-card-action')?.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          height: rect.height,
          actionHeight: action?.height ?? 0,
        };
      }));

      expect(practiceLayout.length).toBeGreaterThan(0);
      for (const card of practiceLayout) {
        expect(card.left).toBeGreaterThanOrEqual(-1);
        expect(card.right).toBeLessThanOrEqual(viewport.width + 1);
        expect(card.height).toBeGreaterThanOrEqual(120);
        expect(card.actionHeight).toBeGreaterThanOrEqual(24);
      }

      await page.goto('./?leitura=guided#utilidade-publica');
      const utility = page.locator('#utilidade-publica');
      await expect(utility).toBeVisible();
      const secondaryNeeds = utility.locator('[aria-label="Mais necessidades"] button');
      await expect(secondaryNeeds).toHaveCount(2);

      const utilityLayout = await secondaryNeeds.evaluateAll(buttons => buttons.map(button => {
        const rect = button.getBoundingClientRect();
        return { left: rect.left, right: rect.right, height: rect.height };
      }));
      for (const button of utilityLayout) {
        expect(button.left).toBeGreaterThanOrEqual(-1);
        expect(button.right).toBeLessThanOrEqual(viewport.width + 1);
        expect(button.height).toBeGreaterThanOrEqual(52);
      }

      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth).toBeLessThanOrEqual(viewport.width + 1);
    });
  }
});


test('menu Mais oferece acesso direto ao aprendizado guiado no celular', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('./');
  await page.locator('#mobile-bottom-more-trigger').click();

  const menu = page.locator('#mobile-bottom-more');
  await expect(menu).toBeVisible();
  const guided = menu.getByRole('menuitem', { name: /Aprendizado guiado.*Trilha passo a passo/i });
  await expect(guided).toBeVisible();
  await guided.click();

  await expect(page.locator('html')).toHaveAttribute('data-language-mode', 'guided');
  await expect(page).toHaveURL(/#aprendizado-guiado$/);
  await expect(page.locator('#aprendizado-guiado')).toBeVisible();
  await expect(page.locator('#mobile-bottom-more')).toHaveCount(0);
  await expect(page.locator('#mobile-bottom-more-trigger')).toHaveAttribute('aria-current', 'page');
});
