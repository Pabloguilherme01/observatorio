import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canPersistMunicipalLanguagePreference,
  migrateMunicipalStorage,
  readMunicipalLanguagePreference,
} from '../src/lib/storageMigration.ts';

function storage(initial = {}, blockedKey = null) {
  const data = { ...initial };
  let blocked = blockedKey;
  Object.defineProperties(data, {
    getItem: { value(key) { return Object.hasOwn(this, key) ? this[key] : null; } },
    setItem: { value(key, value) {
      if (key === blocked) throw new Error('storage write denied');
      this[key] = String(value);
    } },
    removeItem: { value(key) { delete this[key]; } },
    unblock: { value() { blocked = null; } },
  });
  return data;
}

test('preserves v45 learning, copies other state and keeps real preferences', () => {
  globalThis.localStorage = storage({
    'observatorio-v45-quiz-best-scores': '[40,40,40,40,40]',
    'observatorio-v45-quiz-high-scores': '[{"score":40}]',
    'observatorio-v45-guided-learning-visited': '["valor"]',
    'observatorio-v45-language-mode': 'guided',
    'observatorio-v45-saved-indicators': '[{"id":"x"}]',
    'observatorio-v45-recent-sections': '["dashboard"]',
    'observatorio-theme': 'light',
    'observatorio-contrast': 'high',
    'other-site': 'untouched',
  });
  migrateMunicipalStorage();
  assert.equal(localStorage.getItem('observatorio-v45-quiz-best-scores'), '[40,40,40,40,40]');
  assert.equal(localStorage.getItem('observatorio-v45-quiz-high-scores'), '[{"score":40}]');
  assert.equal(localStorage.getItem('observatorio-v45-guided-learning-visited'), '["valor"]');
  assert.equal(localStorage.getItem('observatorio-v46-quiz-best-scores'), null);
  assert.equal(localStorage.getItem('observatorio-v46-guided-learning-visited'), null);
  assert.equal(localStorage.getItem('observatorio-v46-language-mode'), 'guided');
  assert.equal(localStorage.getItem('observatorio-v46-saved-indicators'), '[{"id":"x"}]');
  assert.equal(localStorage.getItem('observatorio-v46-recent-sections'), '["dashboard"]');
  assert.equal(localStorage.getItem('observatorio-theme'), 'light');
  assert.equal(localStorage.getItem('observatorio-contrast'), 'high');
  assert.equal(localStorage.getItem('other-site'), 'untouched');
  assert.equal(localStorage.getItem('observatorio-v46-migrated'), 'true');
});

test('keeps existing v46 progress and preference and does not repeat migration', () => {
  globalThis.localStorage = storage({
    'observatorio-v45-quiz-best-scores': '[40,40,40,40,40]',
    'observatorio-v45-language-mode': 'guided',
    'observatorio-v46-quiz-best-scores': '[25,0,0,0,0]',
    'observatorio-v46-language-mode': 'simple',
  });
  migrateMunicipalStorage();
  localStorage.setItem('observatorio-v45-language-mode', 'technical');
  migrateMunicipalStorage();
  assert.equal(localStorage.getItem('observatorio-v45-quiz-best-scores'), '[40,40,40,40,40]');
  assert.equal(localStorage.getItem('observatorio-v46-quiz-best-scores'), '[25,0,0,0,0]');
  assert.equal(localStorage.getItem('observatorio-v46-language-mode'), 'simple');
  assert.equal(readMunicipalLanguagePreference(), 'simple');
  assert.equal(canPersistMunicipalLanguagePreference(false), true);
});

test('does not fall back to v45 after a completed migration', () => {
  globalThis.localStorage = storage({
    'observatorio-v46-migrated': 'true',
    'observatorio-v45-language-mode': 'guided',
  });
  migrateMunicipalStorage();
  assert.equal(readMunicipalLanguagePreference(), null);
  assert.equal(localStorage.getItem('observatorio-v46-language-mode'), null);
});

test('keeps the old preference available when a write fails and retries safely', () => {
  globalThis.localStorage = storage({
    'observatorio-v45-quiz-best-scores': '[40,0,0,0,0]',
    'observatorio-v45-language-mode': 'guided',
  }, 'observatorio-v46-language-mode');
  assert.doesNotThrow(migrateMunicipalStorage);
  assert.equal(localStorage.getItem('observatorio-v46-migrated'), null);
  assert.equal(readMunicipalLanguagePreference(), 'guided');
  assert.equal(canPersistMunicipalLanguagePreference(false), false);
  assert.equal(localStorage.getItem('observatorio-v45-quiz-best-scores'), '[40,0,0,0,0]');
  localStorage.unblock();
  migrateMunicipalStorage();
  assert.equal(localStorage.getItem('observatorio-v46-language-mode'), 'guided');
  assert.equal(localStorage.getItem('observatorio-v46-migrated'), 'true');
});

test('a preference chosen during an incomplete migration wins on retry', () => {
  globalThis.localStorage = storage({
    'observatorio-v45-saved-indicators': '[]',
    'observatorio-v45-language-mode': 'guided',
  }, 'observatorio-v46-saved-indicators');
  migrateMunicipalStorage();
  assert.equal(localStorage.getItem('observatorio-v46-migrated'), null);
  assert.equal(readMunicipalLanguagePreference(), 'guided');
  assert.equal(canPersistMunicipalLanguagePreference(true), true);
  localStorage.setItem('observatorio-v46-language-mode', 'simple');
  localStorage.unblock();
  migrateMunicipalStorage();
  assert.equal(localStorage.getItem('observatorio-v46-language-mode'), 'simple');
  assert.equal(localStorage.getItem('observatorio-v46-saved-indicators'), '[]');
  assert.equal(localStorage.getItem('observatorio-v46-migrated'), 'true');
});

test('unavailable storage is tolerated without persisting an automatic default', () => {
  globalThis.localStorage = { getItem() { throw new Error('denied'); } };
  assert.doesNotThrow(migrateMunicipalStorage);
  assert.equal(readMunicipalLanguagePreference(), null);
  assert.equal(canPersistMunicipalLanguagePreference(false), false);
});
