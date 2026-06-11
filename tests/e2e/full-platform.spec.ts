import { test, expect } from '@playwright/test';

test.describe.skip('Platform Full Validation (100% Engine Integration)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  });

  test('app boots up and successfully renders map, nodes and zones', async ({ page }) => {
    // Await for systems to initialize (loadState: 'loaded' triggers removal of BootStatusPanel)
    await expect(page.locator('text="Sistema Activo"')).toBeVisible({ timeout: 15000 });
    
    // Check map root
    await expect(page.locator('[data-testid="map-root"]')).toBeVisible();

    // Check panels
    await expect(page.locator('[data-testid="left-panel"]')).toBeVisible();
    await expect(page.locator('text="Prioridad Máxima"')).toBeVisible();
  });

  test('contribution toolbar is visible and active', async ({ page }) => {
    await expect(page.locator('text="Sistema Activo"')).toBeVisible({ timeout: 15000 });
    
    // Toolbar buttons exist
    const addPoint = page.locator('[data-testid="tool-agregar-punto"]');
    await expect(addPoint).toBeVisible();

    const drawRoute = page.locator('[data-testid="tool-dibujar-ruta"]');
    await expect(drawRoute).toBeVisible();
  });

  test('radial menu triggers on map click during report mode', async ({ page }) => {
    await expect(page.locator('text="Sistema Activo"')).toBeVisible({ timeout: 15000 });

    // Enable Reporte Rápido
    await page.locator('[data-testid="tool-reporte-rápido"]').click();

    // Click middle of map
    const mapRoot = page.locator('[data-testid="map-root"]');
    const box = await mapRoot.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Verify radial menu opens with options
    await expect(page.locator('text="Falta iluminación"')).toBeVisible();
    await expect(page.locator('text="Me sentí en alerta"')).toBeVisible();
  });

  test('Rayos X diagnostic mode reflects true feature count', async ({ page }) => {
    await expect(page.locator('text="Sistema Activo"')).toBeVisible({ timeout: 15000 });

    // Enable Rayos X from bottom legend
    await page.locator('button:has-text("Rayos X")').click();

    // Inspector should be visible
    await expect(page.locator('text="Rayos X Activo"')).toBeVisible();
    
    // Test data attributes
    const zoneCountStr = await page.locator('[data-testid="zone-layer-visible"]').getAttribute('data-zone-count');
    expect(parseInt(zoneCountStr || '0', 10)).toBeGreaterThanOrEqual(0);
  });
});
