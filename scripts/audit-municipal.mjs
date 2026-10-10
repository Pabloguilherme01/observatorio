import assert from 'node:assert/strict';

import fs from 'node:fs';

import path from 'node:path';

import { loadTypescript } from './lib/load-typescript.mjs';

const { observatorioData: data } = await loadTypescript('src/data/observatorioData.ts');

const { municipalIntegrity } = await loadTypescript('src/lib/municipalIntegrity.ts');

const integrity = municipalIntegrity(data);

assert.equal(integrity.valid, true, JSON.stringify(integrity));

const forbidden = /\b(?:electoral|polls|candidates|electorate|voters)\b|tse\.jus\.br|eleitor|candidatur/i;

assert.doesNotMatch(JSON.stringify(data), forbidden, 'dataset must be municipal only');

for (const name of ['sources','populationSeries','indicators']) assert.ok(data[name].length > 0, name);

for (const indicator of data.indicators) {
  assert.ok(indicator.id && indicator.label && indicator.unit, `invalid indicator: ${indicator.id}`);
  assert.ok(data.sources.some(source => source.id === indicator.sourceId), indicator.id);
}

const ids = data.sources.map(source => source.id);

assert.equal(new Set(ids).size, ids.length);

for (const source of data.sources) {
  assert.equal(new URL(source.url).protocol, 'https:');
  assert.ok(source.label && source.institution && source.nature);
}

assert.equal(municipalIntegrity({...data, indicators:[...data.indicators,{...data.indicators[0],id:'unknown-source',sourceId:'missing'}]}).valid,false);

assert.equal(municipalIntegrity({...data, indicators:[...data.indicators,data.indicators[0]]}).valid,false);

assert.equal(municipalIntegrity({...data, meta:{...data.meta,updatedAt:'2026-02-30'}}).valid,false);

assert.equal(municipalIntegrity({...data, budget:{...data.budget, sourceIds:['missing']}}).valid,false);

const collect = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => {
  const file = path.join(dir,entry.name);return entry.isDirectory()?collect(file):[file];
});

for (const file of ['index.html',...collect('src'),...collect('public'),...collect('.github/workflows')]) {
  if (file.endsWith('retiredDestinations.ts') || file.endsWith('storageMigration.ts') || !/\.(?:tsx?|json|html|ya?ml)$/.test(file)) continue;
  assert.doesNotMatch(fs.readFileSync(file,'utf8'), /\bTSE\b|tse\.jus\.br|eleitor|candidatur|api\/v1\//i, `retired runtime content: ${file}`);
}

assert.equal(JSON.parse(fs.readFileSync('package.json')).version,'46.0.0');

console.log(JSON.stringify({valid:true,indicators:data.indicators.length,sources:data.sources.length,integrity},null,2));
