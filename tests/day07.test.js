import { test, expect } from "@playwright/test";

// ==================== PART 1: BASIC HOOKS ====================
test.describe("1. Basic Test Hooks", () => {
  // This runs BEFORE each test
  test.beforeEach(async ({ page }) => {
    console.log("beforeEach: Navigating to website...");
    await page.goto("https://www.saucedemo.com/");
  });

  // This runs AFTER each test
  test.afterEach(async ({ page }) => {
    console.log("afterEach: Test finished!");
  });

  test("Login with standard user", async ({ page }) => {
    console.log("Test: Filling login form...");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");
    await expect(page.locator(".title")).toHaveText("Products");
  });

  test("Login with problem user", async ({ page }) => {
    console.log("Test: Filling login form...");
    await page.fill("#user-name", "problem_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");
    await expect(page.locator(".title")).toHaveText("Products");
  });
});

// ==================== PART 2: SIMPLE FIXTURES ====================
test.describe("2. Simple Custom Fixtures", () => {
  test("Create and use basic fixture", async ({ browser }) => {
    console.log("Creating authenticated page...");

    // Step 1: Create browser context
    const context = await browser.newContext();
    const page = await context.newPage();

    // Step 2: Do login (this is like a fixture setup)
    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");
    await expect(page.locator(".title")).toHaveText("Products");

    // Step 3: Use the authenticated page (this is what fixtures do)
    console.log("Using authenticated page...");
    await page.goto("https://www.saucedemo.com/inventory.html");
    await expect(page.locator(".title")).toHaveText("Products");

    // Step 4: Cleanup (like fixture teardown)
    await context.close();
  });
});

// ==================== PART 3: BEFOREALL HOOK ====================
test.describe("3. beforeAll Hook Example", () => {
  let sharedPage; // Variable to share between tests

  // Runs ONCE before all tests
  test.beforeAll(async ({ browser }) => {
    console.log("beforeAll: Setting up shared page...");
    const context = await browser.newContext();
    sharedPage = await context.newPage();

    // Login once for all tests
    await sharedPage.goto("https://www.saucedemo.com/");
    await sharedPage.fill("#user-name", "standard_user");
    await sharedPage.fill("#password", "secret_sauce");
    await sharedPage.click("#login-button");
    await expect(sharedPage.locator(".title")).toHaveText("Products");
  });

  // Runs ONCE after all tests
  test.afterAll(async () => {
    console.log("afterAll: Closing shared page...");
    await sharedPage.close();
  });

  test("Test 1: Use shared page", async () => {
    console.log("Test 1: Using shared authenticated page");
    await sharedPage.goto("https://www.saucedemo.com/inventory.html");
    await expect(sharedPage.locator(".title")).toHaveText("Products");
  });

  test("Test 2: Continue with same page", async () => {
    console.log("Test 2: Still using the same page");
    await sharedPage
      .locator(".inventory_item:first-child .btn_inventory")
      .click();
    await expect(sharedPage.locator(".shopping_cart_badge")).toHaveText("1");
  });
});

// ==================== PART 4: REAL FIXTURE EXAMPLE ====================
// This shows what custom fixtures look like (for reference)
const testWithAuth = test.extend({
  // This is a custom fixture called "authPage"
  authPage: async ({ browser }, use) => {
    console.log("Fixture: Setting up authenticated page...");

    const context = await browser.newContext();
    const page = await context.newPage();

    // Setup: Login
    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");
    await expect(page.locator(".title")).toHaveText("Products");

    // Pass the page to the test
    await use(page);

    // Teardown: Close context
    console.log("Fixture: Cleaning up...");
    await context.close();
  },
});

// Tests using the custom fixture
testWithAuth.describe("4. Tests With Custom Fixture", () => {
  testWithAuth("Use authPage fixture", async ({ authPage }) => {
    console.log("Test: Using authPage fixture");
    await authPage.goto("https://www.saucedemo.com/inventory.html");
    await expect(authPage.locator(".title")).toHaveText("Products");
  });

  testWithAuth("Add item with fixture", async ({ authPage }) => {
    console.log("Test: Adding item with fixture");
    await authPage
      .locator(".inventory_item:first-child .btn_inventory")
      .click();
    await expect(authPage.locator(".shopping_cart_badge")).toHaveText("1");
  });
});
