import { expect, test } from '@playwright/test';

const api = 'http://127.0.0.1:3001';

function service(name: string) {
  return {
    name,
    url: 'http://127.0.0.1:3999/health',
    ipAddress: '127.0.0.1',
    category: 'api',
    interval: 60,
    description: 'Isolated QA suite fixture',
  };
}

test('QA-API-01 inventory returns a list with the documented service fields', async ({ request }) => {
  const response = await request.get(`${api}/api/services`);
  expect(response.status()).toBe(200);
  const services = await response.json();
  expect(Array.isArray(services)).toBe(true);
  expect(services.length).toBeGreaterThan(0);
  expect(services[0]).toEqual(expect.objectContaining({
    id: expect.any(String),
    name: expect.any(String),
    category: expect.any(String),
    status: expect.any(String),
  }));
});

test('QA-API-02 required fields return 400 without creating a service', async ({ request }) => {
  const before = await (await request.get(`${api}/api/services`)).json();
  const response = await request.post(`${api}/api/services`, { data: { name: 'Incomplete QA fixture' } });
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'Name, URL, and IP are required fields.' });
  const after = await (await request.get(`${api}/api/services`)).json();
  expect(after).toHaveLength(before.length);
});

test('QA-API-03 create, update, and delete a service through REST', async ({ request }) => {
  const name = `QA API ${Date.now()}`;
  const created = await request.post(`${api}/api/services`, { data: service(name) });
  expect(created.status()).toBe(201);
  const body = await created.json();
  expect(body).toEqual(expect.objectContaining({ name, category: 'api', interval: 60 }));
  expect(body.id).toEqual(expect.any(String));

  try {
    const listed = await (await request.get(`${api}/api/services`)).json();
    expect(listed.some((entry: { id: string }) => entry.id === body.id)).toBe(true);

    const changedName = `${name} updated`;
    const updated = await request.put(`${api}/api/services/${body.id}`, {
      data: { name: changedName, description: 'Updated by QA API test' },
    });
    expect(updated.status()).toBe(200);
    expect((await updated.json()).name).toBe(changedName);
    const afterUpdate = await (await request.get(`${api}/api/services`)).json();
    expect(afterUpdate.find((entry: { id: string }) => entry.id === body.id)?.description).toBe('Updated by QA API test');

    const removed = await request.delete(`${api}/api/services/${body.id}`);
    expect(removed.status()).toBe(200);
    const afterDelete = await (await request.get(`${api}/api/services`)).json();
    expect(afterDelete.some((entry: { id: string }) => entry.id === body.id)).toBe(false);
  } finally {
    await request.delete(`${api}/api/services/${body.id}`);
  }
});

test('QA-API-04 unknown service operations return 404', async ({ request }) => {
  const id = 'qa-unknown-service';
  for (const [method, path] of [
    ['put', `/api/services/${id}`],
    ['delete', `/api/services/${id}`],
    ['post', `/api/services/${id}/recheck`],
    ['post', `/api/services/${id}/toggle`],
  ] as const) {
    const response = await request[method](`${api}${path}`, { data: { name: 'Ignored' } });
    expect(response.status(), `${method.toUpperCase()} ${path}`).toBe(404);
  }
});

test('QA-API-05 CPU failure simulation changes health and reset restores it', async ({ request }) => {
  await request.post(`${api}/api/actuator/simulate/reset`);
  try {
    const activated = await request.post(`${api}/api/actuator/simulate/cpu`);
    expect(activated.status()).toBe(200);
    expect(await activated.json()).toEqual({ isCpuSpikeActive: true });

    const during = await request.get(`${api}/api/actuator/health`);
    expect(during.status()).toBe(200);
    expect((await during.json()).status).toBe('DEGRADED');
  } finally {
    await request.post(`${api}/api/actuator/simulate/reset`);
  }

  const restored = await request.get(`${api}/api/actuator/health`);
  expect((await restored.json()).status).toBe('UP');
});
