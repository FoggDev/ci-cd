import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display user dashboard with metrics', async ({ page }) => {
    await expect(page.locator('[data-testid="dashboard-title"]'))
      .toContainText('Dashboard');

    const metricsCards = page.locator('[data-testid="metric-card"]');
    await expect(metricsCards).toHaveCount(4);

    await expect(metricsCards.first())
      .toContainText(/\d+/);
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.click('[data-testid="nav-settings"]');
    await page.waitForURL('**/settings');

    await expect(page.locator('h1'))
      .toContainText('Settings');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api/metrics', route =>
      route.fulfill({ status: 500 })
    );

    await page.reload();

    await expect(page.locator('[data-testid="error-message"]'))
      .toBeVisible();
  });
});
