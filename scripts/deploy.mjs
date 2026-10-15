import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Publish only built files, preserving gh-pages history and the source checkout. */
export function deploy({ projectDir = projectRoot, dryRun = false } = {}) {
  const dist = join(projectDir, 'dist');
  if (!existsSync(join(dist, 'index.html'))) {
    throw new Error('Missing dist/index.html. Run npm run build before deploying.');
  }

  const git = (cwd, args) => execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  const remote = git(projectDir, ['remote', 'get-url', '--push', 'origin']);
  const name = git(projectDir, ['config', 'user.name']);
  const email = git(projectDir, ['config', 'user.email']);
  const { version } = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf8'));
  const directory = mkdtempSync(join(tmpdir(), 'weight-smith-deploy-'));

  try {
    git(directory, ['init', '--initial-branch=gh-pages']);
    git(directory, ['config', 'user.name', name]);
    git(directory, ['config', 'user.email', email]);
    // Resolve relative local remote paths from the original checkout.
    const remoteUrl = git(projectDir, ['ls-remote', '--get-url', remote]);
    const localRemote = resolve(projectDir, remoteUrl);
    const resolvedRemote = existsSync(localRemote) ? localRemote : remoteUrl;
    const existing = git(directory, ['ls-remote', resolvedRemote, 'refs/heads/gh-pages']);
    const parents = [];
    if (existing) {
      git(directory, ['fetch', '--depth=1', resolvedRemote, 'refs/heads/gh-pages']);
      parents.push('-p', git(directory, ['rev-parse', 'FETCH_HEAD']));
    }

    cpSync(dist, directory, { recursive: true, filter: (source) => !source.split(/[/\\]/).includes('.git') });
    // Force-add built assets even if global Git ignore rules match them.
    git(directory, ['add', '--all', '--force']);
    const tree = git(directory, ['write-tree']);
    const commit = git(directory, ['commit-tree', tree, ...parents, '-m', `Deploy WeightSmith v${version}`]);

    if (dryRun) {
      console.log(`Dry run: prepared WeightSmith v${version} for gh-pages; no push performed.`);
    } else {
      // A regular push rejects concurrent deployments instead of overwriting them.
      git(directory, ['push', resolvedRemote, `${commit}:refs/heads/gh-pages`]);
      console.log(`Deployed WeightSmith v${version} to gh-pages.`);
    }
    return commit;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--dry-run')) {
    console.error('Usage: node scripts/deploy.mjs [--dry-run]');
    process.exitCode = 1;
  } else {
    try {
      deploy({ dryRun: args.includes('--dry-run') });
    } catch (error) {
      console.error(error.stderr?.toString().trim() || error.message);
      process.exitCode = 1;
    }
  }
}
