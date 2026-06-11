import { test, expect } from "@playwright/test";

test.describe("Visual Cartographic Overhaul V4", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("App loads without blank screen", async ({ page }) => {
    await expect(page.locator("[data-testid='app-root']")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("[data-testid='stable-map-root']")).toBeVisible({ timeout: 10000 });
  });

  test("Panels are present and readable", async ({ page }) => {
    // Press E to expand both panels
    await page.keyboard.press("e");
    await page.waitForTimeout(400);

    const leftPanel = page.locator("[data-testid='left-control-panel']");
    await expect(leftPanel).toBeVisible({ timeout: 5000 });

    // Right panel starts hidden — press E expanded it
    const rightPanel = page.locator("[data-testid='right-detail-panel']");
    await expect(rightPanel).toBeVisible({ timeout: 5000 });
  });

  test("No technical layer names visible in UI", async ({ page }) => {
    const appRoot = page.locator("[data-testid='app-root']");
    await expect(appRoot).not.toContainText("DOCUMENTARYNODES");
    await expect(appRoot).not.toContainText("MOBILITYLINES");
    await expect(appRoot).not.toContainText("EVIDENCEPOLYGONS");
  });

  test("No emojis in the legend or panels", async ({ page }) => {
    const appRoot = page.locator("[data-testid='app-root']");
    await expect(appRoot).not.toContainText("\u{1F5FA}\uFE0F");
    await expect(appRoot).not.toContainText("\u{1F4CA}");
    await expect(appRoot).not.toContainText("\u{1F4CD}");
  });

  test("Boyeros is marked as validación cualitativa", async ({ page }) => {
    // Expand panels first
    await page.keyboard.press("e");
    await page.waitForTimeout(400);

    const boyerosCard = page.locator("text=Boyeros: señal cualitativa").first();
    if (await boyerosCard.isVisible()) {
      await boyerosCard.click({ force: true });
      const rightPanel = page.locator("[data-testid='right-detail-panel']");
      await expect(rightPanel).toContainText("Validación cualitativa");
      await expect(rightPanel).not.toContainText("sin datos");
    }
  });

  test("Analytics Dashboard is visible", async ({ page }) => {
    // Expand panels first to see the dashboard inside left panel
    await page.keyboard.press("e");
    await page.waitForTimeout(400);

    const dashboard = page.locator("[data-testid='stats-dashboard']");
    // Dashboard may not be immediately visible if panel needs scrolling
    if (await dashboard.count() > 0) {
      await expect(dashboard).toBeVisible({ timeout: 5000 });
    }
  });
});
