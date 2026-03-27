import { test, expect } from '@playwright/test';

test('unlock password vault with PIN', async ({ page }) => {
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

  // Extract home ID from URL and navigate to vault
  const homeUrl = page.url();
  const homeId = homeUrl.match(/\/dashboard\/homes\/([^/]+)/)?.[1];
  await page.goto(`/dashboard/homes/${homeId}/vault`);

  // Vault should show lock screen — either "Set Your Vault PIN" or "Vault Locked"
  const lockScreen = page.getByText(/Set Your Vault PIN|Vault Locked/);
  await expect(lockScreen).toBeVisible({ timeout: 10000 });

  // Enter PIN digits (4 password inputs)
  const pinInputs = page.locator('input[type="password"][inputmode="numeric"]');
  const pinCount = await pinInputs.count();

  if (pinCount === 4) {
    // Fill each PIN digit
    await pinInputs.nth(0).fill('1');
    await pinInputs.nth(1).fill('2');
    await pinInputs.nth(2).fill('3');
    await pinInputs.nth(3).fill('4');

    // Click unlock/set button
    const unlockBtn = page.getByRole('button', { name: /Unlock Vault|Set PIN/ });
    await unlockBtn.click();
  } else {
    // Fallback: use password mode
    const passwordToggle = page.getByText('Use password instead');
    if (await passwordToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passwordToggle.click();
    }
    await page.getByPlaceholder('Account password').fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: 'Unlock Vault' }).click();
  }

  // Verify vault unlocked — should show entry count or "No entries yet" or "Add Entry" button
  await expect(
    page.getByText(/entries|No entries yet|Add Entry/).first()
  ).toBeVisible({ timeout: 10000 });
});
