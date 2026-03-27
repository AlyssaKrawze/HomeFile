import { test, expect } from '@playwright/test';

test('generate home alerts', async ({ page }) => {
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

  // Navigate to alerts page
  const homeUrl = page.url();
  const homeId = homeUrl.match(/\/dashboard\/homes\/([^/]+)/)?.[1];
  await page.goto(`/dashboard/homes/${homeId}/alerts`);

  await expect(page.getByRole('heading', { name: 'Home Alerts' })).toBeVisible({ timeout: 10000 });

  // Click "Generate Alerts" if present (may already have alerts cached)
  const generateBtn = page.getByRole('button', { name: 'Generate Alerts' });
  if (await generateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await generateBtn.click();

    // Wait for loading to finish
    await expect(page.getByText(/Generating alerts/)).toBeHidden({ timeout: 30000 });
  }

  // Verify alert cards loaded — look for urgency badges or alert titles
  await expect(
    page.getByText(/Urgent|Action needed|Tip/).first()
  ).toBeVisible({ timeout: 10000 });
});
