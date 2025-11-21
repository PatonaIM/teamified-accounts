"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
test_1.test.describe('Payroll Components Configuration', () => {
    test_1.test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('[data-testid="email"]', 'admin@teamified.com');
        await page.fill('[data-testid="password"]', 'password123');
        await page.click('[data-testid="login-button"]');
        await (0, test_1.expect)(page).toHaveURL('/dashboard');
    });
    (0, test_1.test)('should display salary components tab in payroll configuration', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.waitForSelector('[data-testid="salary-components-tab"]');
        await (0, test_1.expect)(page.locator('[data-testid="salary-components-tab"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="salary-components-tab"]')).toContainText('Salary Components');
    });
    (0, test_1.test)('should display statutory components tab in payroll configuration', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.waitForSelector('[data-testid="statutory-components-tab"]');
        await (0, test_1.expect)(page.locator('[data-testid="statutory-components-tab"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="statutory-components-tab"]')).toContainText('Statutory Components');
    });
    (0, test_1.test)('should switch to salary components tab and show configuration interface', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="salary-components-tab"]');
        await page.waitForSelector('[data-testid="create-salary-component-button"]');
        await (0, test_1.expect)(page.locator('[data-testid="create-salary-component-button"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('text=Salary Components Configuration')).toBeVisible();
    });
    (0, test_1.test)('should switch to statutory components tab and show configuration interface', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="statutory-components-tab"]');
        await page.waitForSelector('[data-testid="create-statutory-component-button"]');
        await (0, test_1.expect)(page.locator('[data-testid="create-statutory-component-button"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('text=Statutory Components Configuration')).toBeVisible();
    });
    (0, test_1.test)('should open salary component creation form', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="salary-components-tab"]');
        await page.waitForSelector('[data-testid="create-salary-component-button"]');
        await page.click('[data-testid="create-salary-component-button"]');
        await (0, test_1.expect)(page.locator('text=Create Salary Component')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="component-name"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="component-code"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="calculation-type"]')).toBeVisible();
    });
    (0, test_1.test)('should open statutory component creation form', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="statutory-components-tab"]');
        await page.waitForSelector('[data-testid="create-statutory-component-button"]');
        await page.click('[data-testid="create-statutory-component-button"]');
        await (0, test_1.expect)(page.locator('text=Create Statutory Component')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="component-name"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="component-code"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="contribution-type"]')).toBeVisible();
    });
    (0, test_1.test)('should validate salary component form fields', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="salary-components-tab"]');
        await page.waitForSelector('[data-testid="create-salary-component-button"]');
        await page.click('[data-testid="create-salary-component-button"]');
        await page.click('[data-testid="submit-button"]');
        await (0, test_1.expect)(page.locator('text=Create Salary Component')).toBeVisible();
    });
    (0, test_1.test)('should validate statutory component form fields', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="statutory-components-tab"]');
        await page.waitForSelector('[data-testid="create-statutory-component-button"]');
        await page.click('[data-testid="create-statutory-component-button"]');
        await page.click('[data-testid="submit-button"]');
        await (0, test_1.expect)(page.locator('text=Create Statutory Component')).toBeVisible();
    });
    (0, test_1.test)('should show earnings tab in salary components', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="salary-components-tab"]');
        await page.waitForSelector('[data-testid="earnings-tab"]');
        await (0, test_1.expect)(page.locator('[data-testid="earnings-tab"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="earnings-tab"]')).toContainText('Earnings');
    });
    (0, test_1.test)('should show deductions tab in salary components', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="salary-components-tab"]');
        await page.waitForSelector('[data-testid="deductions-tab"]');
        await (0, test_1.expect)(page.locator('[data-testid="deductions-tab"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="deductions-tab"]')).toContainText('Deductions');
    });
    (0, test_1.test)('should show benefits tab in salary components', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="salary-components-tab"]');
        await page.waitForSelector('[data-testid="benefits-tab"]');
        await (0, test_1.expect)(page.locator('[data-testid="benefits-tab"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="benefits-tab"]')).toContainText('Benefits');
    });
    (0, test_1.test)('should show reimbursements tab in salary components', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="salary-components-tab"]');
        await page.waitForSelector('[data-testid="reimbursements-tab"]');
        await (0, test_1.expect)(page.locator('[data-testid="reimbursements-tab"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="reimbursements-tab"]')).toContainText('Reimbursements');
    });
    (0, test_1.test)('should show EPF tab in statutory components', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="statutory-components-tab"]');
        await page.waitForSelector('[data-testid="epf-tab"]');
        await (0, test_1.expect)(page.locator('[data-testid="epf-tab"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="epf-tab"]')).toContainText('EPF');
    });
    (0, test_1.test)('should show ESI tab in statutory components', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="statutory-components-tab"]');
        await page.waitForSelector('[data-testid="esi-tab"]');
        await (0, test_1.expect)(page.locator('[data-testid="esi-tab"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="esi-tab"]')).toContainText('ESI');
    });
    (0, test_1.test)('should show SSS tab in statutory components', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="statutory-components-tab"]');
        await page.waitForSelector('[data-testid="sss-tab"]');
        await (0, test_1.expect)(page.locator('[data-testid="sss-tab"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="sss-tab"]')).toContainText('SSS');
    });
    (0, test_1.test)('should show PhilHealth tab in statutory components', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="statutory-components-tab"]');
        await page.waitForSelector('[data-testid="philhealth-tab"]');
        await (0, test_1.expect)(page.locator('[data-testid="philhealth-tab"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="philhealth-tab"]')).toContainText('PhilHealth');
    });
    (0, test_1.test)('should show Pag-IBIG tab in statutory components', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="statutory-components-tab"]');
        await page.waitForSelector('[data-testid="pagibig-tab"]');
        await (0, test_1.expect)(page.locator('[data-testid="pagibig-tab"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="pagibig-tab"]')).toContainText('Pag-IBIG');
    });
    (0, test_1.test)('should show Superannuation tab in statutory components', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="statutory-components-tab"]');
        await page.waitForSelector('[data-testid="superannuation-tab"]');
        await (0, test_1.expect)(page.locator('[data-testid="superannuation-tab"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="superannuation-tab"]')).toContainText('Superannuation');
    });
    (0, test_1.test)('should close form dialog when cancel is clicked', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="salary-components-tab"]');
        await page.waitForSelector('[data-testid="create-salary-component-button"]');
        await page.click('[data-testid="create-salary-component-button"]');
        await page.click('text=Cancel');
        await (0, test_1.expect)(page.locator('text=Create Salary Component')).not.toBeVisible();
    });
    (0, test_1.test)('should show country selection message when no country is selected', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="salary-components-tab"]');
        await (0, test_1.expect)(page.locator('text=Please select a country to configure salary components')).toBeVisible();
    });
    (0, test_1.test)('should show country selection message for statutory components when no country is selected', async ({ page }) => {
        await page.goto('/payroll-configuration');
        await page.click('[data-testid="statutory-components-tab"]');
        await (0, test_1.expect)(page.locator('text=Please select a country to configure statutory components')).toBeVisible();
    });
});
//# sourceMappingURL=payroll-components.e2e.spec.js.map