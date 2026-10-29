import assert from 'node:assert/strict';
import { test } from 'node:test';
import { migrateMunicipalStorage } from '../src/lib/storageMigration.ts';

function storage(initial = {}) {
  const data = { ...initial };
  Object.defineProperties(data, {
    getItem: { value(key) { return Object.hasOwn(this, key) ? this[key] : null; } },
    setItem: { value(key, value) { this[key] = String(value); } },
    removeItem: { value(key) { delete this[key]; } },
  });
  return data;
}

test('copies preferences but preserves old learning data without migrating it', () => {
  globalThis.localStorage = storage({
    'observatorio-v45-quiz-progress': '{"score":10}',
    'observatorio-v45-guided-learning': '{"step":3}',
    'observatorio-v45-theme': 'dark',
    'observatorio-v46-theme': 'light',
    'observatorio-v45-contrast': 'high',
    'other-site': 'untouched',
  });
  migrateMunicipalStorage();
  assert.equal(localStorage.getItem('observatorio-v45-quiz-progress'), '{"score":10}');
  assert.equal(localStorage.getItem('observatorio-v45-guided-learning'), '{"step":3}');
  assert.equal(localStorage.getItem('observatorio-v46-quiz-progress'), null);
  assert.equal(localStorage.getItem('observatorio-v46-guided-learning'), null);
  assert.equal(localStorage.getItem('observatorio-v46-theme'), 'light');
  assert.equal(localStorage.getItem('observatorio-v46-contrast'), 'high');
  assert.equal(localStorage.getItem('other-site'), 'untouched');
  assert.equal(localStorage.getItem('observatorio-v46-migrated'), 'true');
});

test('does not repeat migration after marker exists', () => {
  globalThis.localStorage = storage({'observatorio-v46-migrated':'true', 'observatorio-v45-theme':'dark'});
  migrateMunicipalStorage();
  assert.equal(localStorage.getItem('observatorio-v46-theme'), null);
});

test('storage access failure does not interrupt application startup', () => {
  globalThis.localStorage = {getItem() { throw new Error('denied'); }};
  assert.doesNotThrow(migrateMunicipalStorage);
});
