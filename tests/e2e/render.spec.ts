import { test, expect } from '@playwright/test';

test.describe('Platform Rendering - Final Experience', () => {
  test('should load app, map canvas and panels without eternal loading', async ({ page }) => {
    // Navigate to local server using config base URL
    await page.goto('/', { waitUntil: 'networkidle' });

    // Ensure map container exists
    const mapRoot = page.locator('[data-testid="stable-map-root"]');
    await expect(mapRoot).toBeVisible();

    // Verify left control panel rendered successfully
    const leftPanel = page.locator('[data-testid="left-control-panel"]');
    await expect(leftPanel).toBeVisible({ timeout: 10000 });
  });
});
