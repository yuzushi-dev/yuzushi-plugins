import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { latestStableSandoTag } from './resolve-latest-sando-tag.mjs';
import { syncSandoMarketplace } from './sync-sando-marketplace.mjs';

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function fixture(t, version = '0.7.1') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sando-marketplace-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const source = path.join(root, 'source');
  const marketplace = path.join(root, 'marketplace');
  writeJson(path.join(source, 'plugins/sando/.codex-plugin/plugin.json'), { name: 'sando', version });
  writeJson(path.join(source, 'adapters/claude/sando/.claude-plugin/plugin.json'), { name: 'sando', version });
  writeJson(path.join(marketplace, '.agents/plugins/marketplace.json'), {
    name: 'yuzushi',
    plugins: [{ name: 'sando', source: { source: 'git-subdir', url: 'https://github.com/yuzushi-dev/Sando.git', path: 'plugins/sando', ref: 'v0.7.1' } }],
  });
  writeJson(path.join(marketplace, '.claude-plugin/marketplace.json'), {
    name: 'yuzushi',
    plugins: [{ name: 'sando', version: '0.7.1', source: { source: 'git-subdir', url: 'https://github.com/yuzushi-dev/Sando.git', path: 'adapters/claude/sando', ref: 'v0.7.1' } }],
  });
  return { root: marketplace, source };
}

test('selects the highest stable semantic tag and ignores prereleases', () => {
  const tags = [
    'a1 refs/tags/v0.9.2',
    'a2 refs/tags/v0.10.0',
    'a3 refs/tags/v0.11.0-rc.1',
    'a4 refs/tags/v2.0.0',
    'a5 refs/tags/v01.0.0',
  ].join('\n');

  assert.equal(latestStableSandoTag(tags), 'v2.0.0');
});

test('fails when no stable semantic tag is available', () => {
  assert.throws(() => latestStableSandoTag('deadbeef refs/tags/v1.2.0-rc.1'), /stable Sando tag/i);
});

test('updates both marketplace refs and the Claude version from a matching release', async (t) => {
  const paths = await fixture(t, '0.8.0');

  const changed = syncSandoMarketplace({ ...paths, tag: 'v0.8.0' });

  assert.equal(changed, true);
  const codex = JSON.parse(fs.readFileSync(path.join(paths.root, '.agents/plugins/marketplace.json'), 'utf8'));
  const claude = JSON.parse(fs.readFileSync(path.join(paths.root, '.claude-plugin/marketplace.json'), 'utf8'));
  assert.equal(codex.plugins[0].source.ref, 'v0.8.0');
  assert.equal(claude.plugins[0].source.ref, 'v0.8.0');
  assert.equal(claude.plugins[0].version, '0.8.0');
});

test('rejects a release whose embedded plugin versions do not match its tag', async (t) => {
  const paths = await fixture(t, '0.8.0');
  const before = fs.readFileSync(path.join(paths.root, '.agents/plugins/marketplace.json'), 'utf8');

  assert.throws(() => syncSandoMarketplace({ ...paths, tag: 'v0.8.1' }), /version.*tag/i);
  assert.equal(fs.readFileSync(path.join(paths.root, '.agents/plugins/marketplace.json'), 'utf8'), before);
});

test('refuses to move the marketplace backward when the highest remote tag is older', async (t) => {
  const paths = await fixture(t, '0.7.0');
  const codexBefore = fs.readFileSync(path.join(paths.root, '.agents/plugins/marketplace.json'), 'utf8');
  const claudeBefore = fs.readFileSync(path.join(paths.root, '.claude-plugin/marketplace.json'), 'utf8');

  assert.throws(() => syncSandoMarketplace({ ...paths, tag: 'v0.7.0' }), /older than current/i);
  assert.equal(fs.readFileSync(path.join(paths.root, '.agents/plugins/marketplace.json'), 'utf8'), codexBefore);
  assert.equal(fs.readFileSync(path.join(paths.root, '.claude-plugin/marketplace.json'), 'utf8'), claudeBefore);
});

test('updates only the Sando entry when release strings also occur elsewhere', async (t) => {
  const paths = await fixture(t, '1.0.1');
  const codexFile = path.join(paths.root, '.agents/plugins/marketplace.json');
  const claudeFile = path.join(paths.root, '.claude-plugin/marketplace.json');
  const codex = JSON.parse(fs.readFileSync(codexFile, 'utf8'));
  const claude = JSON.parse(fs.readFileSync(claudeFile, 'utf8'));
  const other = {
    name: 'other-plugin',
    version: '1.0.0',
    source: { source: 'url', url: 'https://example.com/other-plugin.git', ref: 'v1.0.0' },
  };
  codex.plugins[0].source.ref = 'v1.0.0';
  codex.plugins.push(other);
  claude.metadata = { version: '1.0.0' };
  claude.plugins[0].source.ref = 'v1.0.0';
  claude.plugins[0].version = '1.0.0';
  claude.plugins.push(other);
  writeJson(codexFile, codex);
  writeJson(claudeFile, claude);

  assert.equal(syncSandoMarketplace({ ...paths, tag: 'v1.0.1' }), true);

  const updatedCodex = JSON.parse(fs.readFileSync(codexFile, 'utf8'));
  const updatedClaude = JSON.parse(fs.readFileSync(claudeFile, 'utf8'));
  assert.equal(updatedCodex.plugins[0].source.ref, 'v1.0.1');
  assert.equal(updatedCodex.plugins[1].source.ref, 'v1.0.0');
  assert.equal(updatedClaude.plugins[0].source.ref, 'v1.0.1');
  assert.equal(updatedClaude.plugins[0].version, '1.0.1');
  assert.equal(updatedClaude.plugins[1].source.ref, 'v1.0.0');
  assert.equal(updatedClaude.plugins[1].version, '1.0.0');
  assert.equal(updatedClaude.metadata.version, '1.0.0');
});

test('does not rewrite manifests when they already point at the release', async (t) => {
  const paths = await fixture(t, '0.7.1');

  assert.equal(syncSandoMarketplace({ ...paths, tag: 'v0.7.1' }), false);
});
