import { test, expect } from 'playwright/test';

test.describe('Contrato da API pública', () => {
  test('health, sources e OpenAPI expõem contratos mínimos', async ({ request }) => {
    const endpoints = [
      {
        path: './api/v2/health.json',
        assert: body => {
          expect(body.schemaVersion).toBe(2);
          expect(body).toHaveProperty('status');
          expect(body.publication).toHaveProperty('commitSha');
          expect(body.integrity.valid).toBe(true);
          expect(body.references.every(reference => reference.freshness === 'not-assessed')).toBe(true);
        },
      },
      {
        path: './api/v2/sources.json',
        assert: body => {
          expect(body.schemaVersion).toBe(2);
          expect(Array.isArray(body.sources)).toBe(true);
          expect(body.sources.length).toBeGreaterThan(0);
          for (const source of body.sources) {
            expect(source).toHaveProperty('id');
            expect(source).toHaveProperty('label');
            expect(source).toHaveProperty('institution');
            expect(source).toHaveProperty('url');
            expect(source).toHaveProperty('lastCheckedAt');
            expect(source).toHaveProperty('nature');
            expect(source).toHaveProperty('note');
          }
        },
      },
      {
        path: './api/v2/openapi.json',
        assert: body => {
          expect(body.openapi).toBe('3.0.3');
          expect(body.paths['/api/v2/health.json']).toBeTruthy();
          expect(body.paths['/api/v2/sources.json']).toBeTruthy();
          expect(body.paths['/api/v2/observatorio.json']).toBeTruthy();
        },
      },
      {
        path: './api/v2/observatorio.json',
        assert: body => {
          expect(body.schemaVersion).toBe(2);
          expect(body.apiVersion).toBe('2.0');
          for (const key of ['electoral','polls','candidates']) expect(body.data).not.toHaveProperty(key);
          expect(body).toHaveProperty('datasetUpdatedAt');
          expect(body).toHaveProperty('data');
        },
      },
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint.path);
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('application/json');
      endpoint.assert(await response.json());
    }
  });
});
