const { test, expect } = require('@playwright/test');

test('BugBank - homepage load and screenshot', async ({ page }, testInfo) => {
  await page.goto('https://bugbank.netlify.app');

  // Valid URL (regex avoids trailing slash issues):
  await expect(page).toHaveURL(/bugbank\.netlify\.app/);

  // Page rendered:
  await expect(page.locator('body')).toBeVisible();

  // Save screenshot as test artifact:
  await page.screenshot({
    path: testInfo.outputPath('homepage.png'),
    fullPage: true,
  });
});