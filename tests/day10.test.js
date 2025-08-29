import { test, expect } from "@playwright/test";

// ==================== BASIC API PATTERNS ====================
test.describe("API Testing Fundamentals", () => {
  test("Basic GET request with JSONPlaceholder", async ({ request }) => {
    const response = await request.get(
      "https://jsonplaceholder.typicode.com/users/1"
    );
    expect(response.status()).toBe(200);

    const userData = await response.json();
    expect(userData.name).toBe("Leanne Graham");
    expect(userData.email).toBe("Sincere@april.biz");
  });

  test("POST request to create data", async ({ request }) => {
    const response = await request.post(
      "https://jsonplaceholder.typicode.com/posts",
      {
        data: {
          title: "Playwright Test",
          body: "Test post content",
          userId: 1,
        },
      }
    );

    expect(response.status()).toBe(201);
    const postData = await response.json();
    expect(postData.id).toBeDefined();
  });
});

// ==================== HYBRID TESTING ====================
test.describe("Hybrid API + UI Testing", () => {
  test("API setup with UI validation", async ({ page, request }) => {
    // API: Create test data
    const apiResponse = await request.post(
      "https://jsonplaceholder.typicode.com/posts",
      {
        data: {
          title: "Hybrid Test Post",
          body: "Created via API for UI test",
          userId: 1,
        },
      }
    );

    expect(apiResponse.status()).toBe(201);

    // UI: Navigate to a page that might display posts
    await page.goto("https://jsonplaceholder.typicode.com");

    // More meaningful validation - check for content that relates to posts
    await expect(page.locator("body")).toContainText("JSONPlaceholder");
    await expect(page.locator('text="/posts"')).toBeVisible(); // Check that posts endpoint is mentioned

    // Additional check: navigate to the guide section that explains posts
    await page.click("text=Guide");
    await expect(page.locator("body")).toContainText("/posts/1");
  });
});

// ==================== AUTHENTICATION & ERRORS ====================
test.describe("Authentication & Error Handling", () => {
  test("API authentication with tokens", async ({ request }) => {
    const authResponse = await request.post("https://reqres.in/api/login", {
      data: {
        email: "eve.holt@reqres.in",
        password: "cityslicka",
      },
    });

    expect(authResponse.status()).toBe(200);
    const { token } = await authResponse.json();
    expect(token).toBeDefined();
  });

  test("Error response handling", async ({ request }) => {
    const response = await request.post("https://reqres.in/api/register", {
      data: { email: "test@example.com" }, // Missing password
    });

    expect(response.status()).toBe(400);
    const errorData = await response.json();
    expect(errorData.error).toBe("Missing password");
  });
});

// ==================== BEST PRACTICES ====================
test.describe("API Testing Best Practices", () => {
  test("Response schema validation", async ({ request }) => {
    const response = await request.get(
      "https://jsonplaceholder.typicode.com/users/1"
    );
    const user = await response.json();

    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
      })
    );
  });

  test("Different content types handling", async ({ request }) => {
    // JSON
    const jsonResponse = await request.get(
      "https://jsonplaceholder.typicode.com/users/1"
    );
    expect(jsonResponse.headers()["content-type"]).toContain(
      "application/json"
    );

    // HTML
    const htmlResponse = await request.get("https://httpbin.org/html");
    expect(htmlResponse.headers()["content-type"]).toContain("text/html");
  });
});

// ==================== REAL-WORLD SCENARIO ====================
test.describe("Complete Real-World Scenario", () => {
  test("Full CRUD operation with hybrid validation", async ({ request }) => {
    // CREATE
    const createResponse = await request.post(
      "https://jsonplaceholder.typicode.com/posts",
      {
        data: {
          title: "Playwright CRUD Test",
          body: "Testing complete CRUD operations",
          userId: 1,
        },
      }
    );

    expect(createResponse.status()).toBe(201);
    const createdPost = await createResponse.json();

    // READ & VALIDATE
    const readResponse = await request.get(
      `https://jsonplaceholder.typicode.com/posts/${createdPost.id}`
    );
    expect(readResponse.status()).toBe(200);

    const readPost = await readResponse.json();
    expect(readPost.title).toBe("Playwright CRUD Test");
  });
});
