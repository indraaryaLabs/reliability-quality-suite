import { expect, test } from '@playwright/test';

const api = 'http://127.0.0.1:3001';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toContainText('CONNECTED TO HEARTBEAT DAEMON');
});

test('QA-UI-01 search and category filtering show the matching and empty states', async ({ page }) => {
  await page.locator('#search-input').fill('Auth-Broker Service');
  await expect(page.locator('[id^="service-card-"]').filter({ hasText: 'Auth-Broker Service' })).toBeVisible();
  await page.locator('#btn-category-api').click();
  await expect(page.getByText('No Monitored Specs Found')).toBeVisible();
  await page.locator('#btn-category-ALL').click();
  await expect(page.locator('[id^="service-card-"]').filter({ hasText: 'Auth-Broker Service' })).toBeVisible();
});

test('QA-UI-02 add form rejects missing required values and short poll intervals', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Service Spec' }).click();
  await page.getByRole('button', { name: 'Save Inventory' }).click();
  await expect(page.getByText('Service name is required')).toBeVisible();

  await page.locator('#input-service-name').fill('QA invalid fixture');
  await page.locator('#input-service-url').fill('http://127.0.0.1:3999/health');
  await page.locator('#input-service-ip').fill('127.0.0.1');
  await page.locator('#input-service-interval').fill('5');
  await page.getByRole('button', { name: 'Save Inventory' }).click();
  // Native HTML min validation prevents submit before the custom message runs.
  expect(await page.locator('#input-service-interval').evaluate(
    element => (element as HTMLInputElement).validity.rangeUnderflow,
  )).toBe(true);
  await expect(page.locator('#service-inventory-modal')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
});

test('QA-UI-03 user can add, edit, and delete an isolated service', async ({ page, request }) => {
  const name = `QA UI ${Date.now()}`;
  let createdId: string | undefined;

  try {
    await page.getByRole('button', { name: 'Add Service Spec' }).click();
    await page.locator('#input-service-name').fill(name);
    await page.locator('#input-service-url').fill('http://127.0.0.1:3999/health');
    await page.locator('#input-service-ip').fill('127.0.0.1');
    await page.getByRole('button', { name: 'Save Inventory' }).click();

    const card = page.locator('[id^="service-card-"]').filter({ hasText: name });
    await expect(card).toBeVisible();
    const services = await (await request.get(`${api}/api/services`)).json();
    createdId = services.find((item: { id: string; name: string }) => item.name === name)?.id;
    expect(createdId).toBeTruthy();

    await card.getByTitle('Edit Inventory Spec').click();
    const changedName = `${name} edited`;
    await page.locator('#input-service-name').fill(changedName);
    await page.getByRole('button', { name: 'Save Inventory' }).click();
    const editedCard = page.locator('[id^="service-card-"]').filter({ hasText: changedName });
    await expect(editedCard).toBeVisible();

    page.once('dialog', dialog => dialog.accept());
    await editedCard.getByTitle('Delete Service Spec').click();
    await expect(editedCard).toHaveCount(0);
    const remaining = await (await request.get(`${api}/api/services`)).json();
    expect(remaining.some((item: { id: string }) => item.id === createdId)).toBe(false);
  } finally {
    if (createdId) await request.delete(`${api}/api/services/${createdId}`);
  }
});

test('QA-UI-04 dashboard retains usable inventory when streaming is unavailable', async ({ page }) => {
  await page.route('**/api/stream', route => route.abort());
  await page.reload();
  await expect(page.locator('body')).toContainText('OFFLINE IN-MEMORY SIMULATION');
  await page.locator('#search-input').fill('Auth-Broker Service');
  await expect(page.locator('[id^="service-card-"]').filter({ hasText: 'Auth-Broker Service' })).toBeVisible();
});
