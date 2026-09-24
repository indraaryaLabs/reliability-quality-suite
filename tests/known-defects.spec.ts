import { expect, test } from '@playwright/test';

test('QA-DEFECT-01 API rejects a poll interval below the UI minimum', async ({ request }) => {
  // The form specifies min=10 and its submit handler also checks interval < 10.
  // Marking this as an expected failure keeps the regression visible in every run.
  test.fail(true, 'Known product defect: the API accepts an interval below 10 seconds.');

  const response = await request.post('http://127.0.0.1:3001/api/services', {
    data: {
      name: `QA below-minimum interval ${Date.now()}`,
      url: 'http://127.0.0.1:3999/health',
      ipAddress: '127.0.0.1',
      category: 'api',
      interval: 9,
    },
  });

  try {
    expect(response.status()).toBe(400);
  } finally {
    if (response.status() === 201) {
      const created = await response.json();
      await request.delete(`http://127.0.0.1:3001/api/services/${created.id}`);
    }
  }
});

test('QA-DEFECT-02 service name field is programmatically associated with its label', async ({ page }) => {
  test.fail(true, 'Known product defect: the visible Service Name label has no for/id association.');
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Service Spec' }).click();
  await expect(page.getByLabel('Service Name *')).toBeVisible({ timeout: 1_000 });
});
