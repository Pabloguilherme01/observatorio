import { test, expect } from 'playwright/test';

test.describe('Contrato da API pública', () => {
  test('health, sources e OpenAPI expõem contratos mínimos', async ({ request }) => {
    const endpoints = [
      {
        path: './api/v1/health.json',
        assert: body => {
          expect(body.schemaVersion).toBe(2);
          expect(body).toHaveProperty('status');
          expect(body.publication).toHaveProperty('commitSha');
          expect(body.freshness).toHaveProperty('tseCandidates');
        },
      },
      {
        path: './api/v1/sources.json',
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
        path: './api/v1/openapi.json',
        assert: body => {
          expect(body.openapi).toBe('3.0.3');
          expect(body.paths['/api/v1/health.json']).toBeTruthy();
          expect(body.paths['/api/v1/sources.json']).toBeTruthy();
          expect(body.paths['/api/v1/observatorio.json']).toBeTruthy();
        },
      },
      {
        path: './api/v1/observatorio.json',
        assert: body => {
          expect(body.schemaVersion).toBe(1);
          expect(body.apiVersion).toBe('1.0');
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