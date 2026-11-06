import assert from 'node:assert/strict';
import { test } from 'node:test';
import { attemptPwaInstall } from '../src/lib/pwaInstall.ts';

test('PWA aceita instalação quando navegador confirma', async () => {
  assert.equal(await attemptPwaInstall({
    prompt: async () => {},
    userChoice: Promise.resolve({ outcome: 'accepted' }),
  }), 'accepted');
});

test('PWA respeita instalação recusada', async () => {
  assert.equal(await attemptPwaInstall({
    prompt: async () => {},
    userChoice: Promise.resolve({ outcome: 'dismissed' }),
  }), 'dismissed');
});

test('rejeição de prompt nativo vira fallback manual, não erro sem tratamento', async () => {
  assert.equal(await attemptPwaInstall({
    prompt: async () => { throw new Error('NotAllowedError'); },
    userChoice: Promise.resolve({ outcome: 'dismissed' }),
  }), 'unavailable');
});

test('rejeição de userChoice também apresenta fallback manual', async () => {
  assert.equal(await attemptPwaInstall({
    prompt: async () => {},
    userChoice: Promise.reject(new Error('AbortError')),
  }), 'unavailable');
});
