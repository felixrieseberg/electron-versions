#!/usr/bin/env node

const { execSync } = require('child_process')
const { EOL } = require('os');
const fs = require('fs');
const path = require('path');

const { satisfies, rcompare, valid } = require('semver');
const { fullVersions } = require('electron-to-chromium');
const table = require('text-table');

const argv = require('minimist')(process.argv.slice(2));
const help = !!(argv['h'] || argv['help']);
const filter = argv['f'] || argv['filter'];
const length = argv['l'] || argv['length'] || 10;
const printJson = argv['json'];
const cwd = getTargetDir();

async function main() {
  if (help) {
    return printHelp();
  }

  const currentBranch = getCurrentBranch();
  const tags = getTags();
  const versions = getElectronVersions(tags);

  // Switch back to old checkout
  checkout(currentBranch);

  printResult(versions);
}

function getTargetDir() {
  const firstArg = argv._[0]
  if (firstArg && fs.existsSync(firstArg)) {
    if (fs.existsSync(path.join(firstArg, 'package.json'))) {
      return firstArg;
    }
  }

  return process.cwd();
}

function getTags() {
  const buf = execSync('git tag -l', { cwd });
  let tags = buf.toString().split(EOL);

  // Remove invalid tags
  tags = tags.filter((v) => valid(v));

  // Maybe filter the tags
  if (filter) {
    tags = tags.filter((v) => satisfies(v, filter))
  }

  // Sort them descending
  tags = tags.sort(rcompare);

  // Get correct length
  tags = tags.slice(0, length);

  // Throw in the default branch
  tags.push(getDefaultBranch());

  return tags;
}

function getElectronVersions(tags = []) {
  const result = [];

  for (const tag of tags) {
    checkout(tag);
    const packageJson = readPackageJson();
    const electron = (packageJson.devDependencies && packageJson.devDependencies.electron)
      || (packageJson.dependencies && packageJson.dependencies.electron);

    const chromium = fullVersions[electron];
    result.push({ tag, electron, chromium })
  }

  return result;
}

function getCurrentBranch() {
  return execSync('git branch --show-current', { cwd })
    .toString()
    .trim();
}

function checkout(tag = '') {
  return execSync(`git checkout ${tag} --quiet`, { cwd });
}

function readPackageJson() {
  const jsonPath = path.join(cwd, 'package.json');
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const parsed = JSON.parse(raw);

  return parsed;
}

function printResult(versions = []) {
  if (printJson) {
    return console.log(versions);
  }

  const rows = [];

  for (const { tag, electron, chromium } of versions) {
    rows.push([
      `Tag ${tag}`,
      `Electron ${electron || '?'}`,
      `Chromium ${chromium || '?'}`
    ]);
  }

  console.log(table(rows));
}

function getDefaultBranch() {
  return execSync('git symbolic-ref --short HEAD', { cwd })
    .toString()
    .trim();
}

function printHelp() {
  text = ``;

  text += `usage: electron-versions [directory] [-l | --length=length]${EOL}`;
  text += `       [-f | --filter=semver filter] [--json]${EOL}`;
  text += EOL;
  text += `directory:    By default, the current working directory${EOL}`
  text += `length:       How many tags to check (default: 10)${EOL}`;
  text += `filter:       A filter passed to semver, like ">=1.2.3"${EOL}`;
  text += `json:         Print result as JSON${EOL}`;
}

main();
