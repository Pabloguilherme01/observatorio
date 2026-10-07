const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const dryRun = process.env.CLEANUP_DRY_RUN !== 'false';
const maxAgeDays = Number(process.env.CLEANUP_MAX_AGE_DAYS || 7);
const keepPerPrefix = Number(process.env.CLEANUP_KEEP_PER_PREFIX || 2);
const cleanupMergedBranches = process.env.CLEANUP_MERGED_BRANCHES === 'true';
const mergedMaxAgeDays = Number(process.env.CLEANUP_MERGED_MAX_AGE_DAYS || 14);
const maxDeletions = Number(process.env.CLEANUP_MAX_DELETIONS || 25);

if (!token || !repository) throw new Error('GITHUB_TOKEN/GH_TOKEN e GITHUB_REPOSITORY são obrigatórios.');
if (!Number.isInteger(maxDeletions) || maxDeletions < 1) throw new Error('CLEANUP_MAX_DELETIONS deve ser inteiro positivo.');

const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: 'Bearer ' + token,
  'X-GitHub-Api-Version': '2026-03-10',
};

async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  if (!response.ok) throw new Error('GitHub API ' + response.status + ' em ' + url);
  return response.status === 204 ? null : response.json();
}

async function listAll(pathname) {
  const out = [];
  for (let page = 1; page <= 100; page++) {
    const data = await api('https://api.github.com/repos/' + repository + pathname + (pathname.includes('?') ? '&' : '?') + 'per_page=100&page=' + page);
    out.push(...data);
    if (data.length < 100) return out;
  }
  throw new Error('GitHub API excedeu o limite de paginação de 100 páginas.');
}

const repoInfo = await api('https://api.github.com/repos/' + repository);
const defaultBranch = repoInfo.default_branch || 'main';
const expectedRef = 'refs/heads/' + defaultBranch;
if (!dryRun && (process.env.GITHUB_ACTIONS !== 'true' || process.env.GITHUB_REF !== expectedRef)) {
  throw new Error('A limpeza destrutiva só pode executar dentro do GitHub Actions e na branch padrão (' + expectedRef + ').');
}

const branches = await listAll('/branches');
const branchByName = new Map(branches.map(item => [item.name, item]));
const openPrs = await listAll('/pulls?state=open');
const active = new Set(openPrs.map(pr => pr.head?.ref).filter(Boolean));
const mergedBranchPrefixes = [
  'audit/',
  'audit-v',
  'chore/',
  'code-failure-analysis-',
  'codex/',
  'correcoes-',
  'design/',
  'docs/',
  'feat/',
  'test/',
  'feature/',
  'fix/',
  'perf/',
  'refactor/',
];

const candidates = branches
  .map(item => item.name)
  .filter(name => /^automation\/(?:tse-2026-|results-2026-)/.test(name))
  .filter(name => !active.has(name))
  .filter(name => !branchByName.get(name)?.protected);

const grouped = new Map();
for (const name of candidates) {
  const prefix = name.startsWith('automation/tse-2026-') ? 'automation/tse-2026-' : 'automation/results-2026-';
  const list = grouped.get(prefix) ?? [];
  list.push(name);
  grouped.set(prefix, list);
}

