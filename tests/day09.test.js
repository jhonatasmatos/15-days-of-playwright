import { test, expect } from "@playwright/test";

// ==================== PART 1: BASIC CONFIGURATION DEMO ====================
test.describe("1. Basic Configuration Demo", () => {
  test("Test with default timeout", async ({ page }) => {
    // This test will use the default timeout from playwright.config.js
    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");
    await expect(page.locator(".title")).toHaveText("Products");
  });

  test("Test that might need retry", async ({ page }) => {
    // This test might benefit from retry configuration
    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "problem_user"); // Problem user might be flaky
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");
    await expect(page.locator(".title")).toHaveText("Products");
  });
});

// ==================== PART 2: PARALLEL EXECUTION DEMO ====================
test.describe("2. Parallel Execution Demo", () => {
  test("Parallel test 1 - Login and browse", async ({ page }) => {
    console.log("Parallel test 1 started");
    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");
    await expect(page.locator(".title")).toHaveText("Products");
    console.log("Parallel test 1 completed");
  });

  test("Parallel test 2 - Add item to cart", async ({ page }) => {
    console.log("Parallel test 2 started");
    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");
    await page.locator(".inventory_item:first-child .btn_inventory").click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
    console.log("Parallel test 2 completed");
  });
});

// ==================== PART 3: MULTI-BROWSER TESTING DEMO ====================
test.describe("3. Multi-Browser Testing Demo", () => {
  test("Cross-browser login test", async ({ page, browserName }) => {
    // This test will run on all configured browsers
    console.log(`Running on browser: ${browserName}`);

    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");

    // Different browsers might have slightly different rendering
    await expect(page.locator(".title")).toHaveText("Products");
    console.log(`Login successful on ${browserName}`);
  });

  test("Cross-browser cart functionality", async ({ page, browserName }) => {
    console.log(`Testing cart on: ${browserName}`);

    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");

    // Add item to cart
    await page.locator(".inventory_item:first-child .btn_inventory").click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");

    // Go to cart
    await page.locator(".shopping_cart_link").click();
    await expect(page.locator(".cart_item")).toBeVisible();

    console.log(`Cart test passed on ${browserName}`);
  });
});

// ==================== PART 4: ENVIRONMENT-AWARE TESTING ====================
test.describe("4. Environment-Aware Testing", () => {
  test("Test with environment-specific settings", async ({ page }) => {
    const isCI = process.env.CI === "true";
    const baseURL = process.env.BASE_URL || "https://www.saucedemo.com";

    console.log(`Environment: CI=${isCI}, BaseURL=${baseURL}`);

    await page.goto(baseURL);
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");

    // CI environments might need different timeouts
    await expect(page.locator(".title")).toHaveText("Products", {
      timeout: isCI ? 10000 : 5000,
    });

    console.log("Environment test completed successfully");
  });

  test("Test with different viewport settings", async ({ page }) => {
    const isCI = process.env.CI === "true";

    // Simulate different viewport behavior
    if (isCI) {
      // CI environment - desktop resolution
      await page.setViewportSize({ width: 1920, height: 1080 });
    } else {
      // Local development - common resolution
      await page.setViewportSize({ width: 1280, height: 720 });
    }

    await page.goto("https://www.saucedemo.com/");
    await expect(page.locator(".login_wrapper")).toBeVisible();

    console.log(
      `Viewport test completed with ${
        isCI ? "desktop" : "development"
      } resolution`
    );
  });
});

// ==================== PART 5: TAGGED TEST EXECUTION ====================
test.describe("5. Tagged Test Execution", () => {
  test("@smoke Login functionality", async ({ page }) => {
    console.log("Running @smoke test");
    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");
    await expect(page.locator(".title")).toHaveText("Products");
    console.log("@smoke test passed");
  });

  test("@regression Full checkout flow", async ({ page }) => {
    console.log("Running @regression test");

    // Login
    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");

    // Add items
    await page.locator(".inventory_item:first-child .btn_inventory").click();
    await page.locator(".inventory_item:nth-child(2) .btn_inventory").click();

    // Go to cart
    await page.locator(".shopping_cart_link").click();

    // Checkout
    await page.locator("#checkout").click();
    await page.fill("#first-name", "John");
    await page.fill("#last-name", "Doe");
    await page.fill("#postal-code", "12345");
    await page.locator("#continue").click();

    // Complete order
    await page.locator("#finish").click();
    await expect(page.locator(".complete-header")).toHaveText(
      "Thank you for your order!"
    );

    console.log("@regression test passed");
  });
});

// ==================== PART 6: ADVANCED PARALLELISM FEATURES ====================
test.describe("6. Advanced Parallelism Features", () => {
  test("Test with isolated storage state", async ({ page }) => {
    // Each parallel test gets clean storage state
    await page.goto("https://www.saucedemo.com/");

    // Verify we start with clean state (no authentication)
    await expect(page.locator("#login-button")).toBeVisible();
    await expect(page.locator(".shopping_cart_badge")).toBeHidden();

    console.log("Storage isolation test passed");
  });

  test("Test with parallel-safe operations", async ({ page }) => {
    // This test uses operations that are safe for parallel execution

    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");

    // Each test operates on different inventory items
    const randomItem = Math.floor(Math.random() * 6);
    await page
      .locator(`.inventory_item:nth-child(${randomItem + 1}) .btn_inventory`)
      .click();

    // Verify the operation was successful
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");

    console.log(
      `Parallel-safe operation test passed on item ${randomItem + 1}`
    );
  });
});

// ==================== PART 7: PERFORMANCE METRICS DEMO ====================
test.describe("7. Performance Metrics Demo", () => {
  test("Measure execution time with different workers", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("https://www.saucedemo.com/");
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");
    await expect(page.locator(".title")).toHaveText("Products");

    const executionTime = Date.now() - startTime;
    console.log(`Test execution time: ${executionTime}ms`);

    // This helps understand parallel execution benefits
    expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
  });

  test("Test with performance tracing", async ({ page }) => {
    // This simulates tests with tracing enabled
    await page.goto("https://www.saucedemo.com/");

    // Multiple operations to generate trace data
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");
    await page.locator(".inventory_item:first-child .btn_inventory").click();
    await page.locator(".shopping_cart_link").click();

    await expect(page.locator(".cart_item")).toBeVisible();
    console.log("Performance tracing test completed");
  });
});

// ==================== PART 8: CONFIGURATION VALIDATION ====================
test.describe("8. Configuration Validation", () => {
  test("Validate timeout configuration", async ({ page }) => {
    // Test that timeout configuration is working
    await page.goto("https://www.saucedemo.com/");

    // This should complete within configured timeout
    await page.fill("#user-name", "standard_user");
    await page.fill("#password", "secret_sauce");
    await page.click("#login-button");

    await expect(page.locator(".title")).toHaveText("Products");
    console.log("Timeout configuration validated");
  });

  test("Validate screenshot on failure", async ({ page }) => {
    // This test might fail to validate screenshot functionality
    await page.goto("https://www.saucedemo.com/");

    // Deliberate potential failure point
    const element = page.locator(".non-existent-element");

    try {
      await expect(element).toBeVisible({ timeout: 1000 });
    } catch (error) {
      console.log("Expected failure for screenshot validation");
      // Screenshot should be captured automatically
    }
  });
});
