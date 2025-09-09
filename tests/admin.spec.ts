import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/api/auth/signin?callbackUrl=%2Fadmin");
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin(\/.+)?/);
}

test("Admin models page can list and create model", async ({ page }) => {
  await login(page);
  await page.goto("/admin/models");
  await expect(page.getByRole('heading', { name: 'Models' })).toBeVisible();

  const id = `test-model-${Date.now()}`;
  await page.fill('input[placeholder="llama 3.1 8B"], input[placeholder="llama3.1:8b"]', id).catch(() => {});
  const idInput = await page.locator('input').first();
  await idInput.fill(id);
  await page.click('text=สร้างโมเดล');
  await expect(page.getByText(id)).toBeVisible({ timeout: 5000 });
});


