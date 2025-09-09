import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
	await page.goto("/api/auth/signin?callbackUrl=%2Fchat");
	await page.fill('input[name="email"]', 'admin@example.com');
	await page.fill('input[name="password"]', 'admin123');
	await page.click('button[type="submit"]');
	await page.waitForURL(/\/chat(\/\w+)?/);
}

test("/chat redirects to /chat/{id}", async ({ page }) => {
	await login(page);
	await page.goto("/chat");
	await page.waitForURL(/\/chat\/\w+/);
	expect(page.url()).toMatch(/\/chat\/\w+/);
});

test("Streaming NDJSON shows buffer", async ({ page }) => {
	await login(page);
	await page.goto("/chat");
	await page.waitForURL(/\/chat\/\w+/);
	await page.fill("textarea[name=content]", "สวัสดี");
	await page.keyboard.press("Control+Enter");
	await expect(page.getByText(/tokens:/)).toBeVisible({ timeout: 30_000 });
});
