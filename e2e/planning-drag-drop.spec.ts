import { test, expect } from '@playwright/test';

test.describe('Planning Page Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to planning page
    await page.goto('/planning/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('should display planning page UI elements', async ({ page }) => {
    // Check for main heading
    await expect(page.locator('h1:has-text("Task Planning")')).toBeVisible();

    // Check for view mode toggle
    await expect(page.locator('button:has-text("Day")')).toBeVisible();
    await expect(page.locator('button:has-text("Week")')).toBeVisible();

    // Check for distribution strategy section
    await expect(page.locator('text=Distribution Strategy')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/planning-page-ui.png', fullPage: true });
  });

  test('should navigate between dates', async ({ page }) => {
    // Get current date text
    const dateText = await page.locator('h2.text-xl').textContent();
    expect(dateText).toBeTruthy();
    
    // Take initial screenshot
    await page.screenshot({ path: 'e2e/screenshots/planning-date-before.png' });
  });

  test('should toggle view modes', async ({ page }) => {
    // Day view should be selected by default
    const dayButton = page.locator('button:has-text("Day")');
    const weekButton = page.locator('button:has-text("Week")');

    await expect(dayButton).toHaveClass(/bg-white|shadow/);

    // Click week view
    await weekButton.click();
    await page.waitForTimeout(300);

    // Week view should now be selected
    await expect(weekButton).toHaveClass(/bg-white|shadow/);
  });

  test('should change distribution strategy', async ({ page }) => {
    // Select front-loaded strategy
    await page.locator('text=Front-loaded').click();
    await page.waitForTimeout(300);

    // Check that frontload radio is selected
    const frontloadRadio = page.locator('input[value="frontload"]');
    await expect(frontloadRadio).toBeChecked();

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/planning-strategy-selected.png', fullPage: true });
  });

  test('should display empty state when no segments', async ({ page }) => {
    // Should show empty state message
    await expect(page.locator('text=No segments planned for this day')).toBeVisible();
    await expect(page.locator('text=Select a task and click "Distribute Selected Task"')).toBeVisible();
  });

  test('should display stats correctly', async ({ page }) => {
    // Check stats panel
    await expect(page.locator('text=Today\'s Plan')).toBeVisible();
    await expect(page.locator('text=Total Time')).toBeVisible();
    await expect(page.locator('text=Sessions')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();

    // With no segments, should show 0h 0m
    await expect(page.locator('text=0h 0m').or(page.locator('text=0h'))).toBeVisible();
  });
});
