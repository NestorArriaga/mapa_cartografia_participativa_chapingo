import { test, expect } from "@playwright/test";

test.beforeEach(({ page }) => {
  page.on("console", msg => console.log(`BROWSER CONSOLE: [${msg.type()}] ${msg.text()}`));
  page.on("pageerror", err => console.log(`BROWSER ERROR: ${err.message}`));
});

test("la app no queda en blanco", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-testid='app-root']")).toBeVisible();
  await expect(page.locator("[data-testid='fatal-error-panel']")).toHaveCount(0);
});

test("el mapa base carga", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-testid='stable-map-root']")).toBeVisible();
  await expect(page.locator("[data-testid='map-loaded']")).toContainText("true", { timeout: 15000 });
});

test("las capas cargan o reportan error sin crashear", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-testid='layers-loaded']")).toBeVisible({ timeout: 15000 });
});
