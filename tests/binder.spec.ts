import { test, expect } from '@playwright/test';

test('home binder triggers PDF download', async ({ page }) => {
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

  // Navigate to binder page
  const homeUrl = page.url();
  const homeId = homeUrl.match(/\/dashboard\/homes\/([^/]+)/)?.[1];
  await page.goto(`/dashboard/homes/${homeId}/binder`);

  await expect(page.getByRole('heading', { name: 'Home Binder' })).toBeVisible({ timeout: 10000 });

  // Click "Download PDF" and verify download is triggered
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download PDF' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});
