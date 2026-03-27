import { test, expect } from '@playwright/test';

test('add an item to a room', async ({ page }) => {
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

  // Room cards use div with onClick — find first h3 inside a room card and click it
  // The rooms section has cards with class "rounded-2xl border" containing h3 room names
  await page.locator('.rounded-2xl.border h3').first().click();
  await expect(page).toHaveURL(/\/rooms\/.+/, { timeout: 10000 });

  // Open add-item modal
  await page.getByRole('button', { name: 'Add Item', exact: true }).click();

  // Fill required fields
  await page.getByPlaceholder('e.g. Refrigerator, HVAC System, Water Heater').fill('Test Appliance');
  await page.locator('form').getByRole('combobox').selectOption('Other');

  // Submit and wait for modal to close + page refresh
  await page.locator('button[type="submit"]', { hasText: 'Add Item' }).click();
  await expect(page.getByPlaceholder('e.g. Refrigerator, HVAC System, Water Heater')).toBeHidden({ timeout: 10000 });

  // Assert item shows up after server component refresh
  await expect(page.getByText('Test Appliance').first()).toBeVisible({ timeout: 15000 });
});
