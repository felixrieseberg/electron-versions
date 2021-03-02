#!/usr/bin/env node

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

import { satisfies, rcompare, valid } from "semver";
import { fullVersions } from "electron-to-chromium";
import { readJson } from "./json";
import { Options } from "./shared-types";

/**
 * Get Electron and matching Chromium versions for a
 * given directory
 */
export function getVersions(options: Options) {
  const currentBranch = getCurrentBranch(options);
  const tags = getTags(options);
  const versions = getElectronVersions(tags, options);

  // Switch back to old checkout
  checkout(currentBranch, options);

  return versions;
}

function getTags(options: Options) {
  const { filter, cwd, length } = options;
  const buf = execSync("git tag -l", { cwd });
  let tags = buf.toString().split(/\s/);

  // Remove invalid tags
  tags = tags.filter((v) => valid(v));

  // Maybe filter the tags
  if (filter) {
    tags = tags.filter((v) => satisfies(v, filter));
  }

  // Sort them descending
  tags = tags.sort(rcompare);

  // Get correct length
  tags = tags.slice(0, length);

  // Throw in the default branch
  tags.unshift(getDefaultBranch(options));

  return tags;
}

function getElectronVersions(tags = [], options: Options) {
  const { cwd, onProgress, jsonPath } = options;
  const result = [];
  const jsonData = readJson({ jsonPath });

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];

    // Maybe we already have info about the tag
    // If we don't, parse fresh
    if (jsonData[tag]) {
      result.push({
        tag,
        electron: jsonData[tag].electron,
        chromium: jsonData[tag].chromium,
      });
    } else {
      checkout(tag, options);
      const packageJson = readPackageJson(options);
      const electron =
        (packageJson.devDependencies && packageJson.devDependencies.electron) ||
        (packageJson.dependencies && packageJson.dependencies.electron);

      const chromium = fullVersions[electron];
      result.push({ tag, electron, chromium });
    }

    if (!!onProgress) {
      onProgress(i + 1, tags.length - i - 1, tags.length);
    }
  }

  return result;
}

function getCurrentBranch({ cwd }: Options) {
  return execSync("git branch --show-current", { cwd }).toString().trim();
}

function checkout(tag = "", { cwd }: Options) {
  return execSync(`git checkout ${tag} --quiet`, { cwd });
}

function readPackageJson({ cwd }: Options) {
  const jsonPath = path.join(cwd, "package.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const parsed = JSON.parse(raw);

  return parsed;
}

function getDefaultBranch({ cwd }: Options) {
  return execSync("git symbolic-ref --short HEAD", { cwd }).toString().trim();
}
