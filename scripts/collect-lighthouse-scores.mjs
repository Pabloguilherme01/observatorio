import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), '.lighthouseci');
mkdirSync(dir, { recursive: true });

const files = readdirSync(dir)
  .filter(file => file.endsWith('.json') && file.includes('-lhr'))
  .sort();

const results = files.map(file => {
  const payload = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  const categories = payload.categories ?? {};
  return {
    file,
    requestedUrl: payload.requestedUrl ?? payload.finalDisplayedUrl ?? null,
    fetchTime: payload.fetchTime ?? null,
    scores: {
      performance: categories.performance?.score ?? null,
      accessibility: categories.accessibility?.score ?? null,
      bestPractices: categories['best-practices']?.score ?? null,
      seo: categories.seo?.score ?? null,
    },
    metrics: {
      lcp: payload.audits?.['largest-contentful-paint']?.numericValue ?? null,
      cls: payload.audits?.['cumulative-layout-shift']?.numericValue ?? null,
      tbt: payload.audits?.['total-blocking-time']?.numericValue ?? null,
    },
  };
});

if (files.length === 0) {
  throw new Error('Nenhum relatório Lighthouse LHR encontrado em .lighthouseci.');
}

const min = key => {
  const values = results.map(item => item.scores[key]).filter(value => typeof value === 'number');
  return values.length ? Math.min(...values) : null;
};

const summary = {
  generatedAt: new Date().toISOString(),
  runs: results,
  minimumScores: {
    performance: min('performance'),
    accessibility: min('accessibility'),
    bestPractices: min('bestPractices'),
    seo: min('seo'),
  },
};

writeFileSync(join(dir, 'lighthouse-scores.json'), JSON.stringify(summary, null, 2) + '\n');

console.log(JSON.stringify(summary, null, 2));
