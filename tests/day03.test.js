import { test, expect } from "@playwright/test";

test.describe("Register account", () => {
  test("Create a account with balance successfully", async ({ page }) => {
    // Navigate to home page + wait for page state (article: Page States)
    await page.goto("https://bugbank.netlify.app");
    await page.waitForLoadState("networkidle");

    // Confirm correct URL (article: waitForURL for navigation/redirects)
    await page.waitForURL(/bugbank\.netlify\.app/);

    // Check if page has the text (assertion after load)
    await expect(page.locator("h1")).toHaveText(
      "O banco com bugs e falhas do seu jeito"
    );

    // Open register card (dynamic UI)
    await page.getByText("Registrar").click();

    // card de registro é dinâmico → usar waitFor (article: waitFor for dynamic elements)
    const registerCard = page.locator(".card__register");
    await registerCard.waitFor();

    // Verificar botão "Cadastrar" visível (auto-wait do expect cobre estabilidade)
    await expect(page.getByRole("button", { name: "Cadastrar" })).toBeVisible();

    // Fill form (sem waits redundantes antes de click/fill)
    await registerCard.getByPlaceholder("Informe seu nome").fill("John Doe");
    await registerCard
      .getByPlaceholder("Informe seu e-mail")
      .fill("johndoe@example.com");
    await registerCard
      .getByPlaceholder("Informe sua senha")
      .fill("password123");
    await registerCard
      .getByPlaceholder("Informe a confirmação da senha")
      .fill("password123");

    // Toggle saldo inicial (auto-wait do click)
    await page.locator("#toggleAddBalance").click();

    // Submit
    await page.getByText("Cadastrar").click();

    // Modal é dinâmico → usar waitFor antes do expect
    const modalText = page.locator("#modalText");
    await modalText.waitFor();
    await expect(modalText).toContainText("foi criada com sucesso");
  });

  test("Create a account without balance successfully", async ({ page }) => {
    await page.goto("https://bugbank.netlify.app");
    await page.waitForLoadState("networkidle");
    await page.waitForURL(/bugbank\.netlify\.app/);

    await expect(page.locator("h1")).toHaveText(
      "O banco com bugs e falhas do seu jeito"
    );

    await page.getByText("Registrar").click();

    const registerCard = page.locator(".card__register");
    await registerCard.waitFor();
    await expect(page.getByRole("button", { name: "Cadastrar" })).toBeVisible();

    await registerCard.getByPlaceholder("Informe seu nome").fill("John Doe");
    await registerCard
      .getByPlaceholder("Informe seu e-mail")
      .fill("johndoe@example.com");
    await registerCard
      .getByPlaceholder("Informe sua senha")
      .fill("password123");
    await registerCard
      .getByPlaceholder("Informe a confirmação da senha")
      .fill("password123");

    await page.getByText("Cadastrar").click();

    const modalText = page.locator("#modalText");
    await modalText.waitFor();
    await expect(modalText).toContainText("foi criada com sucesso");
  });
});
