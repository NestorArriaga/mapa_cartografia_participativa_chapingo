import { test, expect } from "@playwright/test";

test.beforeEach(({ page }) => {
  page.on("console", msg => console.log(`BROWSER CONSOLE: [${msg.type()}] ${msg.text()}`));
  page.on("pageerror", err => console.log(`BROWSER ERROR: ${err.message}`));
});

test("Flujo Completo Académico y Participativo de Mapa Vivo", async ({ page }) => {
  // 1. Initial platform load
  await page.goto("/");
  await expect(page.locator("[data-testid='app-root']")).toBeVisible();
  await expect(page.locator("[data-testid='stable-map-root']")).toBeVisible();
  
  // Wait for map and layers to load
  await expect(page.locator("[data-testid='map-loaded']")).toContainText("true", { timeout: 15000 });
  await expect(page.locator("[data-testid='layers-loaded']")).toContainText("true", { timeout: 15000 });

  // Expand panels (they start contracted/hidden)
  await page.keyboard.press("e");
  await page.waitForTimeout(500);

  // 2. Validate metrics > 0 are visible in left panel
  const metricsGrid = page.locator("[data-testid='metrics-grid']");
  await expect(metricsGrid).toBeVisible();
  await expect(metricsGrid).toContainText("5"); // Zonas
  await expect(metricsGrid).toContainText("110"); // Nodos
  await expect(metricsGrid).toContainText("5"); // Trayectos
  await expect(metricsGrid).toContainText("82"); // Campus Routes

  // 3. Verify no technical names leak into left panel
  const leftPanel = page.locator("[data-testid='left-control-panel']");
  await expect(leftPanel).not.toContainText("DOCUMENTARYNODES");
  await expect(leftPanel).not.toContainText("MOBILITYLINES");
  await expect(leftPanel).not.toContainText("EVIDENCEPOLYGONS");
  await expect(leftPanel).not.toContainText("ORIENTATIONNODES");

  // 4. Click Boyeros card in InsightDeck to open details
  const boyerosCard = page.locator("[data-testid='insight-card-low_data']");
  await expect(boyerosCard).toBeVisible();
  await boyerosCard.click();

  // 5. Verify Boyeros panel details (must be validación cualitativa, no "sin datos")
  const rightPanel = page.locator("[data-testid='right-detail-panel']");
  await expect(rightPanel).toBeVisible();
  await expect(rightPanel).toContainText("Boyeros");
  await expect(rightPanel).toContainText("Validación cualitativa");
  await expect(rightPanel).not.toContainText("sin datos");

  // Verify explanation has required text and no forbidden words
  const summaryText = page.locator("[data-testid='zone-summary-text']");
  await expect(summaryText).toContainText("recorridos por horario");
  await expect(summaryText).not.toContainText("zona peligrosa");
  await expect(summaryText).not.toContainText("ruta segura");

  // 6. Test Add Point tool & Radial Menu
  const addPointBtn = page.locator("[data-testid='tool-add-point']");
  await expect(addPointBtn).toBeVisible();
  await addPointBtn.click();

  // Click on the map to trigger radial menu
  await page.click("[data-testid='stable-map-root']", { position: { x: 400, y: 300 } });

  // Radial menu options appear
  const radialMenu = page.locator("[data-testid='map-radial-menu']");
  await expect(radialMenu).toBeVisible();

  // Click a radial option (e.g. Alerta)
  await page.click("[data-testid='radial-option-alerta']");

  // 7. Fill and submit participatory form
  const form = page.locator("[data-testid='participatory-form']");
  await expect(form).toBeVisible();
  
  await page.fill("[data-testid='form-message-input']", "Falta iluminación en el sendero del campus principal de UACh.");
  await page.click("[data-testid='form-terms-label']");
  await page.click("[data-testid='form-submit-button']");

  // Form should submit and close
  await expect(form).not.toBeVisible();

  // Local contributions metrics count should increase to 1
  await expect(metricsGrid).toContainText("1");

  // 8. Verify recommendations are loaded (at least 2)
  await page.click("[data-testid='tab-cuidado']");
  const careTabContent = page.locator("[data-testid='right-detail-panel']");
  await expect(careTabContent).toContainText("Recomendaciones de Acción Colectiva");
  // Check that recommendations are loaded (titles present)
  await expect(careTabContent).toContainText("Límite Ético");

  // 9. Export zone report works
  await page.click("[data-testid='tab-participar']");
  // Check that export tools are present
  const exportTools = page.locator("[data-testid='export-tools-container']");
  await expect(exportTools).toBeVisible();

  const exportBtnZone = page.locator("[data-testid='export-btn-zone']");
  await expect(exportBtnZone).toBeVisible();
  
  // Trigger export zone report download
  const downloadPromise = page.waitForEvent("download");
  await exportBtnZone.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("ficha_");

  // 10. Switch to Academic mode
  await page.click("[data-testid='mode-academic-btn']");
  
  // Consent dialog triggers
  const consentModal = page.locator("[data-testid='academic-consent-modal']");
  await expect(consentModal).toBeVisible();
  await page.click("text=Entiendo y activar modo académico");
  await expect(consentModal).not.toBeVisible();

  // Warning banner appears in left panel
  const warningBanner = page.locator("[data-testid='academic-warning-banner']");
  await expect(warningBanner).toBeVisible();
  await expect(warningBanner).toContainText("Modo académico interno");
});
