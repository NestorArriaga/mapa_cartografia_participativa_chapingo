import { test, expect } from "@playwright/test";

test("real app is not blank", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await page.waitForTimeout(3000);

  // App root must be visible
  await expect(page.locator("[data-testid='app-root']")).toBeVisible();

  // Body must have real content (not just whitespace)
  const bodyText = await page.locator("body").innerText();
  expect(bodyText.trim().length).toBeGreaterThan(20);

  // #root must have children
  const rootChildren = await page.locator("#root > *").count();
  expect(rootChildren).toBeGreaterThan(0);

  // Background must not be white
  const bg = await page.locator("body").evaluate(
    (el) => getComputedStyle(el).backgroundColor
  );
  expect(bg).not.toBe("rgb(255, 255, 255)");

  // No JS errors
  expect(errors).toEqual([]);

  // Take screenshot for verification
  await page.screenshot({
    path: "docs/emergency-white-screen/real-visible-page.png",
    fullPage: true,
  });
});

test("safe mode always renders", async ({ page }) => {
  await page.goto("/?safe");
  await page.waitForTimeout(2000);

  await expect(page.locator("[data-testid='safe-app']")).toBeVisible();
  await expect(page.locator("[data-testid='safe-map-fallback']")).toBeVisible();

  // Verify text content
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).toContain("Mapa Vivo");
  expect(bodyText).toContain("Modo seguro visible");

  await page.screenshot({
    path: "docs/emergency-white-screen/safe-mode-page.png",
    fullPage: true,
  });
});

test("stable map shell renders", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator("[data-testid='stable-map-root']")
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.locator("[data-testid='map-status']")
  ).toBeVisible();

  await page.screenshot({
    path: "docs/emergency-white-screen/stable-map-page.png",
    fullPage: true,
  });
});
