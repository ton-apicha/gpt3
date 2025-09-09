import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/api/auth/signin?callbackUrl=%2Fchat");
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/chat(\/\w+)?/);
}

test("full flow: login -> new chat -> select model -> ask -> receive", async ({ page }) => {
  await login(page);

  // ensure redirected into a chat id
  await page.goto("/chat");
  await page.waitForURL(/\/chat\/\w+/);

  // Select model (first available)
  const modelButton = page.getByRole('button').filter({ hasText: /Select model|GPT|Llama|Model/i }).first();
  await modelButton.click().catch(() => {});
  // pick first option in dropdown if visible
  const firstOption = page.locator('div[role="menu"] button, [class*="absolute"] button').first();
  await firstOption.click().catch(() => {});

  // Ask a question
  await page.fill('textarea[name="content"]', 'สวัสดี ทดสอบระบบโต้ตอบแบบสตรีม ช่วยตอบกลับมาหนึ่งประโยค');
  await page.keyboard.press('Enter');

  // Wait streaming start then completion
  await expect(page.locator('[data-testid="streaming"]')).toBeVisible({ timeout: 20_000 });

  // Wait until we have at least one assistant message rendered
  await expect(page.locator('[data-testid="msg-assistant"]').last()).toBeVisible({ timeout: 120_000 });
});


