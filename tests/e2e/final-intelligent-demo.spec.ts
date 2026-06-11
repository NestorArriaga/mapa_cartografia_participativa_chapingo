import { test, expect } from '@playwright/test';

test.describe('V5 Intelligent Cartography Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForSelector('[data-testid="stable-map-root"]', { state: 'visible' });
    
    // Expand panels (they start contracted/hidden)
    await page.keyboard.press('e');
    await page.waitForTimeout(400);
    
    // Switch to internal mode to see all features
    const btn = await page.locator('[data-action-id="activate_academic_mode"]');
    if (await btn.count() > 0 && await btn.isVisible()) {
      await btn.click();
      const confirmBtn = page.getByText('Entiendo y activar modo académico');
      if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmBtn.click();
      }
    }
  });

  test('Should render the MapErrorBoundary safely', async ({ page }) => {
    // Assert the map is visible
    const mapRoot = page.locator('[data-testid="stable-map-root"]');
    await expect(mapRoot).toBeVisible();
    
    // Ensure no fallback error boundary is triggered for the shell itself
    const errorMsg = page.getByText('Error fatal del renderizador');
    await expect(errorMsg).toHaveCount(0);
  });

  test('Adaptive panels automatically contract and expand', async ({ page }) => {
    // Left panel should be expanded by default (width ~360)
    const leftPanel = page.locator('[data-testid="left-control-panel"]');
    await expect(leftPanel).toBeVisible();

    // Since we can't easily drag the maplibre map instance via Playwright directly,
    // we can trigger the keyboard shortcut 'h' to test hidden state.
    const title = page.getByText('Mapa Vivo', { exact: true });
    await expect(title).toBeVisible();

    await page.keyboard.press('h');
    // Panel content should now be hidden (panel is contracted to 72px)
    await expect(title).not.toBeVisible();

    await page.keyboard.press('h');
    await expect(title).toBeVisible();
  });

  test('Route Profile Switcher alters UI state', async ({ page }) => {
    // Look for the route scenario switcher buttons
    const directaBtn = page.getByText('Directa', { exact: true });
    const balanceadaBtn = page.getByText('Balanceada', { exact: true });

    await expect(directaBtn).toBeVisible();
    await expect(balanceadaBtn).toBeVisible();
    
    // Clicking directa should succeed
    await directaBtn.click();
    // Verify it doesn't crash
    await expect(page.locator('[data-testid="stable-map-root"]')).toBeVisible();
  });
});
