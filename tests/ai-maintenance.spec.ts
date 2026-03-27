import { test, expect } from '@playwright/test';

test('generate AI maintenance suggestions for an appliance', async ({ page }) => {
  await page.goto('/dashboard');

  // Dismiss onboarding modal if present
  const onboarding = page.locator('.fixed.inset-0.z-50');
  if (await onboarding.isVisible({ timeout: 2000 }).catch(() => false)) {
    await page.keyboard.press('Escape');
    await onboarding.waitFor({ state: 'hidden' });
  }

  // Navigate to first home
  await page.locator('a.rounded-2xl[href*="/dashboard/homes/"]').first().click();
  await expect(page).toHaveURL(/\/dashboard\/homes\/.+/);

  // Navigate into the first room
  await page.locator('.rounded-2xl.border h3').first().click();
  await expect(page).toHaveURL(/\/rooms\/.+/, { timeout: 10000 });

  // Click the first appliance link
  await page.locator('a[href*="/appliances/"]').first().click();
  await expect(page).toHaveURL(/\/appliances\/.+/, { timeout: 10000 });

  // Find and click "Generate Suggestions"
  await expect(page.getByRole('heading', { name: 'AI Suggestions' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: 'Generate Suggestions' }).click();

  // Wait for loading to finish and suggestions to appear
  await expect(page.getByText('Analyzing appliance data...')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Analyzing appliance data...')).toBeHidden({ timeout: 30000 });

  // Verify suggestions appeared — look for "Add to Schedule" buttons or suggestion titles
  await expect(
    page.getByRole('button', { name: 'Add to Schedule' }).first()
  ).toBeVisible({ timeout: 10000 });
});
