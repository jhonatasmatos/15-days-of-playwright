import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("File Upload and Download Tests - Day 5 Examples", () => {
  const testDir = path.join(__dirname, "test-files");

  test.beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  test.afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  // Example 1: File Download - RELIABLE
  test("Download a file from demo site", async ({ page }) => {
    await page.goto("https://the-internet.herokuapp.com/download");

    // Use specific selector for download links
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator("a").filter({ hasText: "some-file.txt" }).click(),
    ]);

    expect(download.suggestedFilename()).toBe("some-file.txt");

    const savePath = path.join(testDir, download.suggestedFilename());
    await download.saveAs(savePath);

    expect(fs.existsSync(savePath)).toBe(true);

    const content = fs.readFileSync(savePath, "utf8");
    expect(content.length).toBeGreaterThan(0);
    console.log(`Downloaded file content: ${content.substring(0, 100)}...`);
  });

  // Example 2: Dynamic File Creation - RELIABLE
  test("Create and upload dynamic file content", async ({ page }) => {
    await page.goto("https://the-internet.herokuapp.com/upload");

    const dynamicContent = `File created at: ${new Date().toISOString()}\nTest content for dynamic file creation`;

    // Use the specific file input ID
    await page.locator("#file-upload").setInputFiles({
      name: "dynamic-file.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(dynamicContent),
    });

    await page.click("#file-submit");

    await expect(page.locator("h3")).toHaveText("File Uploaded!");
    await expect(page.locator("#uploaded-files")).toContainText(
      "dynamic-file.txt"
    );
  });

  // Example 3: File Chooser Handling - RELIABLE
  test("Handle file upload with direct input", async ({ page }) => {
    const filePath = path.join(testDir, "test-upload.txt");
    fs.writeFileSync(filePath, "Test file content for upload demonstration");

    await page.goto("https://the-internet.herokuapp.com/upload");

    // Direct upload approach
    await page.locator("#file-upload").setInputFiles(filePath);
    await page.click("#file-submit");

    await expect(page.locator("h3")).toHaveText("File Uploaded!");
    await expect(page.locator("#uploaded-files")).toContainText(
      "test-upload.txt"
    );
  });
});
