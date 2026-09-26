import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const quiz = read('src/components/sections/QuickQuiz.tsx');
const quizData = read('src/data/quiz/questionBank.ts');
const registry = read('src/data/sourceRegistry.ts');

const errors = [];
const pass = message => console.log('PASS', message);
const fail = message => errors.push(message);

const questions = [...quizData.matchAll(
  /\{\s*id:\s*"(q\d+)",\s*difficulty:\s*'([^']+)',\s*prompt:\s*"((?:\\.|[^"\\])*)",\s*options:\s*\[([^\]]+)\],\s*answerIndex:\s*(\d+),[\s\S]*?sourceId:\s*"([^"]+)"\s*\}/g,
)].map(match => ({
  id: match[1],
  difficulty: match[2],
  prompt: match[3].trim(),
  options: [...match[4].matchAll(/"[^"]*"/g)].length,
  answerIndex: Number(match[5]),
  sourceId: match[6],
}));

const registryIds = new Set([...registry.matchAll(/id:\s*'([^']+)'/g)].map(match => match[1]));
const quickQuizSource = quiz;
if (!quickQuizSource.includes('const displayedScore = score;')) fail('Pontuação exibida deve usar o score já contabilizado.');
else pass('Pontuação exibida do Quiz não duplica a resposta selecionada.');

if (!quickQuizSource.includes('if (optionIndex === question.answerIndex) setScore(previous => previous + 1);')) fail('Resposta correta deve ser contabilizada no momento da seleção.');
else pass('Resposta correta é contabilizada uma única vez no momento da seleção.');
if (!quickQuizSource.includes('const finalScore = score;')) fail('Pontuação final deve reutilizar o score já contabilizado, sem somar a última resposta novamente.');
else pass('Pontuação final não duplica a última resposta.');

if (!quickQuizSource.includes('readQuizBestScores')) fail('Quiz perdeu a persistência da melhor marca pessoal.');
else pass('Quiz mantém apenas a melhor marca pessoal por fase.');
const leaderboard = read('src/lib/quizLeaderboard.ts');
if (!leaderboard.includes('BEST_KEY') || !leaderboard.includes('localStorage.setItem(BEST_KEY')) fail('Progresso por fase não está persistido de forma independente.');
else pass('Melhor pontuação de cada fase fica persistida independentemente do ranking global.');

const expectedLevels = ['Fácil', 'Médio', 'Difícil', 'Avançado', 'Expert'];
const expectedTotal = 200;
const perLevel = 40;

if (questions.length !== expectedTotal) fail(`Quiz deve conter ${expectedTotal} perguntas; encontrado ${questions.length}.`);
else pass(`Quiz contém exatamente ${expectedTotal} perguntas.`);

const ids = questions.map(question => question.id);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
if (duplicateIds.length) fail('IDs duplicados: ' + duplicateIds.join(', '));
else pass('IDs das perguntas são únicos.');

const prompts = questions.map(question => question.prompt.toLocaleLowerCase('pt-BR'));
const duplicatePrompts = [...new Set(prompts.filter((prompt, index) => prompts.indexOf(prompt) !== index))];
if (duplicatePrompts.length) fail('Prompts duplicados: ' + duplicatePrompts.join(' | '));
else pass('Prompts das perguntas são únicos.');

const counts = Object.fromEntries(expectedLevels.map(level => [level, questions.filter(question => question.difficulty === level).length]));
for (const level of expectedLevels) {
  if (counts[level] !== perLevel) fail(`Fase ${level} deve conter ${perLevel}; encontrado ${counts[level]}.`);
}
if (!errors.length) pass('As cinco fases possuem 40 perguntas cada.');

const invalidOptions = questions.filter(question => question.options !== 4);
if (invalidOptions.length) fail('Perguntas sem quatro alternativas: ' + invalidOptions.map(question => question.id).join(', '));
else pass('Todas as perguntas possuem quatro alternativas.');

const invalidAnswers = questions.filter(question => question.answerIndex < 0 || question.answerIndex >= question.options);
if (invalidAnswers.length) fail('Resposta fora do intervalo: ' + invalidAnswers.map(question => question.id).join(', '));
else pass('Todos os índices de resposta são válidos.');

const missingSources = questions.filter(question => !registryIds.has(question.sourceId));
if (missingSources.length) fail('sourceId ausente no registro: ' + missingSources.map(question => `${question.id}→${question.sourceId}`).join(', '));
else pass('Toda pergunta aponta para uma fonte registrada.');

const expectedIds = Array.from({ length: expectedTotal }, (_, index) => 'q' + String(index + 1).padStart(3, '0'));
const missingIds = expectedIds.filter(id => !ids.includes(id));
const extraIds = ids.filter(id => !expectedIds.includes(id));
if (missingIds.length || extraIds.length) {
  if (missingIds.length) fail('IDs ausentes: ' + missingIds.join(', '));
  if (extraIds.length) fail('IDs inesperados: ' + extraIds.join(', '));
} else {
  pass('Banco mantém IDs q001–q200 sem lacunas.');
}

if (errors.length) {
  console.error('FAIL ' + errors.length + ' regra(s)');
  errors.forEach(error => console.error(' - ' + error));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ valid: true, total: questions.length, counts }, null, 2));
}
