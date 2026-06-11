import { test, expect } from '@playwright/test';

test.describe.skip('Platform Interaction - Final Experience', () => {
  test('should open participatory form with geometry and save locally', async ({ page }) => {
    // Wait for map to load
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Wait for the app to finish booting
    await expect(page.locator('text="Sistema Activo"')).toBeVisible({ timeout: 15000 });

    // Click on Add Point Tool
    const addPointBtn = page.locator('[data-testid="tool-add-point"]');
    await expect(addPointBtn).toBeVisible();
    await addPointBtn.click();

    // Click on Map Center
    const mapRoot = page.locator('[data-testid="map-root"]');
    const box = await mapRoot.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Verify form opens with title
    const formTitle = page.locator('text="Aportar Experiencia"');
    await expect(formTitle).toBeVisible();
    
    // Check geometry suggestion text exists
    const geomText = page.locator('text="Has marcado una ubicación en el mapa"');
    await expect(geomText).toBeVisible();
  });
  
  test('should toggle layers and start guided tour', async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await expect(page.locator('text="Sistema Activo"')).toBeVisible({ timeout: 15000 });
    
    const toggleLayer = page.locator('text="Halos de proximidad"');
    await expect(toggleLayer).toBeVisible();
    await toggleLayer.click();
    
    const tourBtn = page.locator('button:has-text("Tour Guiado")');
    await expect(tourBtn).toBeVisible();
    await tourBtn.click();
    
    const storyTitle = page.locator('text="Observatorio Vivo"');
    await expect(storyTitle).toBeVisible();
  });
});
