import fs from 'node:fs';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const cases = [
 ['src/data/quiz/questionBank.ts','scripts/audit-quiz.mjs',text => text.replace('"q002"','"q001"'),'duplicate quiz ID'],
 ['src/data/quiz/questionBank.ts','scripts/audit-quiz.mjs',text => text.replace('"answerIndex": 0','"answerIndex": 8'),'invalid quiz answer'],
 ['src/data/quiz/questionBank.ts','scripts/audit-quiz.mjs',text => text.replace('"sourceId": "ibge-cidades-2026"','"sourceId": "unknown-source"'),'unresolved quiz source'],
 ['src/data/observatorioData.ts','scripts/audit-municipal.mjs',text => text.replace("sourceId: 'ibge-censo-2022'","sourceId: 'unknown-source'"),'unresolved municipal source'],
 ['src/data/observatorioData.ts','scripts/audit-municipal.mjs',text => text.replace('  sources: sourceRegistry,','  sources: sourceRegistry,\n  electoral: {},'),'retired dataset key'],
];
for (const [file,audit,mutate,label] of cases) {
 const original=fs.readFileSync(file,'utf8');
 try {
  assert.equal(spawnSync(process.execPath,[audit],{encoding:'utf8'}).status,0,'baseline '+audit);
  const changed=mutate(original);assert.notEqual(changed,original,label);fs.writeFileSync(file,changed);
  const result=spawnSync(process.execPath,[audit],{encoding:'utf8'});assert.notEqual(result.status,0,'audit accepted '+label);
  console.log('PASS rejection:',label);
 } finally { fs.writeFileSync(file,original); }
}
