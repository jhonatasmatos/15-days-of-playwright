import { test, expect } from "@playwright/test";

test.describe("Authentication Management Demo", () => {
  test("Demonstrate storageState usage - Complete authentication workflow", async ({
    browser,
  }) => {
    // 1. First-time UI login (only once) - Method 1 from article
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");

    // Wait for login to complete - robust waiting
    await expect(page.locator(".title")).toHaveText("Products", {
      timeout: 10000,
    });

    // 2. Capture authentication state - CORE CONCEPT from article
    const storageState = await context.storageState();

    // 3. Create new context with saved authentication - REUSE pattern
    const authenticatedContext = await browser.newContext({ storageState });
    const authPage = await authenticatedContext.newPage();

    // 4. Navigate directly to protected page - NO UI LOGIN REQUIRED
    await authPage.goto("https://www.saucedemo.com/inventory.html");
    await expect(authPage.locator(".title")).toHaveText("Products");

    // 5. Interact with application while authenticated
    await authPage
      .locator(".inventory_item:first-child .btn_inventory")
      .click();
    await expect(authPage.locator(".shopping_cart_badge")).toHaveText("1");

    // 6. Demonstrate multiple user sessions - Multiple Roles pattern
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto("https://www.saucedemo.com/");
    await page2.fill("#user-name", "problem_user");
    await page2.fill("#password", "secret_sauce");
    await page2.click("#login-button");
    await expect(page2.locator(".title")).toHaveText("Products");

    const storageState2 = await context2.storageState();
    const authContext2 = await browser.newContext({
      storageState: storageState2,
    });
    const authPage2 = await authContext2.newPage();
    await authPage2.goto("https://www.saucedemo.com/inventory.html");
    await expect(authPage2.locator(".title")).toHaveText("Products");

    // Cleanup
    await context.close();
    await authenticatedContext.close();
    await context2.close();
    await authContext2.close();
  });

  test("Compare different user experiences with separate authentication states", async ({
    browser,
  }) => {
    // Standard user session - Real-world Scenario 2 from article
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto("https://www.saucedemo.com/");
    await page1.fill("#user-name", "standard_user");
    await page1.fill("#password", "secret_sauce");
    await page1.click("#login-button");
    await expect(page1.locator(".title")).toHaveText("Products");

    // Problem user session - Different user type testing
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto("https://www.saucedemo.com/");
    await page2.fill("#user-name", "problem_user");
    await page2.fill("#password", "secret_sauce");
    await page2.click("#login-button");
    await expect(page2.locator(".title")).toHaveText("Products");

    // Both users interact simultaneously - Multiple Sessions scenario
    await page1.locator(".inventory_item:first-child .btn_inventory").click();
    await page2.locator(".inventory_item:first-child .btn_inventory").click();

    // Verify independent shopping cart states
    await expect(page1.locator(".shopping_cart_badge")).toHaveText("1");
    await expect(page2.locator(".shopping_cart_badge")).toHaveText("1");

    await context1.close();
    await context2.close();
  });
});
