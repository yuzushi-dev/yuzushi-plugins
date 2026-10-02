import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const STABLE_TAG = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const SANDO_URL = 'https://github.com/yuzushi-dev/Sando.git';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sandoPlugin(marketplace, label) {
  const matches = marketplace.plugins?.filter(({ name }) => name === 'sando') ?? [];
  assert.equal(matches.length, 1, `${label} marketplace must contain exactly one Sando plugin`);
  return matches[0];
}

function validateSourcePlugin(file, version, label) {
  const plugin = readJson(file);
  assert.equal(plugin.name, 'sando', `${label} embedded plugin name`);
  assert.equal(plugin.version, version, `${label} embedded plugin version must match tag v${version}`);
}

function sandoEntryRange(content, label) {
  const stack = [];
  const matches = [];
  let inString = false;
  let escaped = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
    } else if (character === '{') {
      stack.push(index);
    } else if (character === '}') {
      const start = stack.pop();
      const entry = JSON.parse(content.slice(start, index + 1));
      if (entry.name === 'sando' && entry.source?.url === SANDO_URL) {
        matches.push({ start, end: index + 1 });
      }
    }
  }

  assert.equal(matches.length, 1, `${label} must contain exactly one Sando entry`);
  return matches[0];
}

function replaceSandoField(entry, field, oldValue, newValue, label) {
  if (oldValue === newValue) return entry;
  const escaped = oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^([ \\t]*"${field}"[ \\t]*:[ \\t]*")${escaped}("[ \\t]*,?[ \\t]*)$`, 'gm');
  assert.equal([...entry.matchAll(pattern)].length, 1, `${label} must occur exactly once in Sando entry`);
  return entry.replace(pattern, (_match, prefix, suffix) => `${prefix}${newValue}${suffix}`);
}

function updateSandoEntry(content, plugin, tag, version, label) {
  const { start, end } = sandoEntryRange(content, label);
  let entry = content.slice(start, end);
  entry = replaceSandoField(entry, 'ref', plugin.source.ref, tag, `${label} ref`);
  if (plugin.version !== undefined) {
    entry = replaceSandoField(entry, 'version', plugin.version, version, `${label} version`);
  }
  return `${content.slice(0, start)}${entry}${content.slice(end)}`;
}

function validateMarketplacePlugin(plugin, expectedPath, label) {
  assert.equal(plugin.source?.source, 'git-subdir', `${label} source type`);
  assert.equal(plugin.source?.url, SANDO_URL, `${label} source URL`);
  assert.equal(plugin.source?.path, expectedPath, `${label} source path`);
  assert.match(plugin.source?.ref ?? '', STABLE_TAG, `${label} source ref`);
}

function compareVersions(left, right) {
  const a = left.split('.').map(BigInt);
  const b = right.split('.').map(BigInt);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] < b[index]) return -1;
    if (a[index] > b[index]) return 1;
  }
  return 0;
}

export function syncSandoMarketplace({ root, source, tag }) {
  const match = tag.match(STABLE_TAG);
  assert(match, `Sando tag must be a stable semantic version: ${tag}`);
  const version = tag.slice(1);

  validateSourcePlugin(
    path.join(source, 'plugins/sando/.codex-plugin/plugin.json'),
    version,
    'Codex',
  );
  validateSourcePlugin(
    path.join(source, 'adapters/claude/sando/.claude-plugin/plugin.json'),
    version,
    'Claude',
  );

  const codexFile = path.join(root, '.agents/plugins/marketplace.json');
  const claudeFile = path.join(root, '.claude-plugin/marketplace.json');
  const codexText = fs.readFileSync(codexFile, 'utf8');
  const claudeText = fs.readFileSync(claudeFile, 'utf8');
  const codex = sandoPlugin(JSON.parse(codexText), 'Codex');
  const claude = sandoPlugin(JSON.parse(claudeText), 'Claude');

  validateMarketplacePlugin(codex, 'plugins/sando', 'Codex Sando');
  validateMarketplacePlugin(claude, 'adapters/claude/sando', 'Claude Sando');
  assert.equal(codex.source.ref, claude.source.ref, 'Codex and Claude Sando refs must match');
  assert.match(claude.version ?? '', /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, 'Claude Sando version');
  assert(
    compareVersions(version, codex.source.ref.slice(1)) >= 0,
    `Sando tag ${tag} is older than current marketplace ref ${codex.source.ref}`,
  );

  const nextCodex = updateSandoEntry(codexText, codex, tag, version, 'Codex');
  const nextClaude = updateSandoEntry(claudeText, claude, tag, version, 'Claude');

  const changed = nextCodex !== codexText || nextClaude !== claudeText;
  if (changed) {
    fs.writeFileSync(codexFile, nextCodex);
    fs.writeFileSync(claudeFile, nextClaude);
  }
  return changed;
}

function option(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) throw new Error(`Missing ${name}`);
  return process.argv[index + 1];
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const changed = syncSandoMarketplace({
    root: option('--root'),
    source: option('--source'),
    tag: option('--tag'),
  });
  console.log(changed ? 'Updated Sando marketplace metadata.' : 'Sando marketplace metadata is current.');
}
