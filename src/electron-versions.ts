import { spawn } from "@malept/cross-spawn-promise";
import got from "got";

import { parse, satisfies, rcompare, valid } from "semver";
import { readJson } from "./json";
import { Options, Version } from "./shared-types";
import { getTagDetails } from "./tag";

/**
 * Get Electron and matching Chromium versions for a
 * given directory
 */
export async function getVersions(options: Options): Promise<Array<Version>> {
  const tags = await getTags(options);
  const versions = await getElectronVersions(tags, options);

  return versions;
}

async function getTags(options: Options) {
  const { filter, cwd, length, allowedPrereleases } = options;
  const rawTags = await spawn("git", ["tag", "-l"], { cwd });
  let tags = rawTags.trim().split(/\s/);

  // Remove invalid tags
  tags = tags.filter((v) => valid(v));

  // Maybe filter the tags
  if (filter) {
    tags = tags.filter((v) =>
      satisfies(v, filter, {
        includePrerelease: true,
      })
    );
  }

  if (allowedPrereleases.length) {
    tags = tags.filter((v) => {
      const parsed = parse(v);
      if (!parsed.prerelease.length) return true;
      return allowedPrereleases.some((pre) =>
        parsed.prerelease[0].toString().startsWith(pre)
      );
    });
  }

  // Sort them descending
  tags = tags.sort(rcompare);

  // Get correct length
  tags = tags.slice(0, length);

  // Throw in the default branch
  tags.unshift(await getDefaultBranch(options));

  return tags;
}

async function retry<T>(fn: () => Promise<T>, times: number) {
  for (let attempt = 0; attempt < times; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === times - 1) throw err;
    }
  }
}

async function getElectronVersions(
  tags = [],
  options: Options
): Promise<Array<Version>> {
  const { onProgress, jsonPath } = options;
  const result: Array<Version> = [];
  const jsonData = await readJson({ jsonPath });

  const electronIndex = await retry(async () => {
    const response = await got(
      "https://artifacts.electronjs.org/headers/dist/index.json"
    );
    if (response.statusCode !== 200) {
      throw new Error("Failed to fetch Electron index.json");
    }

    return JSON.parse(response.body);
  }, 3);

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];

    // Maybe we already have info about the tag
    // If we don't, parse fresh
    // Except for the default branch, which is the first entry
    if (jsonData[tag] && i > 0) {
      result.push({
        tag,
        electron: jsonData[tag].electron,
        chromium: jsonData[tag].chromium,
        date: jsonData[tag].date || (await getTagDetails(tag, options)).date,
        commit: jsonData[tag].commit || (await getTagDetails(tag, options)).commit,
      });
    } else {
      const packageJson = await readPackageJson(tag, options);
      const electron =
        (packageJson.devDependencies && packageJson.devDependencies.electron) ||
        (packageJson.dependencies && packageJson.dependencies.electron);
      const chromium = electronIndex.find(
        ({ version }) => version === electron
      )?.chrome;
      const { date, commit } = await getTagDetails(tag, options);

      result.push({ tag, electron, chromium, date, commit });
    }

    if (!!onProgress) {
      onProgress(i + 1, tags.length - i - 1, tags.length);
    }
  }

  return result;
}

async function readPackageJson(tag: string, { cwd }: Options) {
  const raw = await spawn("git", ["show", `${tag}:package.json`], { cwd });
  const parsed = JSON.parse(raw);

  return parsed;
}

async function getDefaultBranch({ cwd }: Options) {
  return (
    await spawn("git", ["symbolic-ref", "--short", "HEAD"], { cwd })
  ).trim();
}
