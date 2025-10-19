// web/src/e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test('homepage loads and shows hero', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/GameSnap X-Ray/i);
  await expect(page.getByRole('heading', { name: /gameSnap x-ray/i })).toBeVisible();
});
