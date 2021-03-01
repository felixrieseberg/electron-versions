#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const { satisfies, rcompare, valid } = require("semver");
const { fullVersions } = require("electron-to-chromium");

/**
 * Get Electron and matching Chromium versions for a
 * given directory
 *
 * @param {*} options
 * @param {string} options.filter
 * @param {string} options.cwd
 * @param {number} options.length
 * @returns {Array} versions
 */
function getVersions(options) {
  const currentBranch = getCurrentBranch(options);
  const tags = getTags(options);
  const versions = getElectronVersions(tags, options);

  // Switch back to old checkout
  checkout(currentBranch, options);

  return versions;
}

function getTags({ filter, cwd, length }) {
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
  tags.push(getDefaultBranch({ cwd }));

  return tags;
}

function getElectronVersions(tags = [], { cwd }) {
  const result = [];

  for (const tag of tags) {
    checkout(tag, { cwd });
    const packageJson = readPackageJson({ cwd });
    const electron =
      (packageJson.devDependencies && packageJson.devDependencies.electron) ||
      (packageJson.dependencies && packageJson.dependencies.electron);

    const chromium = fullVersions[electron];
    result.push({ tag, electron, chromium });
  }

  return result;
}

function getCurrentBranch({ cwd }) {
  return execSync("git branch --show-current", { cwd }).toString().trim();
}

function checkout(tag = "", { cwd }) {
  return execSync(`git checkout ${tag} --quiet`, { cwd });
}

function readPackageJson({ cwd }) {
  const jsonPath = path.join(cwd, "package.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const parsed = JSON.parse(raw);

  return parsed;
}

function getDefaultBranch({ cwd }) {
  return execSync("git symbolic-ref --short HEAD", { cwd }).toString().trim();
}

module.exports = {
  getVersions,
};
