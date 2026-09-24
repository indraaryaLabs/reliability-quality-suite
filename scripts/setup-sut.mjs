import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const sut = join(root, '.sut');
const ref = '4089b177e7d6cdd5977467e48d94239c31eacb83';
const url = 'https://github.com/indraaryaLabs/reliability-command-center.git';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with status ${result.status}`);
  }
}

if (!existsSync(sut)) {
  run('git', ['clone', url, sut]);
  run('git', ['checkout', '--detach', ref], { cwd: sut });
}

const head = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: sut,
  encoding: 'utf8',
});
if (head.status !== 0 || head.stdout.trim() !== ref) {
  throw new Error(`Expected .sut at ${ref}. Resolve the existing checkout manually; setup will not overwrite it.`);
}

const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error('Run this script through npm: npm run setup:sut');
}
// The pinned source needs no install scripts; npm 12 may reject project-scoped
// script allowlists, while optional native packages are installed normally.
run(process.execPath, [npmCli, 'ci', '--ignore-scripts', '--prefix', sut]);
