import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const readJson = (file) => JSON.parse(read(file));
const claudeMarketplace = readJson('.claude-plugin/marketplace.json');
const codexMarketplace = readJson('.agents/plugins/marketplace.json');

const trackedJson = execFileSync('git', ['ls-files', '*.json'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);
for (const file of trackedJson) readJson(file);

function plugin(marketplace, name, label) {
  const matches = marketplace.plugins.filter((candidate) => candidate.name === name);
  assert.equal(matches.length, 1, `${label} must contain exactly one ${name} entry`);
  return matches[0];
}

const expectedSessionHandoffUrl = 'https://github.com/yuzushi-dev/session-handoff.git';
const claudeSessionHandoff = plugin(claudeMarketplace, 'session-handoff', 'Claude marketplace');
const codexSessionHandoff = plugin(codexMarketplace, 'session-handoff', 'Codex marketplace');
for (const [label, entry] of [['Claude', claudeSessionHandoff], ['Codex', codexSessionHandoff]]) {
  assert.equal(entry.source.source, 'url', `${label} session-handoff source type`);
  assert.equal(entry.source.url, expectedSessionHandoffUrl, `${label} session-handoff source URL`);
  assert.equal(entry.source.ref, 'v0.7.4-jev.5', `${label} session-handoff source ref`);
}
assert.equal(claudeSessionHandoff.version, '0.7.4-jev.5', 'Claude session-handoff version');

const expectedSandoUrl = 'https://github.com/yuzushi-dev/Sando.git';
const claudeSando = plugin(claudeMarketplace, 'sando', 'Claude marketplace');
const codexSando = plugin(codexMarketplace, 'sando', 'Codex marketplace');
for (const [label, entry, expectedPath] of [
  ['Claude', claudeSando, 'adapters/claude/sando'],
  ['Codex', codexSando, 'plugins/sando'],
]) {
  assert.equal(entry.source.source, 'git-subdir', `${label} Sando source type`);
  assert.equal(entry.source.url, expectedSandoUrl, `${label} Sando source URL`);
  assert.equal(entry.source.path, expectedPath, `${label} Sando source path`);
  assert.match(entry.source.ref, /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, `${label} Sando source ref`);
}
assert.equal(claudeSando.source.ref, codexSando.source.ref, 'Sando source refs');
assert.equal(claudeSando.version, claudeSando.source.ref.slice(1), 'Claude Sando version');

const readme = read('README.md');
for (const text of [
  'plugin install sando@yuzushi',
  'codex plugin marketplace add yuzushi-dev/yuzushi-plugins',
  'https://github.com/yuzushi-dev/Sando',
]) {
  assert(readme.includes(text), `README is missing: ${text}`);
}

const handoffs = execFileSync('git', ['ls-files', 'handoffs/**'], { encoding: 'utf8' }).trim();
assert.equal(handoffs, '', 'Internal handoffs must not be tracked in the public repository');
console.log('Marketplace metadata is valid.');
