// Starter UI test for the local inspector. Extend it to cover every tool, error paths,
// and timeouts. Selectors use data-testid attributes from ui/index.html.
import { test, expect } from '@playwright/test';

test('an example fills the arguments and runs the tool', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('tool-get_book').click();
  await page.getByTestId('example-dune').click();
  await expect(page.getByTestId('args')).toHaveValue(/"id": "b1"/);

  await page.getByTestId('run').click();
  await expect(page.getByTestId('status')).toContainText('OK');
  await expect(page.getByTestId('response')).toContainText('Frank Herbert');
  await expect(page.getByTestId('history-entry')).toHaveCount(1);
});

test('selecting a tool loads its first example', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('tool-add_numbers').click();
  await expect(page.getByTestId('args')).toHaveValue(/"numbers": \[\s*1,\s*2,\s*3\s*\]/);
  await expect(page.getByTestId('example-small-list')).toHaveAttribute('aria-pressed', 'true');
});

test('invalid JSON disables Run', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('args').fill('{"message": ');
  await expect(page.getByTestId('args-error')).toBeVisible();
  await expect(page.getByTestId('run')).toBeDisabled();
});
