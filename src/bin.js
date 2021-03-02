#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { EOL } = require("os");

const { getVersions } = require("./electron-versions");
const { writeMarkdown } = require("./write-markdown");
const { getTextTable } = require("./table");

const argv = require("minimist")(process.argv.slice(2));
const help = !!(argv["h"] || argv["help"]);
const filter = argv["f"] || argv["filter"];
const length = argv["l"] || argv["length"] || 10;
const write = argv["w"] || argv["write"];
const printJson = argv["json"];
const cwd = getTargetDir();

async function main() {
  if (help) {
    return printHelp();
  }

  const versions = getVersions({ cwd, filter, length, onProgress });

  printResult(versions);

  if (!!write) {
    const filePath = getWriteDir();
    writeMarkdown(versions, { filePath });
    console.log(`${EOL}Wrote versions to ${filePath}.`);
  }
}

function onProgress(done, left, total) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`Checked ${done}/${total} tags`);

  if (left === 0) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }
}

function getWriteDir() {
  // Absolute path? Don't mess with it
  if (path.isAbsolute(write)) {
    return write;
  }

  // Not absolute, return path in cwd
  return path.join(cwd, write);
}

function getTargetDir() {
  const firstArg = argv._[0];
  if (firstArg && fs.existsSync(firstArg)) {
    if (fs.existsSync(path.join(firstArg, "package.json"))) {
      return firstArg;
    }
  }

  return process.cwd();
}

function printResult(versions = []) {
  if (printJson) {
    return console.log(versions);
  }

  console.log(getTextTable(versions));
}

function printHelp() {
  text = ``;

  text += `usage: electron-versions [directory] [-l | --length=length]${EOL}`;
  text += `       [-f | --filter=semver filter] [--json]${EOL}`;
  text += EOL;
  text += `directory:    By default, the current working directory${EOL}`;
  text += `length:       How many tags to check (default: 10)${EOL}`;
  text += `filter:       A filter passed to semver, like ">=1.2.3"${EOL}`;
  text += `json:         Print result as JSON${EOL}`;
}

main();
