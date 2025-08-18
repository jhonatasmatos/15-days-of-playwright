import { test, expect } from "@playwright/test";

test.describe("Register account", () => {
  test("Create a account with balance successfully", async ({ page }) => {
    // Navigate to home page
    await page.goto("https://bugbank.netlify.app");

    // Check if I am in the home page
    await expect(page).toHaveURL(/bugbank\.netlify\.app/);

    // Check if page has the text
    await expect(page.locator("h1")).toHaveText(
      "O banco com bugs e falhas do seu jeito"
    );

    // I will click on register button to navigate to register page
    await page.locator("text=Registrar").click();

    // Check if there is 'Cadastrar' button if yes I am in the register page
    await expect(page.getByRole("button", { name: "Cadastrar" })).toBeVisible();

    // Lets fill the form with some information
    await page
      .locator(".card__register")
      .getByPlaceholder("Informe seu nome")
      .fill("John Doe");

    await page
      .locator(".card__register")
      .getByPlaceholder("Informe seu e-mail")
      .fill("johndoe@example.com");

    await page
      .locator(".card__register")
      .getByPlaceholder("Informe sua senha")
      .fill("password123");

    await page
      .locator(".card__register")
      .getByPlaceholder("Informe a confirmação da senha")
      .fill("password123");

    // Select option true to initiate an account with balance
    await page.locator("#toggleAddBalance").click();

    // Click in register button
    await page.locator("text=Cadastrar").click();

    // Check if account was created with balance
    await expect(page.locator("#modalText")).toContainText(
      "foi criada com sucesso"
    );
  });

  test("Create a account without balance successfully", async ({ page }) => {
    // Navigate to home page
    await page.goto("https://bugbank.netlify.app");

    // Check if I am in the home page
    await expect(page).toHaveURL(/bugbank\.netlify\.app/);

    // Check if page has the text
    await expect(page.locator("h1")).toHaveText(
      "O banco com bugs e falhas do seu jeito"
    );

    // I will click on register button to navigate to register page
    await page.locator("text=Registrar").click();

    // Check if there is 'Cadastrar' button if yes I am in the register page
    await expect(page.getByRole("button", { name: "Cadastrar" })).toBeVisible();

    // Lets fill the form with some information
    await page
      .locator(".card__register")
      .getByPlaceholder("Informe seu nome")
      .fill("John Doe");

    await page
      .locator(".card__register")
      .getByPlaceholder("Informe seu e-mail")
      .fill("johndoe@example.com");

    await page
      .locator(".card__register")
      .getByPlaceholder("Informe sua senha")
      .fill("password123");

    await page
      .locator(".card__register")
      .getByPlaceholder("Informe a confirmação da senha")
      .fill("password123");

    // Click in register button
    await page.locator("text=Cadastrar").click();

    // Check if account was created with balance
    await expect(page.locator("#modalText")).toContainText(
      "foi criada com sucesso"
    );
  });
});
