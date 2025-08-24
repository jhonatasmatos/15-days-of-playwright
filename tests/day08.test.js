export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async waitForTimeout(delay) {
    await this.page.waitForTimeout(delay);
  }

  async getTitle() {
    return await this.page.title();
  }

  async takeScreenshot(name) {
    return await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
    });
  }
}

export class HeaderComponent {
  constructor(page) {
    this.page = page;
    this.cartIcon = page.locator(".shopping_cart_link");
    this.cartBadge = page.locator(".shopping_cart_badge");
    this.menuButton = page.locator("#react-burger-menu-btn");
  }

  async getCartItemCount() {
    const count = await this.cartBadge.textContent();
    return parseInt(count || "0");
  }

  async goToCart() {
    await this.cartIcon.click();
  }

  async openMenu() {
    await this.menuButton.click();
  }
}

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.locator("#user-name");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.locator("#login-button");
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async navigate() {
    await this.page.goto("https://www.saucedemo.com/");
    await this.page.waitForLoadState("networkidle");
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.waitForTimeout(500); // Small delay for UI update
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async isErrorMessageVisible() {
    return await this.errorMessage.isVisible();
  }
}

export class InventoryPage extends BasePage {
  constructor(page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.productItems = page.locator(".inventory_item");
    this.productNames = page.locator(".inventory_item_name");
    this.sortDropdown = page.locator(".product_sort_container");
  }

  async addItemToCart(itemIndex = 0) {
    await this.productItems.nth(itemIndex).locator(".btn_inventory").click();
    return await this.header.getCartItemCount();
  }

  async removeItemFromCart(itemIndex = 0) {
    await this.productItems.nth(itemIndex).locator(".btn_inventory").click();
    return await this.header.getCartItemCount();
  }

  async getProductName(itemIndex = 0) {
    return await this.productNames.nth(itemIndex).textContent();
  }

  async getProductPrice(itemIndex = 0) {
    const priceText = await this.productItems
      .nth(itemIndex)
      .locator(".inventory_item_price")
      .textContent();
    return parseFloat(priceText.replace("$", ""));
  }

  async sortProducts(sortOption) {
    await this.sortDropdown.selectOption(sortOption);
    await this.waitForTimeout(300); // Wait for sort to complete
  }

  async getProductCount() {
    return await this.productItems.count();
  }
}

export class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.cartItems = page.locator(".cart_item");
    this.itemNames = page.locator(".inventory_item_name");
    this.checkoutButton = page.locator("#checkout");
    this.continueShoppingButton = page.locator("#continue-shopping");
  }

  async getItemCount() {
    return await this.cartItems.count();
  }

  async getItemNames() {
    const names = [];
    const count = await this.itemNames.count();

    for (let i = 0; i < count; i++) {
      names.push(await this.itemNames.nth(i).textContent());
    }

    return names;
  }

  async removeItem(itemIndex = 0) {
    await this.cartItems.nth(itemIndex).locator(".cart_button").click();
    return await this.getItemCount();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async getItemPrice(itemIndex = 0) {
    const priceText = await this.cartItems
      .nth(itemIndex)
      .locator(".inventory_item_price")
      .textContent();
    return parseFloat(priceText.replace("$", ""));
  }
}

import { test, expect } from "@playwright/test";

test.describe("Page Object Model Demo", () => {
  let loginPage;
  let inventoryPage;
  let cartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
  });

  test("Complete purchase flow with POM", async ({ page }) => {
    // Login
    await loginPage.navigate();
    await loginPage.login("standard_user", "secret_sauce");

    // Verify successful login
    await expect(page.locator(".title")).toHaveText("Products");
    await expect(inventoryPage.productItems.first()).toBeVisible();

    // Add items to cart
    const cartCount1 = await inventoryPage.addItemToCart(0);
    expect(cartCount1).toBe(1);

    const cartCount2 = await inventoryPage.addItemToCart(1);
    expect(cartCount2).toBe(2);

    // Verify cart count in header
    const headerCount = await inventoryPage.header.getCartItemCount();
    expect(headerCount).toBe(2);

    // Go to cart
    await inventoryPage.header.goToCart();
    await expect(page).toHaveURL(/.*cart/);

    // Verify cart items
    const itemCount = await cartPage.getItemCount();
    expect(itemCount).toBe(2);

    const itemNames = await cartPage.getItemNames();
    expect(itemNames).toHaveLength(2);
    expect(itemNames[0]).toBeTruthy();
    expect(itemNames[1]).toBeTruthy();

    // Verify item prices
    const price1 = await cartPage.getItemPrice(0);
    const price2 = await cartPage.getItemPrice(1);
    expect(price1).toBeGreaterThan(0);
    expect(price2).toBeGreaterThan(0);

    // Proceed to checkout
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one/);
  });

  test("Failed login shows error message", async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login("invalid_user", "wrong_password");

    // Verify error message
    const errorVisible = await loginPage.isErrorMessageVisible();
    expect(errorVisible).toBe(true);

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain("Username and password do not match");
  });

  test("Add and remove items from cart", async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login("standard_user", "secret_sauce");

    // Add items
    await inventoryPage.addItemToCart(0);
    await inventoryPage.addItemToCart(1);

    let headerCount = await inventoryPage.header.getCartItemCount();
    expect(headerCount).toBe(2);

    // Go to cart and remove one item
    await inventoryPage.header.goToCart();
    await cartPage.removeItem(0);

    let cartCount = await cartPage.getItemCount();
    expect(cartCount).toBe(1);

    // Continue shopping and add another item
    await cartPage.continueShopping();
    await inventoryPage.addItemToCart(2);

    headerCount = await inventoryPage.header.getCartItemCount();
    expect(headerCount).toBe(2);
  });

  test("Sort products functionality", async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login("standard_user", "secret_sauce");

    // Get initial product order
    const firstProductBefore = await inventoryPage.getProductName(0);

    // Sort by price low to high
    await inventoryPage.sortProducts("lohi");
    await page.waitForTimeout(500); // Wait for sort to complete

    const firstProductAfter = await inventoryPage.getProductName(0);

    // Products should be different after sorting
    expect(firstProductBefore).not.toBe(firstProductAfter);

    // Verify we still have all products
    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });
});
