import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill(process.env.TEST_USER_EMAIL!);
  await page.locator('#password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  // Dismiss onboarding modal so it doesn't block smoke tests
  await page.evaluate(() =>
    localStorage.setItem('homefile_onboarding_seen', 'true')
  );

  await page.context().storageState({ path: 'tests/.auth/user.json' });
});
