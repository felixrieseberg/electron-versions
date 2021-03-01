#!/usr/bin/env node

const table = require('text-table');
const fs = require('fs');
const path = require('path');

const { getVersions } = require('./electron-versions');

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

  const versions = getVersions({ cwd, filter, length });

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
