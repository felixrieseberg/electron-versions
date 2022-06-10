import * as fs from "fs";

import { Options, Version } from "./shared-types";

export async function readJson({ jsonPath }) {
  let data = {};

  try {
    const raw = await fs.promises.readFile(jsonPath, "utf-8");
    data = JSON.parse(raw);
  } catch (error) {
    // File not found? No biggie
  }

  return data;
}

export function getJson(versions: Array<Version>) {
  const data = {};

  versions.forEach(({ tag, electron, chromium, date, commit }) => {
    data[tag] = { electron, chromium, date, commit };
  });

  return JSON.stringify(data, undefined, 2);
}

export async function writeJson(
  versions: Array<Version>,
  { jsonPath }: Options
) {
  await fs.promises.writeFile(jsonPath, getJson(versions));
}
