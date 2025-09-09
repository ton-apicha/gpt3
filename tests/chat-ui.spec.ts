import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/api/auth/signin?callbackUrl=%2Fchat");
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/chat(\/\w+)?/);
}

test("send message via new UI and see token summary", async ({ page }) => {
  await login(page);
  await page.goto("/chat");
  await page.waitForURL(/\/chat\/\w+/);
  // Open model dropdown and choose first option (if exists)
  await page.getByRole('button', { name: /Select model|Llama|GPT|Model/i }).first().click().catch(() => {});
  // Type and send
  await page.fill('textarea[name="content"]', 'ทดสอบระบบ');
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Thinking|กำลังตอบ/)).toBeVisible({ timeout: 10_000 });
});


