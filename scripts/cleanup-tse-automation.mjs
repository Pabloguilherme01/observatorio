const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const dryRun = process.env.CLEANUP_DRY_RUN !== 'false';
const maxAgeDays = Number(process.env.CLEANUP_MAX_AGE_DAYS || 7);
const keepPerPrefix = Number(process.env.CLEANUP_KEEP_PER_PREFIX || 2);

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

console.log(JSON.stringify({ repository, candidates: candidates.length, deleted, dryRun, maxAgeDays, keepPerPrefix }, null, 2));
