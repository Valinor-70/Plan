import { test, expect, type ConsoleMessage } from '@playwright/test';

test.describe('Dashboard Console Errors', () => {
  let consoleErrors: ConsoleMessage[] = [];
  let consoleWarnings: ConsoleMessage[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture console errors and warnings
    consoleErrors = [];
    consoleWarnings = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      
      // Ignore external resource errors (fonts, CDN, analytics, etc.)
      if (text.includes('Failed to load resource') && text.includes('ERR_NAME_NOT_RESOLVED')) {
        return;
      }
      
      // Ignore network errors for external resources
      if (text.includes('net::ERR')) {
        return;
      }
      
      if (msg.type() === 'error') {
        consoleErrors.push(msg);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg);
      }
    });

    // Capture uncaught exceptions
    page.on('pageerror', (error) => {
      console.error('Uncaught exception:', error);
    });
  });

  test('should load dashboard without console errors', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard/index.html');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait a bit for any delayed errors
    await page.waitForTimeout(2000);

    // Take a screenshot
    await page.screenshot({ path: 'e2e/screenshots/dashboard-loaded.png', fullPage: true });

    // Check for console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:');
      for (const error of consoleErrors) {
        console.error(`  - ${error.text()}`);
      }
    }

    // Check for console warnings
    if (consoleWarnings.length > 0) {
      console.warn('Console warnings detected:');
      for (const warning of consoleWarnings) {
        console.warn(`  - ${warning.text()}`);
      }
    }

    // Verify page title
    await expect(page).toHaveTitle(/Dashboard/);

    // Verify main content is visible
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    // Fail test if there are console errors
    expect(consoleErrors.length, 
      `Found ${consoleErrors.length} console errors: ${consoleErrors.map(e => e.text()).join(', ')}`
    ).toBe(0);

    // Warn but don't fail on warnings for now
    if (consoleWarnings.length > 0) {
      console.warn(`Warning: Found ${consoleWarnings.length} console warnings`);
    }
  });

  test('should load landing page without console errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/landing-page.png', fullPage: true });

    if (consoleErrors.length > 0) {
      console.error('Console errors on landing page:');
      for (const error of consoleErrors) {
        console.error(`  - ${error.text()}`);
      }
    }

    expect(consoleErrors.length, 
      `Found ${consoleErrors.length} console errors: ${consoleErrors.map(e => e.text()).join(', ')}`
    ).toBe(0);
  });

  test('should load planning page without console errors', async ({ page }) => {
    await page.goto('/planning/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/planning-page.png', fullPage: true });

    if (consoleErrors.length > 0) {
      console.error('Console errors on planning page:');
      for (const error of consoleErrors) {
        console.error(`  - ${error.text()}`);
      }
    }

    await expect(page.locator('h1:has-text("Task Planning")')).toBeVisible();

    expect(consoleErrors.length, 
      `Found ${consoleErrors.length} console errors: ${consoleErrors.map(e => e.text()).join(', ')}`
    ).toBe(0);
  });
});
