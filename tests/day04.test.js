import { test, expect } from "@playwright/test";

test.describe("BugBank Registration - Frontend Validation Tests", () => {
  // Cleanup after each test: remove all route handlers
  // Best practice (avoid leaking mocks between tests)
  test.afterEach(async ({ page }) => {
    await page.unrouteAll();
  });

  test("Successful registration flow with valid data (mock fulfill)", async ({
    page,
  }) => {
    // Mock a successful API response for registration (happy path)
    // Using route.fulfill() to control the response and avoid real network calls
    await page.route("**/api/register", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "A conta 525-8 foi criada com sucesso",
          accountNumber: "525-8",
        }),
      });
    });

    await page.goto("https://bugbank.netlify.app");
    await page.getByText("Registrar").click();

    const registerCard = page.locator(".card__register");
    await registerCard.waitFor(); // Smart wait for dynamic UI

    // Fill form with valid data
    await registerCard.getByPlaceholder("Informe seu nome").fill("Maria Silva");
    await registerCard
      .getByPlaceholder("Informe seu e-mail")
      .fill("maria.silva@example.com");
    await registerCard
      .getByPlaceholder("Informe sua senha")
      .fill("SenhaSegura123!");
    await registerCard
      .getByPlaceholder("Informe a confirmação da senha")
      .fill("SenhaSegura123!");

    // Enable initial balance option
    await page.locator("#toggleAddBalance").click();

    // Submit the form
    await page.getByText("Cadastrar").click();

    // Assert: success modal appears (result of our mocked fulfill response)
    const modalText = page.locator("#modalText");
    await modalText.waitFor(); // Dynamic element
    await expect(modalText).toContainText("foi criada com sucesso");
  });

  test("Should display validation error when name field is empty (no API call)", async ({
    page,
  }) => {
    // Spy: if API is called here, frontend validation has failed
    let apiRequestAttempted = 0;
    await page.route("**/api/register", async (route) => {
      apiRequestAttempted++;
      await route.abort(); // Abort instead of fulfill (we don't expect this call)
    });

    await page.goto("https://bugbank.netlify.app");
    await page.getByText("Registrar").click();

    const registerCard = page.locator(".card__register");
    await registerCard.waitFor();

    // Leave "name" field empty, fill other fields
    await registerCard
      .getByPlaceholder("Informe seu e-mail")
      .fill("test@example.com");
    await registerCard
      .getByPlaceholder("Informe sua senha")
      .fill("password123");
    await registerCard
      .getByPlaceholder("Informe a confirmação da senha")
      .fill("password123");

    await page.getByText("Cadastrar").click();

    // Assert validation error appears in UI (no fixed timeout used)
    await expect(page.locator("text=Nome não pode ser vazio.")).toBeVisible();

    // Assert API was never called (frontend blocked submission)
    expect(apiRequestAttempted).toBe(0);
  });

  test("Should validate email format and show appropriate error (no API call)", async ({
    page,
  }) => {
    let apiRequestAttempted = 0;
    await page.route("**/api/register", async (route) => {
      apiRequestAttempted++;
      await route.abort();
    });

    await page.goto("https://bugbank.netlify.app");
    await page.getByText("Registrar").click();

    const registerCard = page.locator(".card__register");
    await registerCard.waitFor();

    // Invalid email format
    await registerCard.getByPlaceholder("Informe seu nome").fill("João Silva");
    await registerCard
      .getByPlaceholder("Informe seu e-mail")
      .fill("email-invalido"); // invalid format
    await registerCard
      .getByPlaceholder("Informe sua senha")
      .fill("password123");
    await registerCard
      .getByPlaceholder("Informe a confirmação da senha")
      .fill("password123");

    await page.getByText("Cadastrar").click();

    // Assert error message shown
    await expect(page.locator("text=Formato inválido")).toBeVisible();
    // API must not be triggered
    expect(apiRequestAttempted).toBe(0);
  });

  test("Should enforce password confirmation matching (no API call)", async ({
    page,
  }) => {
    let apiRequestAttempted = 0;
    await page.route("**/api/register", async (route) => {
      apiRequestAttempted++;
      await route.abort();
    });

    await page.goto("https://bugbank.netlify.app");
    await page.getByText("Registrar").click();

    const registerCard = page.locator(".card__register");
    await registerCard.waitFor();

    // Passwords mismatch
    await registerCard.getByPlaceholder("Informe seu nome").fill("Ana Costa");
    await registerCard
      .getByPlaceholder("Informe seu e-mail")
      .fill("ana@example.com");
    await registerCard.getByPlaceholder("Informe sua senha").fill("senha123");
    await registerCard
      .getByPlaceholder("Informe a confirmação da senha")
      .fill("senhaDIFERENTE");

    await page.getByText("Cadastrar").click();

    // Assert mismatch error message
    await expect(page.locator("text=As senhas não são iguais.")).toBeVisible();
    // Assert no API call occurred
    expect(apiRequestAttempted).toBe(0);
  });

  test("Password visibility toggle functionality", async ({ page }) => {
    await page.goto("https://bugbank.netlify.app");
    await page.getByText("Registrar").click();

    const registerCard = page.locator(".card__register");
    await registerCard.waitFor();

    const passwordInput = registerCard.getByPlaceholder("Informe sua senha");
    await passwordInput.fill("minhaSenhaSecreta");

    // By default, password input should be hidden
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Locate the toggle button (based on SVG or aria-label attributes)
    const toggleButton = page
      .locator("button:has(svg), [aria-label*=senha], [aria-label*=password]")
      .first();

    if (await toggleButton.isVisible()) {
      // Toggle to show password in plain text
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "text");

      // Toggle back to hide password again
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "password");
    }
  });
});
