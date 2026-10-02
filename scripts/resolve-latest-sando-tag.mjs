import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const STABLE_TAG = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function latestStableSandoTag(refs) {
  const tags = refs
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/).at(-1))
    .filter(Boolean)
    .map((ref) => ref.replace(/^refs\/tags\//, ''))
    .filter((tag) => STABLE_TAG.test(tag));

  if (tags.length === 0) {
    throw new Error('No stable Sando tag found in public Git refs');
  }

  return tags.sort((left, right) => {
    const a = left.match(STABLE_TAG).slice(1).map(BigInt);
    const b = right.match(STABLE_TAG).slice(1).map(BigInt);
    for (let index = 0; index < 3; index += 1) {
      if (a[index] < b[index]) return -1;
      if (a[index] > b[index]) return 1;
    }
    return 0;
  }).at(-1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.stdout.write(`${latestStableSandoTag(fs.readFileSync(0, 'utf8'))}\n`);
}