const now = Date.now();
let deleted = 0;
for (const [prefix, names] of grouped) {
  const records = [];
  for (const name of names) {
    if (deleted >= maxDeletions) break;
    const branch = await api('https://api.github.com/repos/' + repository + '/branches/' + name.split('/').map(encodeURIComponent).join('/'));
    const sha = branch.commit?.sha;
    if (!sha) continue;
    const commit = await api('https://api.github.com/repos/' + repository + '/commits/' + sha);
    const date = Date.parse(commit.commit?.committer?.date || commit.commit?.author?.date || 0);
    records.push({ name, date });
  }
  records.sort((a, b) => b.date - a.date);
  for (let index = 0; index < records.length; index++) {
    if (deleted >= maxDeletions) break;
    const record = records[index];
    if (!Number.isFinite(record.date)) {
      console.log('KEEP ' + record.name + ' (invalid date)');
      continue;
    }
    const ageDays = (now - record.date) / 86400000;
    const protectedByRecency = index < keepPerPrefix;
    if (protectedByRecency || ageDays < maxAgeDays) {
      console.log('KEEP ' + record.name + (protectedByRecency ? ' (recent)' : ' (young)'));
      continue;
    }
    const ref = record.name.split('/').map(encodeURIComponent).join('/');
    if (dryRun) {
      console.log('DRY-RUN DELETE ' + record.name + ' age=' + ageDays.toFixed(1) + 'd');
      continue;
    }
    await api('https://api.github.com/repos/' + repository + '/git/refs/heads/' + ref, { method: 'DELETE' });
    console.log('DELETE ' + record.name + ' age=' + ageDays.toFixed(1) + 'd');
    deleted++;
  }
}

let mergedDeleted = 0;
if (cleanupMergedBranches && deleted < maxDeletions) {
  const closedPrs = await listAll('/pulls?state=closed&base=' + encodeURIComponent(defaultBranch));
  const mergedByHead = new Map();

  for (const pr of closedPrs) {
    if (
      !pr.merged_at
      || pr.base?.ref !== defaultBranch
      || pr.head?.ref == null
      || pr.head?.repo?.full_name !== repository
      || pr.merge_commit_sha == null
    ) {
      continue;
    }

    const previous = mergedByHead.get(pr.head.ref);
    if (!previous || Date.parse(pr.merged_at) > Date.parse(previous.merged_at)) {
      mergedByHead.set(pr.head.ref, pr);
    }
  }

  const mergedCandidates = branches
    .map(item => item.name)
    .filter(name => name !== defaultBranch)
    .filter(name => name !== 'main')
    .filter(name => mergedBranchPrefixes.some(prefix => name.startsWith(prefix)))
    .filter(name => !active.has(name))
    .filter(name => !candidates.includes(name))
    .filter(name => !branchByName.get(name)?.protected)
    .filter(name => mergedByHead.has(name));

  const mergedRecords = mergedCandidates.map(name => {
    const pr = mergedByHead.get(name);
    return {
      name,
      mergedAt: Date.parse(pr.merged_at),
      prNumber: pr.number,
      mergeHeadSha: pr.head.sha,
      branchTipSha: branchByName.get(name)?.commit?.sha ?? null,
    };
  }).sort((a, b) => a.mergedAt - b.mergedAt);

  for (const record of mergedRecords) {
    if (deleted + mergedDeleted >= maxDeletions) break;

    const ageDays = (Date.now() - record.mergedAt) / 86400000;
    if (!Number.isFinite(ageDays) || ageDays < mergedMaxAgeDays) {
      console.log('KEEP ' + record.name + ' (merged ' + ageDays.toFixed(1) + 'd ago)');
      continue;
    }

    if (!record.branchTipSha || !record.mergeHeadSha || record.branchTipSha !== record.mergeHeadSha) {
      console.log('KEEP ' + record.name + ' (branch tip diverged from merged PR head)');
      continue;
    }

    const ref = record.name.split('/').map(encodeURIComponent).join('/');
    if (dryRun) {
      console.log('DRY-RUN DELETE MERGED ' + record.name + ' pr=#' + record.prNumber + ' age=' + ageDays.toFixed(1) + 'd');
      continue;
    }

    await api('https://api.github.com/repos/' + repository + '/git/refs/heads/' + ref, { method: 'DELETE' });
    console.log('DELETE MERGED ' + record.name + ' pr=#' + record.prNumber + ' age=' + ageDays.toFixed(1) + 'd');
    mergedDeleted++;
  }
}

console.log(JSON.stringify({
  repository,
  defaultBranch,
  candidates: candidates.length,
  deleted,
  mergedDeleted,
  totalDeleted: deleted + mergedDeleted,
  cleanupMergedBranches,
  dryRun,
  maxAgeDays,
  keepPerPrefix,
  mergedMaxAgeDays,
  maxDeletions,
}, null, 2));
