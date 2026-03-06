import { test, expect } from '@playwright/test';

test.describe('Sidebar Navigation', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@safenet.org');
        await page.fill('input[type="password"]', 'Password123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
    });

    test('should navigate to all pages via sidebar', async ({ page }) => {
        const navItems = [
            { name: 'Grants', href: '/grants' },
            { name: 'Budget', href: '/budget' },
            { name: 'Compliance', href: '/compliance' },
            { name: 'Reporting', href: '/reporting' },
            { name: 'Dashboard', href: '/dashboard' },
        ];

        for (const item of navItems) {
            // Find the link in the sidebar by its text
            const link = page.locator(`nav >> text=${item.name}`);
            await expect(link).toBeVisible();
            await link.click();
            await page.waitForURL(item.href);
            await expect(page).toHaveURL(item.href);
        }
    });

    test('should trigger New Grant toast from sidebar', async ({ page }) => {
        await page.click('button:has-text("New Grant")');
        await expect(page.locator('text=New Grant creation triggered')).toBeVisible();
    });
});
