import { test, expect } from '@playwright/test';
import path from 'path';

test('scan receipt opens room picker', async ({ page }) => {
  await page.goto('/dashboard');

  // Dismiss onboarding modal if present
  const onboarding = page.locator('.fixed.inset-0.z-50');
  if (await onboarding.isVisible({ timeout: 2000 }).catch(() => false)) {
    await page.keyboard.press('Escape');
    await onboarding.waitFor({ state: 'hidden' });
  }

  // Click the first home card in the main content grid
  await page.locator('a.rounded-2xl[href*="/dashboard/homes/"]').first().click();
  await expect(page).toHaveURL(/\/dashboard\/homes\/.+/);

  // Click scan receipt and upload a file
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Scan Receipt' }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, 'fixtures/test-receipt.png'));

  // Assert the room picker modal appears
  await expect(
    page.getByText('Where should we file this item?')
  ).toBeVisible({ timeout: 30000 });

  // Select a room and submit
  await page.locator('select').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Add to Room' }).click();

  // Success = modal closes (no toast is shown)
  await expect(
    page.getByText('Where should we file this item?')
  ).toBeHidden({ timeout: 10000 });
});
