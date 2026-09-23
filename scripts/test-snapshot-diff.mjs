function diffSnapshots(previous, current) {
  const before = new Map(previous.records.map(record => [record.id, record]));
  const after = new Map(current.records.map(record => [record.id, record]));
  const added = [], removed = [], changed = [];
  for (const [id, value] of after) {
    const prior = before.get(id);
    if (!prior) added.push(id);
    else if (JSON.stringify(prior) !== JSON.stringify(value)) changed.push(id);
  }
  for (const [id] of before) if (!after.has(id)) removed.push(id);
  return { added, removed, changed };
}

const baseline = JSON.parse(await (await import('node:fs/promises')).readFile('fixtures/snapshot-baseline.json', 'utf8'));
const second = JSON.parse(await (await import('node:fs/promises')).readFile('fixtures/snapshot-second.json', 'utf8'));
const result = diffSnapshots(baseline, second);

if (result.added.length !== 1 || result.added[0] !== '3') throw new Error('Fixture diff: added incorreto');
if (result.removed.length !== 1 || result.removed[0] !== '2') throw new Error('Fixture diff: removed incorreto');
if (result.changed.length !== 0) throw new Error('Fixture diff: changed deveria ser zero');
console.log('PASS fixture snapshot diff');
