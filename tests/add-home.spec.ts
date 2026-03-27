import { test, expect } from '@playwright/test';

test('add a home from dashboard', async ({ page }) => {
  await page.goto('/dashboard');

  // Dismiss onboarding modal if present
  const onboarding = page.locator('.fixed.inset-0.z-50');
  if (await onboarding.isVisible({ timeout: 2000 }).catch(() => false)) {
    await page.keyboard.press('Escape');
    await onboarding.waitFor({ state: 'hidden' });
  }

  // Click the prominent "Add Home" button (not the sidebar icon)
  await page.getByRole('button', { name: 'Add Home', exact: true }).click();

  await page.getByPlaceholder('e.g. Main House, Beach Cottage').fill('Test Home');
  await page.getByPlaceholder('123 Main St').fill('100 Test Ave');
  await page.getByPlaceholder('Austin').fill('Testville');
  await page.getByPlaceholder('TX').fill('CA');
  await page.getByPlaceholder('78701').fill('90210');

  // Submit
  await page.locator('button[type="submit"]', { hasText: 'Add Home' }).click();

  await expect(page).toHaveURL(/\/dashboard\/homes\/.+/, { timeout: 10000 });
  await expect(page.getByRole('heading', { name: 'Test Home' })).toBeVisible();
});
