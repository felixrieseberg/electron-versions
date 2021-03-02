#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { EOL } from "os";

import { getVersions } from "./electron-versions";
import { writeMarkdown } from "./write-markdown";
import { getTextTable } from "./table";
import { Options, Version } from "./shared-types";
import { getJson, writeJson } from "./json";

const argv = require("minimist")(process.argv.slice(2));
const help = !!(argv["h"] || argv["help"]);
const filter = argv["f"] || argv["filter"];
const length = argv["l"] || argv["length"] || 10;
const writeMarkdownArg = argv["write-markdown"];
const writeJsonArg = argv["write-json"];
const printJson = argv["json"];
const cwd = getTargetDir();
const mdPath = getWriteDir("md", writeMarkdownArg);
const jsonPath = getWriteDir("json", writeJsonArg);

async function main() {
  if (help) {
    return printHelp();
  }

  const options: Options = {
    cwd,
    filter,
    length,
    onProgress,
    mdPath,
    jsonPath,
  };

  const versions = getVersions(options);

  printResult(versions);

  if (!!writeMarkdownArg) {
    writeMarkdown(versions, options);
    console.log(`${EOL}Wrote versions to ${mdPath}.`);
  }

  if (!!writeJsonArg) {
    writeJson(versions, options);
    console.log(`${EOL}Wrote versions to ${jsonPath}.`);
  }
}

function onProgress(done: number, left: number, total: number) {
  // Non-interactive
  if (process.env.CI || !process.stdout || !process.stdout.clearLine) {
    return;
  }

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(`Checked ${done}/${total} tags`);

  if (left === 0) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
}

function getWriteDir(extension: string, arg?: string | boolean) {
  const target = arg || "electron-versions";

  // Just a bool?
  if (target === true) {
    return path.join(cwd, `electron-versions.${extension}`);
  }

  // Absolute path? Don't mess with it
  if (typeof target === "string" && path.isAbsolute(target)) {
    return target;
  }

  // Not absolute, return path in cwd
  const extMaybe = target.toString().endsWith(`.${extension}`)
    ? ""
    : `.${extension}`;
  return path.join(cwd, `${target}${extMaybe}`);
}

function getTargetDir(): string {
  const firstArg = argv._[0];
  if (firstArg && fs.existsSync(firstArg)) {
    if (fs.existsSync(path.join(firstArg, "package.json"))) {
      return firstArg;
    }
  }

  return process.cwd();
}

function printResult(versions: Array<Version> = []) {
  if (printJson) {
    return console.log(getJson(versions));
  }

  console.log(getTextTable(versions));
}

function printHelp() {
  let text = ``;

  text += `usage: electron-versions [directory] [-l | --length=length]${EOL}`;
  text += `       [-f | --filter=semver filter] [--json]${EOL}`;
  text += `       [--write-markdown [Path]] [--write-json [Path]]${EOL}`;
  text += EOL;
  text += `directory:      By default, the current working directory${EOL}`;
  text += `length:         How many tags to check (default: 10)${EOL}`;
  text += `filter:         A filter passed to semver, like ">=1.2.3"${EOL}`;
  text += `json:           Print result as JSON${EOL}`;
  text += `write-markdown  Write results to a md file (optionally, with a path)${EOL}`;
  text += `write-json      Write results to a json file (optionally, with a path). Speeds up future execution.${EOL}`;
}

main();
