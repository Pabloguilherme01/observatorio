import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';

const modulePath = new URL('../src/lib/domReadiness.ts', import.meta.url);
assert.ok(fs.existsSync(modulePath), 'DOM readiness helper must exist');
const { waitForDom } = await import(pathToFileURL(modulePath.pathname));

function browser() {
  let nextId = 0;
  const frames = new Map();
  const timers = new Map();
  const observers = new Set();
  globalThis.window = {
    requestAnimationFrame(fn) { const id = ++nextId; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    setTimeout(fn) { const id = ++nextId; timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); },
  };
  globalThis.MutationObserver = class {
    constructor(fn) { this.fn = fn; }
    observe() { observers.add(this); }
    disconnect() { observers.delete(this); }
  };
  return {
    frames, timers, observers,
    frame() { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); },
    mutate() { [...observers].forEach(observer => observer.fn()); },
    expire() { [...timers.values()].forEach(fn => fn()); },
    assertClean() { assert.equal(frames.size + timers.size + observers.size, 0); },
  };
}

test('waits for delayed content and stops after the first success', () => {
  const env = browser();
  let ready = false;
  let opened = 0;
  waitForDom({}, () => { if (!ready) return false; opened++; return true; }, 6000);
  env.frame();
  assert.equal(opened, 0);
  ready = true;
  env.mutate(); env.mutate(); env.frame(); env.mutate(); env.frame();
  assert.equal(opened, 1);
  env.assertClean();
});

test('cancellation prevents delayed actions even when called twice', () => {
  const env = browser();
  let calls = 0;
  const cancel = waitForDom({}, () => { calls++; return false; }, 4000);
  cancel(); cancel(); env.mutate(); env.frame();
  assert.equal(calls, 0);
  env.assertClean();
});

test('timeout releases pending work when content never arrives', () => {
  const env = browser();
  let calls = 0;
  waitForDom({}, () => { calls++; return false; }, 4000);
  env.expire(); env.frame();
  assert.equal(calls, 0);
  env.assertClean();
});

test('without MutationObserver performs one attempt and releases the deadline', () => {
  const env = browser();
  globalThis.MutationObserver = undefined;
  let calls = 0;
  waitForDom({}, () => { calls++; return false; }, 4000);
  env.frame();
  assert.equal(calls, 1);
  env.assertClean();
});
