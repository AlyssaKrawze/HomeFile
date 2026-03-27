import { test, expect } from '@playwright/test';

test('login flow redirects to dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.locator('#email').fill(process.env.TEST_USER_EMAIL!);
  await page.locator('#password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'My Homes' })).toBeVisible();
});
