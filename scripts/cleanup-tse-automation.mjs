const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const dryRun = process.env.CLEANUP_DRY_RUN !== 'false';
const maxAgeDays = Number(process.env.CLEANUP_MAX_AGE_DAYS || 7);
const keepPerPrefix = Number(process.env.CLEANUP_KEEP_PER_PREFIX || 2);
const cleanupMergedBranches = process.env.CLEANUP_MERGED_BRANCHES === 'true';
const mergedMaxAgeDays = Number(process.env.CLEANUP_MERGED_MAX_AGE_DAYS || 14);
const mergedMaxDeletions = Number(process.env.CLEANUP_MERGED_MAX_DELETIONS || 25);

if (!token || !repository) throw new Error('GITHUB_TOKEN/GH_TOKEN e GITHUB_REPOSITORY são obrigatórios.');

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
  for (let page = 1; page <= 10; page++) {
    const data = await api('https://api.github.com/repos/' + repository + pathname + (pathname.includes('?') ? '&' : '?') + 'per_page=100&page=' + page);
    out.push(...data);
    if (data.length < 100) break;
  }
  return out;
}

const branches = await listAll('/branches');
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
  'feature/',
  'fix/',
  'perf/',
  'refactor/',
];

const candidates = branches
  .map(item => item.name)
  .filter(name => /^automation\/(?:tse-2026-|results-2026-)/.test(name))
  .filter(name => !active.has(name));

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
    const branch = await api('https://api.github.com/repos/' + repository + '/branches/' + name.split('/').map(encodeURIComponent).join('/'));
    const sha = branch.commit?.sha;
    if (!sha) continue;
    const commit = await api('https://api.github.com/repos/' + repository + '/commits/' + sha);
    const date = Date.parse(commit.commit?.committer?.date || commit.commit?.author?.date || 0);
    records.push({ name, date });
  }
  records.sort((a, b) => b.date - a.date);
  for (let index = 0; index < records.length; index++) {
    const record = records[index];
    const ageDays = Number.isFinite(record.date) ? (now - record.date) / 86400000 : Infinity;
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
if (cleanupMergedBranches) {
  const mergedCandidates = branches
    .map(item => item.name)
    .filter(name => name !== 'main')
    .filter(name => mergedBranchPrefixes.some(prefix => name.startsWith(prefix)))
    .filter(name => !active.has(name))
    .filter(name => !candidates.includes(name));

  const mergedRecords = [];
  for (const name of mergedCandidates) {
    const prs = await api(
      'https://api.github.com/repos/' + repository + '/pulls?state=closed&head='
        + encodeURIComponent(repository.split('/')[0] + ':' + name) + '&per_page=100',
    );
    const merged = prs
      .filter(pr => pr.merged_at)
      .sort((a, b) => Date.parse(b.merged_at) - Date.parse(a.merged_at))[0];
    if (!merged) continue;
    mergedRecords.push({
      name,
      mergedAt: Date.parse(merged.merged_at),
      prNumber: merged.number,
    });
  }

  const nowMs = Date.now();
  mergedRecords.sort((a, b) => a.mergedAt - b.mergedAt);
  for (const record of mergedRecords) {
    if (mergedDeleted >= mergedMaxDeletions) break;
    const ageDays = (nowMs - record.mergedAt) / 86400000;
    if (!Number.isFinite(ageDays) || ageDays < mergedMaxAgeDays) {
      console.log('KEEP ' + record.name + ' (merged ' + ageDays.toFixed(1) + 'd ago)');
      continue;
    }
    const ref = record.name.split('/').map(encodeURIComponent).join('/');
    if (dryRun) {
      console.log('DRY-RUN DELETE MERGED ' + record.name + ' pr=#' + record.prNumber);
      continue;
    }
    await api('https://api.github.com/repos/' + repository + '/git/refs/heads/' + ref, { method: 'DELETE' });
    console.log('DELETE MERGED ' + record.name + ' pr=#' + record.prNumber + ' age=' + ageDays.toFixed(1) + 'd');
    mergedDeleted++;
  }
}

console.log(JSON.stringify({
  repository,
  candidates: candidates.length,
  deleted,
  mergedDeleted,
  cleanupMergedBranches,
  dryRun,
  maxAgeDays,
  keepPerPrefix,
  mergedMaxAgeDays,
  mergedMaxDeletions,
}, null, 2));
