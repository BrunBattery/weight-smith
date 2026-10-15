import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { deploy } from './deploy.mjs';

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

test('deployment publishes built files, preserves history, removes stale files, and supports dry runs', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'weight-smith deploy test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const remote = join(directory, 'remote.git');
  const projectDir = join(directory, 'project');
  mkdirSync(projectDir);
  git(directory, 'init', '--bare', remote);
  git(projectDir, 'init', '--initial-branch=main');
  git(projectDir, 'config', 'user.name', 'Deployment Test');
  git(projectDir, 'config', 'user.email', 'deploy@example.invalid');
  // Exercise a relative remote path as well as paths with spaces.
  git(projectDir, 'remote', 'add', 'origin', '../remote.git');
  writeFileSync(join(projectDir, 'package.json'), JSON.stringify({ version: '1.2.3' }));
  mkdirSync(join(projectDir, 'dist'));
  writeFileSync(join(projectDir, 'dist/index.html'), '<h1>First build</h1>');
  writeFileSync(join(projectDir, 'dist/old.js'), 'old');
  writeFileSync(join(projectDir, 'dist/CNAME'), 'example.invalid');
  writeFileSync(join(projectDir, 'dist/.nojekyll'), '');
  git(projectDir, 'add', 'package.json');
  git(projectDir, 'commit', '-m', 'Source checkout');
  const sourceHead = git(projectDir, 'rev-parse', 'HEAD');
  const sourceStatus = git(projectDir, 'status', '--porcelain');

  deploy({ projectDir, dryRun: true });
  assert.equal(git(directory, '--git-dir', remote, 'for-each-ref', 'refs/heads'), '');
  const first = deploy({ projectDir });
  assert.equal(git(directory, '--git-dir', remote, 'rev-parse', 'gh-pages'), first);
  assert.equal(git(directory, '--git-dir', remote, 'show', 'gh-pages:CNAME'), 'example.invalid');
  assert.equal(git(directory, '--git-dir', remote, 'show', 'gh-pages:.nojekyll'), '');
  assert.throws(() => git(directory, '--git-dir', remote, 'show', 'gh-pages:package.json'));

  rmSync(join(projectDir, 'dist/old.js'));
  writeFileSync(join(projectDir, 'dist/index.html'), '<h1>Second build</h1>');
  deploy({ projectDir, dryRun: true });
  assert.equal(git(directory, '--git-dir', remote, 'rev-parse', 'gh-pages'), first);
  const second = deploy({ projectDir });
  assert.equal(git(directory, '--git-dir', remote, 'rev-parse', 'gh-pages^'), first);
  assert.equal(git(directory, '--git-dir', remote, 'rev-parse', 'gh-pages'), second);
  assert.equal(git(directory, '--git-dir', remote, 'show', 'gh-pages:index.html'), '<h1>Second build</h1>');
  assert.throws(() => git(directory, '--git-dir', remote, 'show', 'gh-pages:old.js'));
  assert.equal(git(projectDir, 'rev-parse', 'HEAD'), sourceHead);
  assert.equal(git(projectDir, 'status', '--porcelain'), sourceStatus);
  assert.equal(existsSync(join(projectDir, 'dist/.git')), false);
});

test('deployment fails before publishing if the build is missing', () => {
  assert.throws(() => deploy({ projectDir: join(tmpdir(), 'weight-smith-no-build') }), /Run npm run build/);
});
