const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const sha = process.env.GITHUB_SHA;
const ref = process.env.GITHUB_REF;

if (!token || !repository || !sha || ref !== 'refs/heads/main') {
  console.log('SKIP main provenance: execução fora de push em main.');
  process.exit(0);
}

const api = `https://api.github.com/repos/${repository}/commits/${sha}/pulls`;
const response = await fetch(api, {
  headers: {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2026-03-10',
  },
});

if (!response.ok) {
  throw new Error(`GitHub API retornou HTTP ${response.status} ao verificar a origem do commit.`);
}

const pulls = await response.json();
const valid = pulls.some((pull) =>
  pull?.base?.ref === 'main' &&
  pull?.base?.repo?.full_name === repository &&
  pull?.merged_at
);

if (!valid) {
  console.error('FAIL commit em main sem PR mesclada para main.');
  console.error(`Commit: ${sha}`);
  console.error('Push direto não pode produzir um release publicável.');
  process.exit(1);
}

console.log('PASS commit de main associado a uma PR mesclada.');
