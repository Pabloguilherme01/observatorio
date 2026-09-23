import { test, expect } from '@playwright/test';

test.describe('UX mobile · leitura simples, técnica e Eleitoral 360', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main[data-app-ready="true"]');
  });

  test('não há overflow horizontal e a navegação inferior cabe no viewport', async ({ page }) => {
    const result = await page.evaluate(() => ({
      width: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
    }));

    expect(result.documentWidth).toBeLessThanOrEqual(result.width + 1);
    expect(result.bodyWidth).toBeLessThanOrEqual(result.width + 1);

    const nav = page.locator('.mobile-bottom-nav');
    await expect(nav).toBeVisible();
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(result.width - 8);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(result.width + 1);
    }

    await expect(nav.locator('button')).toHaveCount(5);
  });

  test('modo simples reduz a densidade dos cards e modo técnico expande os dados', async ({ page }) => {
    await page.getByRole('button', { name: 'Leitura simples' }).click();
    await page.locator('#eleitoral360').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const cards = page.getByTestId('candidate-card');
    await expect(cards).toHaveCount(7);
    await expect(cards.first()).toContainText('Instagram informado');

    const excluded = cards.filter({
      hasText: /ANDRÉ DO PREMIUM|PABIO MOSSORÓ|WILDE CAMBÃO/i,
    });
    await expect(excluded).toHaveCount(0);
    await expect(cards.first().getByText('Patrimônio declarado', { exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Detalhes técnicos' }).click();
    await expect(cards.first().getByText('Patrimônio declarado', { exact: true })).toBeVisible();
    await expect(cards.first().getByText('SQ_CANDIDATO', { exact: true })).toBeVisible();
  });

  test('as fotos dos candidatos têm fallback acessível e os links sociais não bloqueiam a leitura', async ({ page }) => {
    await page.locator('#eleitoral360').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const cards = page.getByTestId('candidate-card');
    await expect(cards).toHaveCount(7);

    for (let index = 0; index < 7; index += 1) {
      const card = cards.nth(index);
      await expect(card.locator('img[alt^="Foto oficial"]').or(card.locator('[aria-label^="Foto indisponível"]'))).toHaveCount(1);
    }

    const instagramLinks = cards.locator('a[aria-label^="Instagram informado no registro"]');
    await expect(instagramLinks).toHaveCount(6);
    await expect(cards.filter({ hasText: 'Instagram não informado no registro' })).toHaveCount(1);
  });

  test('rodapé expõe o Instagram do projeto', async ({ page }) => {
    const link = page.getByRole('link', { name: '@pablo.builds.ia' });
    await link.scrollIntoViewIfNeeded();
    await expect(link).toHaveAttribute('href', /instagram\.com\/pablo\.builds\.ia/);
  });
});
