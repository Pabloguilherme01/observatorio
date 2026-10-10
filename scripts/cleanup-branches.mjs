const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const dryRun = process.env.CLEANUP_DRY_RUN !== 'false';
const maxAgeDays = Number(process.env.CLEANUP_MAX_AGE_DAYS || 7);
const keepPerPrefix = Number(process.env.CLEANUP_KEEP_PER_PREFIX || 2);
const cleanupMergedBranches = process.env.CLEANUP_MERGED_BRANCHES === 'true';
const mergedMaxAgeDays = Number(process.env.CLEANUP_MERGED_MAX_AGE_DAYS || 7);
const maxDeletions = Number(process.env.CLEANUP_MAX_DELETIONS || 25);

if (!token || !repository) throw new Error('GITHUB_TOKEN/GH_TOKEN e GITHUB_REPOSITORY são obrigatórios.');
if (!Number.isInteger(maxAgeDays) || maxAgeDays < 1) throw new Error('CLEANUP_MAX_AGE_DAYS deve ser inteiro positivo.');
if (!Number.isInteger(keepPerPrefix) || keepPerPrefix < 0) throw new Error('CLEANUP_KEEP_PER_PREFIX deve ser inteiro não negativo.');
if (!Number.isInteger(mergedMaxAgeDays) || mergedMaxAgeDays < 1) throw new Error('CLEANUP_MERGED_MAX_AGE_DAYS deve ser inteiro positivo.');
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

async function listMergedPullRequests() {
  const [owner, name] = repository.split('/');
  const query = `query($owner:String!,$name:String!,$base:String!,$cursor:String) {
    repository(owner:$owner,name:$name) {
      pullRequests(first:100,states:MERGED,baseRefName:$base,after:$cursor) {
        nodes {
          number
          mergedAt
          baseRefName
          headRefName
          headRefOid
          headRepository { nameWithOwner }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }`;

  const out = [];
  let cursor = null;

  for (let page = 0; page < 100; page += 1) {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          owner,
          name,
          base: defaultBranch,
          cursor,
        },
      }),
    });

    if (!response.ok) throw new Error('GitHub GraphQL API ' + response.status + ' em pull requests mescladas.');
    const payload = await response.json();
    if (payload.errors?.length) {
      throw new Error('GitHub GraphQL retornou erro em pull requests mescladas: ' + payload.errors.map(item => item.message).join('; '));
    }

    const connection = payload.data?.repository?.pullRequests;
    if (!connection) throw new Error('GitHub GraphQL não retornou a conexão de pull requests mescladas.');

    out.push(...(connection.nodes ?? []).filter(Boolean));
    if (!connection.pageInfo?.hasNextPage) return out;
    cursor = connection.pageInfo.endCursor;
    if (!cursor) throw new Error('GitHub GraphQL indicou próxima página sem cursor.');
  }

  throw new Error('GitHub GraphQL excedeu o limite de paginação de pull requests mescladas.');
}

const branches = await listAll('/branches');
const branchByName = new Map(branches.map(item => [item.name, item]));
const openPrs = await listAll('/pulls?state=open');
const active = new Set(openPrs.map(pr => pr.head?.ref).filter(Boolean));

const candidates = branches
  .map(item => item.name)
  .filter(name => /^automation\/(?:sources-2026-|results-2026-)/.test(name))
  .filter(name => !active.has(name))
  .filter(name => !branchByName.get(name)?.protected);

const grouped = new Map();
for (const name of candidates) {
  const prefix = name.startsWith('automation/sources-2026-') ? 'automation/sources-2026-' : 'automation/results-2026-';
  const list = grouped.get(prefix) ?? [];
  list.push(name);
  grouped.set(prefix, list);
}

const now = Date.now();
let deleted = 0;
for (const names of grouped.values()) {
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
  const mergedPrs = await listMergedPullRequests();
  console.log('Merged PRs fetched: ' + mergedPrs.length);
  const mergedByHead = new Map();

  for (const pr of mergedPrs) {
    if (
      !pr.mergedAt
      || pr.baseRefName !== defaultBranch
      || !pr.headRefName
      || !pr.headRefOid
    ) {
      continue;
    }

    const localTipSha = branchByName.get(pr.headRefName)?.commit?.sha ?? null;
    const sameRepositoryHead = pr.headRepository?.nameWithOwner === repository
      || (pr.headRepository == null && localTipSha === pr.headRefOid);

    if (!sameRepositoryHead) {
      continue;
    }

    const previous = mergedByHead.get(pr.headRefName);
    if (!previous || Date.parse(pr.mergedAt) > Date.parse(previous.mergedAt)) {
      mergedByHead.set(pr.headRefName, pr);
    }
  }

  const mergedRecords = [...mergedByHead.values()]
    .map(pr => {
      const name = pr.headRefName;
      return {
        name,
        mergedAt: Date.parse(pr.mergedAt),
        prNumber: pr.number,
        mergeHeadSha: pr.headRefOid,
        branchTipSha: branchByName.get(name)?.commit?.sha ?? null,
        branchProtected: branchByName.get(name)?.protected === true,
      };
    })
    .filter(record => record.name !== defaultBranch)
    .filter(record => record.name !== 'main')
    .filter(record => !active.has(record.name))
    .filter(record => !candidates.includes(record.name))
    .filter(record => !record.branchProtected)
    .filter(record => record.branchTipSha != null)
    .sort((a, b) => a.mergedAt - b.mergedAt);

  console.log('Merged PR source records: ' + mergedByHead.size);
  console.log('Merged PR cleanup candidates before age/SHA checks: ' + mergedRecords.length);

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
