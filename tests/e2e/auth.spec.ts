import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'wrong@example.com');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Wait for supabase error or UI feedback
        const errorMessage = page.locator('text=Invalid login credentials');
        await expect(errorMessage).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        await page.goto('/login');

        // Using the seeded admin account
        await page.fill('input[type="email"]', 'admin@safenet.org');
        await page.fill('input[type="password"]', 'Password123!');
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('h1')).toContainText('Financial Overview');
    });
});
