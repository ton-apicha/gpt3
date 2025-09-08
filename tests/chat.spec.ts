import { test, expect } from "@playwright/test";

test("/chat redirects to /chat/{id}", async ({ page }) => {
	await page.goto("/chat");
	await page.waitForURL(/\/chat\/\w+/);
	expect(page.url()).toMatch(/\/chat\/\w+/);
});

test("Streaming NDJSON shows buffer", async ({ page }) => {
	await page.goto("/chat");
	await page.waitForURL(/\/chat\/\w+/);
	await page.fill("textarea[name=content]", "สวัสดี");
	await page.keyboard.press("Control+Enter");
	await expect(page.getByText(/tokens:/)).toBeVisible({ timeout: 20_000 });
});
